"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { RiMicLine, RiMicOffLine, RiVolumeUpLine } from "@remixicon/react";
import { useTranslations } from "next-intl";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

interface VoiceAssistantProps {
  funeralId: string;
  onCommand?: (command: string, data?: any) => void;
}

export function VoiceAssistant({ funeralId, onCommand }: VoiceAssistantProps) {
  const t = useTranslations();
  const { processVoiceCommand } = useVoiceCommands(funeralId);
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startListening = async () => {
    try {
      setError(null);

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microfoon toegang geweigerd");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    // Stop any current speech
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "nl-NL"; // Dutch
    utterance.rate = 0.9; // Slightly slower for better understanding
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // For now, we'll simulate a transcript since we don't have speech-to-text
      // In a real implementation, you'd use a service like Google Speech-to-Text
      // or Azure Speech Services to convert audio to text
      const simulatedTranscript = "Hallo, hoe gaat het met de uitvaart?";
      setTranscript(simulatedTranscript);

      // Process the voice command using the hook
      const result = await processVoiceCommand(simulatedTranscript);

      if (result.success) {
        setResponse(result.message);
        onCommand?.(simulatedTranscript, result.data);

        // Automatically speak the response
        speakText(result.message);
      } else {
        setResponse(result.message);
        onCommand?.(simulatedTranscript, result.data);

        // Speak the error message
        speakText(result.message);
      }
    } catch (err) {
      console.error("Error processing audio:", err);
      setError("Fout bij verwerken van audio");
    } finally {
      setIsProcessing(false);
    }
  };

  const connectToVoiceAssistant = async () => {
    try {
      // No API call needed, just connect locally
      setIsConnected(true);
      setError(null);
    } catch (err) {
      console.error("Error connecting to voice assistant:", err);
      setError("Kon niet verbinden met voice assistant");
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Voice Assistant</h3>
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isConnected ? "Verbonden" : "Niet verbonden"}
          </span>
        </div>
      </div>

      {!isConnected && (
        <Button onClick={connectToVoiceAssistant} className="w-full mb-4">
          <RiVolumeUpLine className="h-4 w-4 mr-2" />
          Verbind met Voice Assistant
        </Button>
      )}

      {isConnected && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <Button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-16 h-16 rounded-full ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {isListening ? (
                <RiMicOffLine className="h-6 w-6" />
              ) : (
                <RiMicLine className="h-6 w-6" />
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isListening ? "Luisteren..." : "Klik om te spreken"}
            </p>
            {isProcessing && (
              <p className="text-sm text-blue-600">Verwerken...</p>
            )}
            {isSpeaking && (
              <p className="text-sm text-green-600">Assistant spreekt...</p>
            )}
          </div>

          {transcript && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Jij zei:</p>
              <p className="text-sm text-gray-700">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-900">
                  Assistant antwoordt:
                </p>
                {isSpeaking && (
                  <Button
                    onClick={stopSpeaking}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Stop
                  </Button>
                )}
              </div>
              <p className="text-sm text-blue-700">{response}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Beschikbare commando's:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"Voeg notitie toe: [inhoud]"</li>
          <li>"Voeg kosten toe: [bedrag] voor [leverancier]"</li>
          <li>"Zoek document: [naam]"</li>
          <li>"Toon scenario voor [onderdeel]"</li>
        </ul>
      </div>
    </Card>
  );
}
