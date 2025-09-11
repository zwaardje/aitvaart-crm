"use client";

import { Content } from "@/components/layout";
import { useFuneral } from "@/hooks/useFunerals";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui";
import { FuneralContacts } from "@/components/funerals/FuneralContacts";
import { DeceasedCard } from "@/components/funerals/DeceasedCard";
import { StreamVoiceAssistantWrapper } from "@/components/voice/StreamVoiceAssistant";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

export default function FuneralDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const t = useTranslations("funerals");
  const { funeral, isLoading } = useFuneral(params.id);
  const { processVoiceCommand } = useVoiceCommands(params.id);

  const handleVoiceCommand = async (command: string, data?: any) => {
    const result = await processVoiceCommand(command);
    console.log("Voice command result:", result);
    // You could show a toast notification here
  };

  return (
    <Content>
      {isLoading && (
        <div className="space-y-4 w-full">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && funeral && (
        <div className="pt-6 space-y-4 w-full">
          <StreamVoiceAssistantWrapper
            funeralId={params.id}
            onCommand={handleVoiceCommand}
          />

          <DeceasedCard deceased={funeral.deceased as any} />

          <FuneralContacts funeralId={params.id} />
        </div>
      )}
    </Content>
  );
}
