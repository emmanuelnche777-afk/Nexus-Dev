"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import PageHeader from "@/components/PageHeader";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AcademyAskQuestion() {
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const welcomeMessageText = useMemo(
    () =>
      language === "fr"
        ? "Bonjour ! Je suis l'assistant IA de NEXUS. Je peux répondre à vos questions sur nos formations (Academy), nos services (Tech Hub), nos projets (Foundation) et notre mentorat, ou vous guider sur le site. Vous pouvez m'écrire, me parler ou m'envoyer une image !"
        : "Hello! I'm the NEXUS AI Assistant. I can answer your questions about our training (Academy), services (Tech Hub), community work (Foundation), mentorship, or guide you around the site. You can type, speak, or upload images!",
    [language]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: welcomeMessageText,
      timestamp: new Date(),
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [chatInputKey, setChatInputKey] = useState(0);

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        text: welcomeMessageText,
        timestamp: new Date(),
      },
    ]);
    setChatInputKey((key) => key + 1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (
    text: string,
    image?: { mimeType: string; base64Data: string; previewUrl: string }
  ) => {
    if (!text.trim() && !image) return;
    setIsSending(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const conversation = [...messages, userMsg];
    const firstUserMessageIndex = conversation.findIndex((message) => message.role === "user");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.slice(firstUserMessageIndex).map((message) => ({
            role: message.role === "assistant" ? "model" : "user",
            text: message.text,
          })),
          image,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: language === "fr"
          ? "Désolé, une erreur s'est produite. Veuillez réessayer."
          : "Sorry, an error occurred. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-nexus-white min-h-screen flex flex-col">
      <PageHeader
        title={language === "fr" ? "Discuter avec l'Assistant IA" : "Chat with AI Assistant"}
        description={language === "fr"
          ? "Posez vos questions sur NEXUS, ses divisions, ses programmes, ses services et les démarches à suivre. L'assistant peut vous guider étape par étape."
          : "Ask about any part of NEXUS, including our divisions, programs, services, and how to take the next step. The assistant can guide you step by step."}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Academy", href: "/academy" },
          { label: language === "fr" ? "Discuter avec l'IA" : "Chat with AI" },
        ]}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 py-8 px-4 sm:px-6">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClearChat}
              disabled={isSending}
              className="inline-flex items-center gap-2 rounded-lg border border-nexus-navy/15 px-3 py-2 text-sm font-medium text-nexus-navy transition hover:border-nexus-cyan hover:text-nexus-cyan disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={language === "fr" ? "Effacer la conversation" : "Clear conversation"}
            >
              <RotateCcw className="h-4 w-4" />
              {language === "fr" ? "Effacer la conversation" : "Clear chat"}
            </button>
          </div>
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              language={language}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-nexus-cyan/20 bg-nexus-gray p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput key={chatInputKey} onSend={handleSend} language={language} disabled={isSending} />
          <div className="mt-3 flex items-center justify-between text-xs text-nexus-navy/60">
            <span>
              {language === "fr"
                ? "Vous pouvez également contacter notre support client directement."
                : "You can also contact our customer support directly."}
            </span>
            <Link
              href="/contact?department=academy"
              className="inline-flex items-center gap-1 text-nexus-cyan hover:gap-2 transition"
            >
              {language === "fr" ? "Service Client" : "Customer Service"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
