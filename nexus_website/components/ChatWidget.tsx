"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { MessageCircle, X, Minimize2, Sparkles, RefreshCw } from "lucide-react";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current ??= `ai-${crypto.randomUUID()}`;
  }, []);

  const logMessage = async (
    role: "user" | "assistant",
    text: string,
    hasImage: boolean
  ) => {
    try {
      await fetch("/api/ai-chat/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          role,
          text,
          language,
          hasImage,
        }),
      });
    } catch (err) {
      console.warn("AI chat log failed:", err);
    }
  };

  const welcomeMessageText = useMemo(
    () =>
      language === "fr"
        ? "Bonjour ! Je suis l'assistant IA de NEXUS. Je peux vous aider sur toutes nos divisions, nos programmes, nos services, nos opportunités et les démarches à suivre sur le site. Si vous êtes bloqué, je peux vous guider étape par étape. Vous pouvez m'écrire, me parler ou m'envoyer une image !"
        : "Hello! I'm the NEXUS AI Assistant. I can help with every NEXUS division, our programs, services, opportunities, and how to use the site. If you're stuck, I can guide you through the next steps. You can type, speak, or upload images!",
    [language]
  );

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome-1",
      role: "assistant",
      text: welcomeMessageText,
      timestamp: new Date(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleOpenAi = () => setIsOpen(true);
    window.addEventListener("open-nexus-ai", handleOpenAi);
    return () => window.removeEventListener("open-nexus-ai", handleOpenAi);
  }, []);

  const handleSend = async (
    text: string,
    image?: { mimeType: string; base64Data: string; previewUrl: string }
  ) => {
    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: Message = {
      id: userMsgId,
      role: "user",
      text,
      imageUrl: image?.previewUrl,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsTyping(true);
    logMessage("user", text, Boolean(image));

    try {
      // Format messages history for API call
      // Only include user messages and AI responses, skip welcome messages
      const conversationMessages = updatedMessages.filter(
        (m) => m.role === "user" || (m.role === "assistant" && m.id.startsWith("assistant-"))
      );
      const formattedHistory = conversationMessages.map((m) => ({
        role: (m.role === "user" ? "user" : "model") as "user" | "model",
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedHistory,
          image: image
            ? { mimeType: image.mimeType, base64Data: image.base64Data }
            : undefined,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        videos: Array.isArray(data.relevantVideos) ? data.relevantVideos : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      logMessage("assistant", data.reply, false);
    } catch (err: unknown) {
      const error = err as Error;
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        text:
          language === "fr"
            ? `Désolé, une erreur est survenue : ${error?.message || "Veuillez réessayer."}`
            : `Sorry, an error occurred: ${error?.message || "Please try again."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: welcomeMessageText,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-nexus-cyan text-nexus-dark shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-nexus-cyan-bright focus:outline-none"
          aria-label="Open NEXUS Assistant"
        >
          <span className="absolute -inset-1 animate-ping rounded-full bg-nexus-cyan/30 opacity-75" />
          <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-nexus-navy text-[9px] font-bold text-nexus-cyan-bright">
            AI
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="flex h-[85vh] max-h-[560px] w-[92vw] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-nexus-cyan/30 bg-nexus-dark shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-nexus-cyan/20 bg-nexus-navy px-4 py-3 text-nexus-white">
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-nexus-cyan/40">
                <Image
                  src="/images/logo/nexus-logo-sm.jpg"
                  alt="NEXUS AI"
                  width={32}
                  height={32}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-wide">
                    NEXUS AI Assistant
                  </h3>
                  <Sparkles className="h-3.5 w-3.5 text-nexus-cyan-bright" />
                </div>
                <p className="text-[11px] text-nexus-cyan-bright font-medium">
                  {language === "fr" ? "En ligne · Posez votre question" : "Online · Ask anything"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title={language === "fr" ? "Effacer la discussion" : "Clear chat"}
                className="rounded-md p-1.5 text-nexus-gray/70 hover:bg-nexus-dark hover:text-nexus-cyan transition"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={language === "fr" ? "Fermer" : "Close"}
                className="rounded-md p-1.5 text-nexus-gray/70 hover:bg-nexus-dark hover:text-nexus-white transition"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={language === "fr" ? "Fermer" : "Close"}
                className="rounded-md p-1.5 text-nexus-gray/70 hover:bg-nexus-dark hover:text-nexus-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-nexus-dark p-4 space-y-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} language={language} />
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-nexus-cyan">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-navy text-nexus-cyan border border-nexus-cyan/30">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl bg-nexus-gray px-4 py-2.5 text-nexus-navy border border-nexus-cyan/20">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-nexus-cyan animate-bounce" />
                    <span
                      className="h-2 w-2 rounded-full bg-nexus-cyan animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-nexus-cyan animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput
            onSend={handleSend}
            disabled={isTyping}
            language={language}
          />
        </div>
      )}
    </div>
  );
}
