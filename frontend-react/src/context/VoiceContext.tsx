"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import type { VoiceStatus } from "@/types";
import { routeAliases } from "@/lib/constants";

interface VoiceContextType {
  status: VoiceStatus;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string, lang?: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const SpeechRecognition = typeof window !== "undefined"
  ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
  : undefined;

const isSupported = !!SpeechRecognition;

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();

  const initRecognition = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setStatus("listening");
    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setTranscript(result);
      if (event.results[0].isFinal) {
        setStatus("processing");
        processCommand(result);
      }
    };
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    };
    recognition.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
  }, [status]);

  const speak = useCallback((text: string, lang = "en-US") => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const processCommand = useCallback(async (command: string) => {
    const lower = command.toLowerCase().trim();
    let handled = false;

    for (const [alias, path] of Object.entries(routeAliases)) {
      if (lower.includes(alias)) {
        navigate(path);
        speak(`Navigating to ${alias}`, "en-US");
        handled = true;
        break;
      }
    }

    if (!handled) {
      if (lower.includes("dark")) {
        toast({ title: "Theme", description: "Switching to dark mode" });
        handled = true;
      } else if (lower.includes("light")) {
        toast({ title: "Theme", description: "Switching to light mode" });
        handled = true;
      } else if (lower.includes("system")) {
        toast({ title: "Theme", description: "Using system theme" });
        handled = true;
      } else if (lower.includes("hindi") || lower.includes("हिंदी")) {
        toast({ title: "Language", description: "Switching to Hindi" });
        handled = true;
      } else if (lower.includes("english")) {
        toast({ title: "Language", description: "Switching to English" });
        handled = true;
      } else if (lower.includes("refresh") || lower.includes("reload")) {
        window.location.reload();
        handled = true;
      } else if (lower.includes("help") || lower.includes("क्या")) {
        speak("Say go to soil testing, crop recommendation, weather, disease detection, market, or calendar. Say switch to dark mode, light mode, or system. Say switch to Hindi or English.", "en-US");
        handled = true;
      }
    }

    if (!handled) {
      speak(`Sorry, I didn't understand: ${command}`, "en-US");
    }

    setTimeout(() => setStatus("idle"), 500);
  }, [navigate, speak]);

  const startListening = useCallback(() => {
    if (!isSupported) { setStatus("unsupported"); return; }
    initRecognition();
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch { }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setStatus("idle");
  }, []);

  const toggleListening = useCallback(() => {
    if (status === "listening") stopListening();
    else startListening();
  }, [status, startListening, stopListening]);

  useEffect(() => initRecognition, []);

  return (
    <VoiceContext.Provider value={{ status, transcript, isSupported, startListening, stopListening, toggleListening, speak }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) throw new Error("useVoice must be used within a VoiceProvider");
  return context;
}