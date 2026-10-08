"use client";

import { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import AudioRecorder from "./AudioRecorder";

type ChatInputProps = {
  onSend: (text: string, image?: { mimeType: string; base64Data: string; previewUrl: string }) => void;
  disabled?: boolean;
  language: "en" | "fr";
};

export default function ChatInput({
  onSend,
  disabled = false,
  language,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState<{
    mimeType: string;
    base64Data: string;
    previewUrl: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(language === "fr" ? "Veuillez sélectionner une image." : "Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(",")[1];
      setSelectedImage({
        mimeType: file.type,
        base64Data,
        previewUrl: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTranscript = (transcriptText: string) => {
    setText((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
  };

  const handleSubmit = () => {
    if ((!text.trim() && !selectedImage) || disabled) return;

    onSend(text.trim(), selectedImage || undefined);
    setText("");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-nexus-cyan/20 bg-nexus-dark p-3">
      {selectedImage && (
        <div className="mb-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage.previewUrl}
            alt="Upload preview"
            className="h-16 w-16 rounded-lg object-cover border border-nexus-cyan/40"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-1.5 rounded-xl border border-nexus-cyan/30 bg-nexus-navy/40 p-2 focus-within:border-nexus-cyan transition">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title={language === "fr" ? "Ajouter une image" : "Attach image"}
          aria-label="Attach image"
          className="rounded-full p-2 text-nexus-cyan hover:bg-nexus-navy/60 transition disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5" />
        </button>

        <AudioRecorder
          onTranscript={handleTranscript}
          language={language}
          disabled={disabled}
        />

        <textarea
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            language === "fr"
              ? "Posez votre question sur NEXUS..."
              : "Ask anything about NEXUS..."
          }
          rows={1}
          className="max-h-24 flex-1 resize-none bg-transparent px-2 py-1 text-sm text-nexus-white outline-none placeholder:text-nexus-gray/50"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!text.trim() && !selectedImage) || disabled}
          title={language === "fr" ? "Envoyer" : "Send"}
          aria-label="Send message"
          className="rounded-full bg-nexus-cyan p-2 text-nexus-dark hover:bg-nexus-cyan-bright transition disabled:opacity-40 disabled:hover:bg-nexus-cyan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
