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

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="audio-visualizer"
        style={
          {
            "--volumeter-scale": Math.min(1 + volume * 0.3, 1.2),
            "--volumeter-brightness": Math.max(
              Math.min(1 + volume * 0.2, 1.3),
              0.8
            ),
          } as CSSProperties
        }
      >
        <div
          className={`audio-visualizer__aura audio-visualizer__aura_${activity}`}
        />
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
