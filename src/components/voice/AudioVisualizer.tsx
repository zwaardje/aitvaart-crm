import {
  useCallStateHooks,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, type CSSProperties } from "react";

const listeningCooldownMs = 1000;

export function AudioVisualizer() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [activity, setActivity] = useState<
    "listening" | "speaking" | "ai_speaking"
  >("speaking");
  const speaker = participants.find((p) => p.isSpeaking);
  const agent = useAgentParticipant();
  const localParticipant = participants.find((p) => p.isLocalParticipant);

  // Determine who is speaking and get the appropriate audio stream
  const isUserSpeaking = speaker?.isLocalParticipant;
  const isAISpeaking = speaker?.userId === "funeral-assistant";

  const mediaStream = isUserSpeaking
    ? localParticipant?.audioStream
    : isAISpeaking
    ? agent?.audioStream
    : null;

  const volume = useMediaStreamVolume(mediaStream ?? null);

  useEffect(() => {
    if (isUserSpeaking) {
      setActivity("listening");
    } else if (isAISpeaking) {
      setActivity("ai_speaking");
    } else if (!speaker && activity === "listening") {
      const timeout = setTimeout(
        () => setActivity("speaking"),
        listeningCooldownMs
      );
      return () => clearTimeout(timeout);
    } else if (!speaker && activity === "ai_speaking") {
      const timeout = setTimeout(
        () => setActivity("speaking"),
        listeningCooldownMs
      );
      return () => clearTimeout(timeout);
    }
  }, [speaker, activity, isUserSpeaking, isAISpeaking]);

  // Calculate scale based on volume for dynamic sizing
  const volumeScale = Math.min(1 + volume * 0.3, 1.2);
  const brightness = Math.max(Math.min(1 + volume * 0.2, 1.3), 0.8);

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Nova-style glowing orb */}
      <div className="relative inline-block">
        <div
          className={`h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isAISpeaking
              ? "scale-110 shadow-2xl"
              : isUserSpeaking
              ? "scale-105 shadow-xl"
              : "scale-100 shadow-lg"
          }`}
          style={{
            transform: `scale(${volumeScale})`,
            opacity: brightness,
          }}
        ></div>
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 blur-xl opacity-50 transition-all duration-300 ${
            isAISpeaking || isUserSpeaking ? "animate-pulse" : "animate-pulse"
          }`}
          style={{
            transform: `scale(${volumeScale})`,
            opacity: brightness * 0.5,
          }}
        />
        {(isAISpeaking || isUserSpeaking) && (
          <div
            className="absolute inset-0 rounded-full bg-purple-400 animate-ping opacity-75"
            style={{
              transform: `scale(${volumeScale})`,
            }}
          />
        )}
      </div>

      {/* Audio visualizer bars - Nova style */}
      <div className="flex items-center justify-center gap-1">
        {[...Array(8)].map((_, i) => {
          const baseHeight =
            i < 2 ? "h-4" : i < 4 ? "h-6" : i < 6 ? "h-8" : "h-10";
          const isActive = isAISpeaking || isUserSpeaking;
          const heightMultiplier = isActive ? 1 + volume * 0.5 : 1;
          const delay = i * 100;

          return (
            <div
              key={i}
              className={`w-1 bg-gray-300 rounded-full transition-all duration-300 ${
                isAISpeaking
                  ? `${baseHeight} bg-purple-400`
                  : isUserSpeaking
                  ? `${baseHeight} bg-blue-400`
                  : baseHeight
              }`}
              style={{
                height: isActive
                  ? `${
                      parseInt(baseHeight.replace("h-", "")) *
                      heightMultiplier *
                      4
                    }px`
                  : undefined,
                animationDelay: isActive ? `${delay}ms` : "none",
                animation: isActive
                  ? "pulse 1s ease-in-out infinite alternate"
                  : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function useMediaStreamVolume(mediaStream: MediaStream | null) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!mediaStream) {
      setVolume(0);
      return;
    }

    let audioContext: AudioContext;

    const promise = (async () => {
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      const data = new Float32Array(analyser.fftSize);
      source.connect(analyser);

      const updateVolume = () => {
        analyser.getFloatTimeDomainData(data);
        const volume = Math.sqrt(
          data.reduce((acc, amp) => acc + (amp * amp) / data.length, 0)
        );
        setVolume(volume);
        return requestAnimationFrame(updateVolume);
      };

      return updateVolume();
    })();

    return () => {
      const audioContextToClose = audioContext;
      promise.then((handle) => {
        cancelAnimationFrame(handle);
        audioContextToClose.close();
      });
    };
  }, [mediaStream]);

  return volume;
}

function useAgentParticipant(): StreamVideoParticipant | null {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const agent =
    participants.find((p) => p.userId === "funeral-assistant") ?? null;
  return agent;
}
