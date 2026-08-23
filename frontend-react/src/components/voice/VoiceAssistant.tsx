"use client";

import { useState, Fragment } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useVoice } from "@/context/VoiceContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const statusMessages = {
  idle: { en: "Tap to start listening", hi: "सुनना शुरू करने के लिए टैप करें" },
  listening: { en: "Listening...", hi: "सुन रहा हूँ..." },
  processing: { en: "Processing...", hi: "प्रोसेसिंग..." },
  error: { en: "Error occurred. Tap to retry.", hi: "त्रुटि हुई। पुनः प्रयास करने के लिए टैप करें।" },
  unsupported: { en: "Voice not supported in this browser", hi: "इस ब्राउज़र में वॉइस समर्थित नहीं है" },
};

export function VoiceAssistant() {
  const { language } = useLanguage();
  const { status, transcript, isSupported, startListening, stopListening, toggleListening, speak } = useVoice();
  const [isOpen, setIsOpen] = useState(false);

  const currentMessage = statusMessages[status]?.[language] ?? statusMessages.idle[language];

  const handleOverlayClick = () => {
    if (status === "listening") stopListening();
    else if (status === "idle" || status === "error") startListening();
  };

  return (
    <Fragment>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-fixed h-14 w-14 rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground",
          status === "listening" && "animate-pulse ring-4 ring-primary/30",
        )}
        aria-label="Open voice assistant"
        aria-expanded={isOpen}
      >
        {status === "listening" ? (
          <Mic className="h-7 w-7 animate-pulse" />
        ) : status === "processing" ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : status === "error" ? (
          <MicOff className="h-7 w-7 text-destructive" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader className="text-center">
            <DialogTitle className="flex items-center justify-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Voice Assistant
            </DialogTitle>
            <DialogDescription>
              {currentMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              className={cn(
                "rounded-xl p-6 text-center transition-all",
                "bg-muted",
                status === "listening" && "bg-primary/10 ring-2 ring-primary/20",
                status === "processing" && "bg-primary/5",
              )}
              onClick={handleOverlayClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOverlayClick()}
              aria-label={currentMessage}
            >
              {status === "listening" ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                    <span className="h-3 w-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="h-3 w-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                  <p className="text-lg font-medium">
                    {language === "hi" ? "सुन रहा हूँ..." : "Listening..."}
                  </p>
                  {transcript && (
                    <p className="text-sm text-muted-foreground italic max-h-20 overflow-auto">
                      &ldquo;{transcript}&rdquo;
                    </p>
                  )}
                </div>
              ) : status === "processing" ? (
                <div className="space-y-2">
                  <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                  <p className="text-lg font-medium">
                    {language === "hi" ? "प्रोसेसिंग..." : "Processing..."}
                  </p>
                </div>
              ) : status === "error" ? (
                <div className="space-y-2">
                  <MicOff className="h-8 w-8 mx-auto text-destructive" />
                  <p className="text-lg font-medium text-destructive">
                    {language === "hi" ? "त्रुटि हुई" : "Error occurred"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "hi" ? "पुनः प्रयास करने के लिए टैप करें" : "Tap to retry"}
                  </p>
                </div>
              ) : isSupported ? (
                <div className="space-y-2">
                  <Mic className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-lg font-medium">{currentMessage}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === "hi"
                      ? "कहें: मिट्टी जाँचें, फसल सुझाएं, मौसम, रोग पहचानें"
                      : 'Say: "Test soil", "Recommend crop", "Weather", "Detect disease"'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <MicOff className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-lg font-medium">{currentMessage}</p>
                </div>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => speak(language === "hi" ? "मदद" : "Help", language === "hi" ? "hi-IN" : "en-US")}
                className="flex-1"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Help
              </Button>
              <Button
                variant={status === "listening" ? "destructive" : "secondary"}
                size="sm"
                onClick={toggleListening}
                disabled={!isSupported}
                className="flex-1"
              >
                {status === "listening" ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    {status === "processing" ? "Processing..." : "Start"}
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>{language === "hi" ? "उपलब्ध कमांड:" : "Available commands:"}</p>
              <ul className="text-left space-y-1 pl-4">
                {language === "en" ? (
                  <>
                    <li>• "Go to soil testing" / "Go to crop recommendation"</li>
                    <li>• "Open weather" / "Open calendar" / "Open market"</li>
                    <li>• "Switch to dark mode" / "light mode" / "system"</li>
                    <li>• "Switch to Hindi" / "Switch to English"</li>
                    <li>• "Refresh" / "Help"</li>
                  </>
                ) : (
                  <>
                    <li>• "मिट्टी जाँचें" / "फसल सुझाएं"</li>
                    <li>• "मौसम खोलें" / "कैलेंडर खोलें" / "बाजार खोलें"</li>
                    <li>• "डार्क मोड" / "लाइट मोड" / "सिस्टम"</li>
                    <li>• "हिंदी में बोलें" / "अंग्रेजी में बोलें"</li>
                    <li>• "रिफ्रेश करें" / "मदद"</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}