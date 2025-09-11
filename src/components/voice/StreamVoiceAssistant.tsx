"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import {
  RiMicLine,
  RiMicOffLine,
  RiVolumeUpLine,
  RiCloseLine,
} from "@remixicon/react";
import { useTranslations } from "next-intl";
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  CallControls,
  SpeakerLayout,
  StreamCall,
  useCallStateHooks,
  useCall,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

interface StreamVoiceAssistantProps {
  funeralId: string;
  onCommand?: (command: string, data?: any) => void;
}

// Main component that manages the Stream client
export function StreamVoiceAssistant({
  funeralId,
  onCommand,
}: StreamVoiceAssistantProps) {
  const t = useTranslations();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAI, setHasAI] = useState(false);

  // Initialize Stream client
  const initializeClient = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get credentials from backend
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeralId,
          action: "connect",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to connect to voice assistant"
        );
      }

      const result = await response.json();
      console.log("Backend response:", result);

      // Create Stream client
      const streamClient = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
        token: result.token,
        user: {
          id: "user",
          name: "User",
        },
      });

      setClient(streamClient);
      setHasAI(result.hasAI || false);
      setIsConnected(true);
      console.log("Stream client initialized successfully");
    } catch (err) {
      console.error("Error initializing Stream client:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Kon niet verbinden met voice assistant"
      );
    } finally {
      setIsLoading(false);
    }
  }, [funeralId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [client]);

  if (!isConnected || !client) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Voice Assistant</h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-gray-400"
              } ${isLoading ? "animate-pulse" : ""}`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? "Verbonden" : "Niet verbonden"}
            </span>
          </div>
        </div>

        {!isConnected && (
          <Button
            onClick={initializeClient}
            disabled={isLoading}
            className="w-full mb-4"
          >
            <RiVolumeUpLine className="h-4 w-4 mr-2" />
            {isLoading ? "Verbinden..." : "Verbind met Voice Assistant"}
          </Button>
        )}

        {error && (
          <div className="bg-red-50 p-3 rounded-lg mt-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>
            Tip: Zorg dat je Stream API keys correct zijn ingesteld in je{" "}
            <code className="font-mono">.env.local</code> bestand.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallInterface
        funeralId={funeralId}
        onCommand={onCommand}
        hasAI={hasAI}
      />
    </StreamVideo>
  );
}

// Call interface component that handles the actual call
function CallInterface({
  funeralId,
  onCommand,
  hasAI,
}: {
  funeralId: string;
  onCommand?: (command: string, data?: any) => void;
  hasAI: boolean;
}) {
  const [call, setCall] = useState<Call | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  const client = useStreamVideoClient();

  // Process voice command
  const processVoiceCommand = useCallback(
    async (transcript: string) => {
      try {
        console.log("Processing voice command:", transcript);

        const response = await fetch("/api/voice-assistant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            funeralId,
            action: "process_command",
            transcript,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Voice command error:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
          throw new Error(
            errorData.error || `Failed to process command (${response.status})`
          );
        }

        const result = await response.json();
        console.log("Command result:", result);

        setLastCommand(result.message);

        // Call the onCommand callback if provided
        if (onCommand && result.action !== "unknown") {
          onCommand(result.action, result.data);
        }

        return result;
      } catch (err) {
        console.error("Error processing voice command:", err);
        setError("Fout bij verwerken van voice command");
        return null;
      }
    },
    [funeralId, onCommand]
  );

  // Join call
  const joinCall = useCallback(async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get call ID from backend
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeralId,
          action: "connect",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get call ID");
      }

      const result = await response.json();
      const newCallId = result.callId;
      setCallId(newCallId);

      // Create call object
      const newCall = client.call("default", newCallId);
      setCall(newCall);

      // Join the call
      await newCall.join({ create: false });
      console.log("Joined call successfully");

      // Enable microphone
      await newCall.microphone.enable();
      console.log("Microphone enabled");

      setIsInCall(true);
      console.log("Call state updated to in-call");
    } catch (err) {
      console.error("Failed to join call:", err);
      setError(
        "Kon niet deelnemen aan gesprek: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  }, [client, funeralId]);

  // Leave call
  const leaveCall = useCallback(async () => {
    if (!call) return;

    try {
      console.log("Leaving call...");
      await call.leave();
      setIsInCall(false);
      setCall(null);
      setCallId(null);
      console.log("Left call successfully");
    } catch (err) {
      console.error("Failed to leave call:", err);
      // Still set to not in call even if leave fails
      setIsInCall(false);
      setCall(null);
      setCallId(null);
    }
  }, [call]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (call && isInCall) {
        call.leave();
      }
    };
  }, [call, isInCall]);

  if (!isInCall) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Voice Assistant</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              Verbonden {hasAI ? "met AI" : "(basis)"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              🎤 Klik op "Deelnemen aan gesprek" om te beginnen met praten tegen
              de assistant.
            </p>
            {hasAI && (
              <p className="text-sm text-green-700 mt-2">
                ✅ AI voice assistant is beschikbaar!
              </p>
            )}
            {!hasAI && (
              <p className="text-sm text-orange-700 mt-2">
                ⚠️ Alleen basis audio - geen AI voice assistant
              </p>
            )}
          </div>

          <Button
            onClick={joinCall}
            disabled={isLoading}
            className="w-full mb-2"
          >
            <RiMicLine className="h-4 w-4 mr-2" />
            {isLoading ? "Verbinden..." : "Deelnemen aan gesprek"}
          </Button>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>
              Tip: Spreek duidelijk en wacht even na je vraag voor een antwoord.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Voice Assistant</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm text-gray-600">
            In gesprek {hasAI ? "met AI" : "(basis)"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-700">
            🎤 Je bent nu verbonden! Spreek vrij tegen de assistant.
          </p>
          {hasAI && (
            <p className="text-sm text-green-600 mt-1">
              ✅ AI voice assistant is actief - je hoort antwoorden via je
              speakers
            </p>
          )}
          {!hasAI && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Alleen basis audio - geen AI antwoorden beschikbaar
            </p>
          )}
        </div>

        {lastCommand && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Laatste actie:</strong> {lastCommand}
            </p>
          </div>
        )}

        {/* Stream Video Components */}
        {call && (
          <StreamCall call={call}>
            <div className="space-y-2">
              <SpeakerLayout />
              <CallControls />
              <VoiceCommandHandler
                onVoiceCommand={processVoiceCommand}
                hasAI={hasAI}
              />
            </div>
          </StreamCall>
        )}

        <div className="space-y-2">
          <Button onClick={leaveCall} variant="outline" className="w-full">
            <RiCloseLine className="h-4 w-4 mr-2" />
            Verlaat gesprek
          </Button>

          <Button
            onClick={() =>
              processVoiceCommand(
                "voeg notitie toe: test notitie via voice assistant"
              )
            }
            variant="outline"
            className="w-full text-xs"
          >
            <RiMicLine className="h-3 w-3 mr-1" />
            Test Database Update
          </Button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Call ID: {callId}</p>
          <p className="mt-1">
            {hasAI
              ? "Tip: Spreek duidelijk en wacht even na je vraag voor een AI antwoord."
              : "Tip: Audio streaming is actief, maar geen AI voice assistant beschikbaar."}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Voice Command Handler Component
function VoiceCommandHandler({
  onVoiceCommand,
  hasAI,
}: {
  onVoiceCommand: (transcript: string) => void;
  hasAI: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Simple voice input simulation for now
  // In a real implementation, this would integrate with Stream's voice recognition
  const handleVoiceInput = () => {
    if (!hasAI) {
      alert(
        "AI voice assistant is not available. Use the test button instead."
      );
      return;
    }

    const userInput = prompt("Type your voice command (simulated):");
    if (userInput) {
      onVoiceCommand(userInput);
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">
        {hasAI ? "AI Voice Assistant Active" : "Voice Assistant Not Available"}
      </p>
      <Button
        onClick={handleVoiceInput}
        disabled={!hasAI}
        variant="outline"
        className="w-full text-sm"
      >
        <RiMicLine className="h-4 w-4 mr-2" />
        {hasAI ? "Simulate Voice Command" : "AI Not Available"}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        {hasAI
          ? "Click to simulate a voice command (e.g., 'voeg notitie toe: test')"
          : "AI voice assistant is not configured. Check your OpenAI API key."}
      </p>
    </div>
  );
}

// Wrapper component for compatibility
export function StreamVoiceAssistantWrapper({
  funeralId,
  onCommand,
}: StreamVoiceAssistantProps) {
  return <StreamVoiceAssistant funeralId={funeralId} onCommand={onCommand} />;
}
