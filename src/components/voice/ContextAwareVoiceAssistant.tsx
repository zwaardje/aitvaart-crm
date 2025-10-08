"use client";

import { useState, useEffect, useCallback } from "react";
import { AIContextMetadata } from "@/types/ai-context";
import { Spinner } from "@/components/ui/spinner/Spinner";
import {
  StreamVideo,
  StreamVideoClient,
  Call,
  SpeakerLayout,
  StreamCall,
  useCallStateHooks,
  useStreamVideoClient,
} from "@stream-io/video-react-sdk";

interface ContextAwareVoiceAssistantProps {
  funeralId?: string;
  aiContext?: AIContextMetadata;
  autoStart?: boolean;
}

/**
 * Context-aware voice assistant that sends funeral and AI context to the backend
 */
export function ContextAwareVoiceAssistant({
  funeralId,
  aiContext,
  autoStart = true,
}: ContextAwareVoiceAssistantProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAI, setHasAI] = useState(false);

  // Initialize Stream client with context
  const initializeClient = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Initializing voice assistant with context:", {
        funeralId,
        aiContext,
      });

      // Get credentials from backend WITH context
      const response = await fetch("/api/voice-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          funeralId: funeralId || undefined,
          aiContext: aiContext || undefined,
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

      if (!result.apiKey) {
        throw new Error("API Key not received from backend");
      }

      if (!result.token) {
        throw new Error("Token not received from backend");
      }

      if (!result.callId) {
        throw new Error("Call ID not received from backend");
      }

      // Store call ID for later use
      setCallId(result.callId);

      // Create Stream client
      const streamClient = StreamVideoClient.getOrCreateInstance({
        apiKey: result.apiKey,
        user: {
          id: "user",
          name: "User",
        },
        token: result.token,
      });

      setClient(streamClient);
      setHasAI(result.hasAI || false);
      setIsConnected(true);
      console.log("Stream client initialized successfully with context");
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
  }, [funeralId, aiContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (client && isConnected) {
        client.disconnectUser();
      }
    };
  }, [client, isConnected]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && !client && !isConnected && !isLoading) {
      initializeClient();
    }
  }, [autoStart, client, isConnected, isLoading, initializeClient]);

  // Create call when client is ready
  useEffect(() => {
    if (client && callId && !call) {
      console.log("Creating call with ID:", callId);
      const newCall = client.call("default", callId);
      setCall(newCall);
    }
  }, [client, callId, call]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-600">
            <svg
              className="h-16 w-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={initializeClient}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Opnieuw proberen
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected || !client) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-sm text-gray-600">
            {isLoading
              ? "Verbinden met voice assistant..."
              : "Initialiseren..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallInterface call={call} hasAI={hasAI} aiContext={aiContext} />
    </StreamVideo>
  );
}

// Call interface component that handles the actual call
function CallInterface({
  call: propCall,
  hasAI,
  aiContext,
}: {
  call: Call | null;
  hasAI: boolean;
  aiContext?: AIContextMetadata;
}) {
  const [call, setCall] = useState<Call | null>(propCall);
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = useStreamVideoClient();

  // Join call
  const joinCall = useCallback(async () => {
    if (!client || !call) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Joining call:", call.id);

      // Join the call with retry logic
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          await call.join({ create: false });
          console.log("Joined call successfully");
          break;
        } catch (joinError: any) {
          retryCount++;
          console.error(`Join attempt ${retryCount} failed:`, joinError);

          if (retryCount >= maxRetries) {
            throw joinError;
          }

          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      // Enable microphone
      await call.microphone.enable();
      console.log("Microphone enabled");

      // Enable speakers
      await call.speaker.setVolume(1.0);
      console.log("Speakers volume set");

      setIsInCall(true);
      console.log("Call state updated to in-call");
    } catch (err: any) {
      console.error("Failed to join call:", err);

      let errorMessage = "Kon niet deelnemen aan gesprek";
      if (err.message?.includes("WS connection")) {
        errorMessage +=
          ": WebSocket verbinding mislukt. Controleer je internetverbinding.";
      } else if (err.message?.includes("token")) {
        errorMessage += ": Token probleem. Probeer opnieuw te verbinden.";
      } else {
        errorMessage += ": " + (err.message || "Unknown error");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [client, call]);

  // Leave call
  const leaveCall = useCallback(async () => {
    if (!call) return;

    try {
      setIsLoading(true);
      setError(null);
      await call.leave();
      setIsInCall(false);
    } catch (err) {
      console.error("Error leaving call:", err);
      setError(err instanceof Error ? err.message : "Failed to leave call");
    } finally {
      setIsLoading(false);
    }
  }, [call]);

  useEffect(() => {
    if (propCall) {
      setCall(propCall);
    }
  }, [propCall]);

  // Auto-join call
  useEffect(() => {
    if (call && !isInCall && !isLoading) {
      joinCall();
    }
  }, [call, isInCall, isLoading, joinCall]);

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
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-sm text-gray-600">
            {isLoading ? "Deelnemen aan gesprek..." : "Wachten op call..."}
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {call && (
        <StreamCall call={call}>
          <CallUI hasAI={hasAI} aiContext={aiContext} onLeave={leaveCall} />
        </StreamCall>
      )}
    </div>
  );
}

// Call UI component
function CallUI({
  hasAI,
  aiContext,
  onLeave,
}: {
  hasAI: boolean;
  aiContext?: AIContextMetadata;
  onLeave: () => void;
}) {
  const { useIsCallLive, useParticipants } = useCallStateHooks();
  const isCallLive = useIsCallLive();
  const participants = useParticipants();
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Monitor AI speaking status
  useEffect(() => {
    const checkAiSpeaking = () => {
      const aiParticipant = participants.find(
        (p) => p.userId === "funeral-assistant"
      );
      const speaking = !!aiParticipant;
      setIsAiSpeaking(speaking);
    };

    const interval = setInterval(checkAiSpeaking, 100);
    return () => clearInterval(interval);
  }, [participants]);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Status Indicator */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`h-3 w-3 rounded-full ${
                  isCallLive ? "bg-green-400" : "bg-gray-400"
                }`}
              />
              {isCallLive && (
                <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isCallLive ? "Verbonden" : "Niet verbonden"}
              </p>
              {aiContext && (
                <p className="text-xs opacity-90">
                  Context: {aiContext.page} ({aiContext.scope})
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onLeave}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors"
          >
            Afsluiten
          </button>
        </div>
      </div>

      {/* Voice Visualizer */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center space-y-6 p-8">
          <div className="relative inline-block">
            <div
              className={`h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center transition-all duration-300 ${
                isAiSpeaking ? "scale-110 shadow-2xl" : "scale-100 shadow-lg"
              }`}
            >
              <svg
                className="h-16 w-16 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            {isAiSpeaking && (
              <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {isAiSpeaking ? "AI spreekt..." : "Klaar om te luisteren"}
            </h3>
            <p className="text-gray-600">
              {hasAI
                ? "Spreek om met de AI assistant te praten"
                : "Voice assistant actief (zonder AI)"}
            </p>
          </div>

          {aiContext && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm">
              <span className="font-medium">{aiContext.page}</span>
              <span className="opacity-60">•</span>
              <span>
                {aiContext.scope === "manage" && "Volledig beheer"}
                {aiContext.scope === "create" && "Aanmaken"}
                {aiContext.scope === "edit" && "Bewerken"}
                {aiContext.scope === "view" && "Alleen lezen"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio component */}
      <div className="hidden">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>
    </div>
  );
}
