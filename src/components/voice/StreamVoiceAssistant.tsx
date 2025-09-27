"use client";

import { useState, useEffect, useCallback } from "react";

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

interface StreamVoiceAssistantProps {
  autoStart?: boolean;
}

// Main component that manages the Stream client
export function StreamVoiceAssistant({
  autoStart = false,
}: StreamVoiceAssistantProps) {
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to connect to voice assistant"
        );
      }

      const result = await response.json();
      console.log("Backend response:", result);
      console.log(
        "Token received:",
        result.token ? "Token present" : "Token missing"
      );
      console.log(
        "API Key received:",
        result.apiKey ? "API Key present" : "API Key missing"
      );

      // Create or get existing Stream client
      console.log("Creating Stream client with:", {
        apiKey: result.apiKey ? "Present" : "Missing",
        token: result.token ? "Present" : "Missing",
        tokenLength: result.token ? result.token.length : 0,
        debug: result.debug,
      });

      if (!result.apiKey) {
        throw new Error("API Key not received from backend");
      }

      if (!result.token) {
        throw new Error("Token not received from backend");
      }

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
  }, []);

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
    if (!client && !isConnected && !isLoading) {
      initializeClient();
    }
  }, [client, isConnected, isLoading, initializeClient]);

  // Create call when client is ready
  useEffect(() => {
    if (client && !call) {
      // Get call ID from the backend response
      fetch("/api/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((result) => {
          const newCall = client.call("default", result.callId);
          setCall(newCall);
        })
        .catch((err) => {
          console.error("Failed to get call ID:", err);
          setError("Failed to get call ID");
        });
    }
  }, [client, call]);

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
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <CallInterface call={call} hasAI={hasAI} />
    </StreamVideo>
  );
}

// Call interface component that handles the actual call
function CallInterface({
  call: propCall,
  hasAI,
}: {
  call: Call | null;
  hasAI: boolean;
}) {
  const [call, setCall] = useState<Call | null>(propCall);
  const [isInCall, setIsInCall] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiTranscript, setAiTranscript] = useState<string>("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const client = useStreamVideoClient();

  // Monitor AI speaking status - moved inside StreamCall context

  // Join call
  const joinCall = useCallback(async () => {
    if (!client || !call) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("Joining call:", call.id);
      console.log("Call type:", call.type);

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

          // Wait before retry
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * retryCount)
          );
        }
      }

      // Enable microphone
      await call.microphone.enable();
      console.log("Microphone enabled");

      // Enable speakers for audio output
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
      setAiTranscript("");
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
    <div className="space-y-4 w-full h-full">
      {call && (
        <StreamCall call={call}>
          <CallUI
            hasAI={hasAI}
            aiTranscript={aiTranscript}
            setAiTranscript={setAiTranscript}
            isAiSpeaking={isAiSpeaking}
            setIsAiSpeaking={setIsAiSpeaking}
          />
        </StreamCall>
      )}
    </div>
  );
}

// Call UI component that uses call state hooks
function CallUI({
  hasAI,
  aiTranscript,
  setAiTranscript,
  isAiSpeaking,
  setIsAiSpeaking,
}: {
  hasAI: boolean;
  aiTranscript: string;
  setAiTranscript: (transcript: string) => void;
  isAiSpeaking: boolean;
  setIsAiSpeaking: (speaking: boolean) => void;
}) {
  // Hooks for call state - now inside StreamCall context
  const { useIsCallLive, useParticipants, useLocalParticipant } =
    useCallStateHooks();
  const isCallLive = useIsCallLive();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Text input state
  const [isSendingText, setIsSendingText] = useState(false);

  // Monitor AI speaking status
  useEffect(() => {
    const checkAiSpeaking = () => {
      const aiParticipant = participants.find(
        (p) => p.userId === "ai_assistant"
      );
      const speaking = !!aiParticipant;
      setIsAiSpeaking(speaking);
    };

    const interval = setInterval(checkAiSpeaking, 100);
    return () => clearInterval(interval);
  }, [participants, setIsAiSpeaking]);

  // Handle text message sending
  const handleTextMessage = async (message: string) => {
    if (!isCallLive || isSendingText) return;

    try {
      setIsSendingText(true);

      // Send text message to backend API
      const response = await fetch("/api/voice-assistant/text-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          callId: "current-call", // We'll need to get the actual call ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send text message");
      }

      const result = await response.json();
      console.log("Text message sent successfully:", result);

      // Update AI transcript with the response
      if (result.result?.message) {
        setAiTranscript(result.result.message);
      }
    } catch (error) {
      console.error("Error sending text message:", error);
      // Could show error to user here
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col justify-center items-center">
      <div className="hidden">
        <SpeakerLayout participantsBarPosition="bottom" />
      </div>
    </div>
  );
}

// AI Transcript component to display AI speech visually
function AITranscript({
  transcript,
  isSpeaking,
}: {
  transcript: string;
  isSpeaking: boolean;
}) {
  if (!transcript && !isSpeaking) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="h-5 w-5 text-blue-600 shrink-0">🔊</div>
        <p className="text-sm text-blue-800 flex-1">
          {transcript}{" "}
          {isSpeaking && (
            <span className="inline-block h-2 w-2 bg-blue-500 rounded-full animate-pulse ml-1" />
          )}
        </p>
      </div>
    </div>
  );
}

// Wrapper component for compatibility
export function StreamVoiceAssistantWrapper({
  autoStart = false,
}: StreamVoiceAssistantProps) {
  return <StreamVoiceAssistant autoStart={autoStart} />;
}
