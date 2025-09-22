"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

interface UseAIActivityPollingProps {
  funeralId: string;
  isAIActive: boolean;
  pollingInterval?: number; // in milliseconds
}

/**
 * Hook die de stale time van funeral-gerelateerde queries dynamisch aanpast
 * tijdens AI gesprekken voor real-time data updates
 */
export function useAIActivityPolling({
  funeralId,
  isAIActive,
  pollingInterval = 2000, // 2 seconden
}: UseAIActivityPollingProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAIActive || !funeralId) return;

    // Lijst van query keys die moeten worden geüpdatet tijdens AI gesprek
    const queryKeysToUpdate = [
      queryKeys.funerals.detail(funeralId),
      ["funeral-notes", funeralId],
      ["funeral-costs", funeralId],
      ["funeral-cost-breakdown", funeralId],
      ["funeral-contacts", funeralId],
      ["funeral-scenarios", funeralId],
      ["documents", "funeral", funeralId],
    ];

    // Interval voor het forceren van refetch tijdens AI gesprek
    const interval = setInterval(() => {
      queryKeysToUpdate.forEach((queryKey) => {
        // Invalidate en refetch de query
        queryClient.invalidateQueries({ queryKey });
      });
    }, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [isAIActive, funeralId, pollingInterval, queryClient]);

  // Update stale time van queries op basis van AI activiteit
  useEffect(() => {
    const queryKeysToUpdate = [
      queryKeys.funerals.detail(funeralId),
      ["funeral-notes", funeralId],
      ["funeral-costs", funeralId],
      ["funeral-cost-breakdown", funeralId],
      ["funeral-contacts", funeralId],
      ["funeral-scenarios", funeralId],
      ["documents", "funeral", funeralId],
    ];

    // Stel stale time in op basis van AI activiteit
    const staleTime = isAIActive ? 0 : 1000 * 60; // 0ms tijdens AI, 1min normaal

    queryKeysToUpdate.forEach((queryKey) => {
      queryClient.setQueryDefaults(queryKey, {
        staleTime,
        refetchInterval: isAIActive ? pollingInterval : false,
        refetchIntervalInBackground: false,
      });
    });

    // Cleanup: reset naar normale waarden wanneer AI niet actief is
    return () => {
      if (!isAIActive) {
        queryKeysToUpdate.forEach((queryKey) => {
          queryClient.setQueryDefaults(queryKey, {
            staleTime: 1000 * 60, // 1 minuut
            refetchInterval: false,
            refetchIntervalInBackground: false,
          });
        });
      }
    };
  }, [isAIActive, funeralId, pollingInterval, queryClient]);

  return {
    isPolling: isAIActive,
    pollingInterval,
  };
}
