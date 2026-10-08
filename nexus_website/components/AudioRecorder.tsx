"use client";

import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

type AudioRecorderProps = {
  onTranscript: (text: string) => void;
  language: "en" | "fr";
  disabled?: boolean;
};

// Minimal SpeechRecognition type for browser compatibility
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: { results: SpeechRecognitionResultList }) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: {
    length: number;
    [index: number]: { transcript: string };
  };
};

interface IWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export default function AudioRecorder({
  onTranscript,
  language,
  disabled = false,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startRecording = () => {
    if (typeof window === "undefined") return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert(
        language === "fr"
          ? "La reconnaissance vocale n'est pas supportée par votre navigateur."
          : "Voice recognition is not supported in your browser."
      );
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "fr" ? "fr-FR" : "en-US";

    recognition.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscript(transcript);
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={disabled}
      title={
        isRecording
          ? language === "fr"
            ? "Arrêter l'enregistrement"
            : "Stop recording"
          : language === "fr"
          ? "Enregistrer votre voix"
          : "Record your voice"
      }
      aria-label={isRecording ? "Stop recording" : "Record voice"}
      className={`rounded-full p-2 transition ${
        isRecording
          ? "bg-red-500 text-white animate-pulse"
          : "text-nexus-cyan hover:bg-nexus-navy/40"
      } disabled:opacity-50`}
    >
      {isRecording ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
}
