import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateChatResponse, ChatMessageInput, ImageInput } from "@/lib/ai/gemini";
import { retrievePublicKnowledge } from "@/lib/ai/public-knowledge";
import { isSensitiveAssistantRequest } from "@/lib/ai/security";

function getSessionId(req: NextRequest): string {
  const existing = req.headers.get("x-session-id")?.trim();
  if (existing) return existing.slice(0, 128);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent")?.slice(0, 80) || "unknown";
  return `sess-${ip}-${ua}`.replace(/\s/g, "-").slice(0, 100);
}

const CONFIDENTIALITY_REFUSAL_EN = "I don't have access to that information. I can only help you with publicly available information about NEXUS programs, divisions, and services.";
const CONFIDENTIALITY_REFUSAL_FR = "Je n'ai pas accès à ces informations. Je peux uniquement vous aider avec les informations publiques sur les programmes, divisions et services de NEXUS.";

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 10_000_000) {
      return NextResponse.json({ error: "The chat request is too large." }, { status: 413 });
    }

    const body = await req.json();
    const { messages, image, language = "en" } = body as {
      messages: ChatMessageInput[];
      image?: ImageInput;
      language?: "en" | "fr";
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user" || typeof lastMessage.text !== "string") {
      return NextResponse.json({ error: "The last chat message must be a user message." }, { status: 400 });
    }
    if (messages.length > 20 || messages.some((message) =>
      !message || !["user", "assistant", "model"].includes(message.role) ||
      typeof message.text !== "string" || message.text.length > 4_000
    ) || messages.reduce((total, message) => total + (typeof message?.text === "string" ? message.text.length : 0), 0) > 12_000) {
      return NextResponse.json({ error: "The chat history is too large or contains an invalid message." }, { status: 400 });
    }

    const userMessages = messages.filter((message) => message.role === "user");
    if (userMessages.some((message) => isSensitiveAssistantRequest(message.text))) {
      const refusal =
        language === "fr"
          ? CONFIDENTIALITY_REFUSAL_FR
          : CONFIDENTIALITY_REFUSAL_EN;
      return NextResponse.json({ reply: refusal });
    }

    if (image && (
      typeof image.base64Data !== "string" || image.base64Data.length > 8_000_000 ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(image.mimeType)
    )) {
      return NextResponse.json({ error: "The image is invalid or too large." }, { status: 400 });
    }

    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    const { context, relevantVideos } = await retrievePublicKnowledge(lastUserMessage?.text || "");
    const reply = await generateChatResponse(messages, image, language, context);

    try {
      const sessionId = getSessionId(req);
      const userMessage = lastMessage?.text || "";
      await prisma.adminChatMessage.create({
        data: {
          sessionId,
          language: language as string,
          userMessage,
          aiReply: reply,
          hasImage: Boolean(image),
        },
      });
    } catch (logErr) {
      console.error("Failed to log conversation:", logErr);
    }

    const response = { 
      reply,
      relevantVideos: relevantVideos.length > 0 ? relevantVideos : undefined,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("API Chat Error:", err?.message || err);

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Sorry, I encountered an issue generating a response. Please try again.",
      },
      { status: 500 }
    );
  }
}
