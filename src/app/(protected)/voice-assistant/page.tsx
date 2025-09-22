"use client";

import { Content } from "@/components/layout";
import { StreamVoiceAssistant } from "@/components/voice/StreamVoiceAssistant";

export default function VoiceAssistantPage() {
  return (
    <Content>
      <StreamVoiceAssistant autoStart={true} />
    </Content>
  );
}
