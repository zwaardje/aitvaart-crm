"use client";

import {
  useCallStateHooks,
  type StreamVideoParticipant,
} from "@stream-io/video-react-sdk";
import { useEffect, useState, type CSSProperties } from "react";

const listeningCooldownMs = 1000;

export function CloudAudioVisualizer() {
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
    } else if (activity === "listening") {
      const timeout = setTimeout(
        () => setActivity("speaking"),
        listeningCooldownMs
      );
      return () => clearTimeout(timeout);
    } else if (activity === "ai_speaking") {
      const timeout = setTimeout(
        () => setActivity("speaking"),
        listeningCooldownMs
      );
      return () => clearTimeout(timeout);
    }
  }, [speaker, activity, isUserSpeaking, isAISpeaking]);

  // Calculate scale and opacity based on volume
  const volumeScale = Math.min(1 + volume * 0.5, 1.8);
  const opacity = Math.max(Math.min(0.3 + volume * 0.7, 1), 0.2);

  return (
    <div className="cloud-container relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Generate multiple cloud particles */}
      {Array.from({ length: 40 }).map((_, i) => {
        const delay = i * 0.03; // Staggered animation delay
        const size = 30 + Math.random() * 60; // Random particle size

        // When idle (not speaking), position particles closer to center to form a ball
        const isIdle = !isUserSpeaking && !isAISpeaking;
        const centerX = 50; // Center X position
        const centerY = 50; // Center Y position

        // Base spread when idle, grows with volume when speaking
        const baseSpread = isIdle ? 20 : 15; // Smaller base when idle
        const volumeSpread = isIdle ? 0 : volume * 60; // Grow with volume when speaking
        const totalSpread = baseSpread + volumeSpread;

        // Calculate position with bias towards center
        const randomX = Math.random() * totalSpread - totalSpread / 2;
        const randomY = Math.random() * totalSpread - totalSpread / 2;
        const positionX = centerX + randomX;
        const positionY = centerY + randomY;

        return (
          <div
            key={i}
            className={`cloud-particle cloud-particle-${activity}`}
            style={
              {
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.max(0, Math.min(100, positionX))}%`,
                top: `${Math.max(0, Math.min(100, positionY))}%`,
                animationDelay: `${delay}s`,
                transform: `scale(${volumeScale})`,
                opacity: opacity * (0.3 + Math.random() * 0.7),
              } as CSSProperties
            }
          />
        );
      })}
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
