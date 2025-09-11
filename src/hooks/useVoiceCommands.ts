"use client";

import { useCallback } from "react";
import { useNotes } from "./useNotes";
import { useCosts } from "./useCosts";
import { useFuneralContacts } from "./useFuneralContacts";
import { useDocuments } from "./useDocuments";
import { useScenarios } from "./useScenarios";

interface VoiceCommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export function useVoiceCommands(funeralId: string) {
  const { uploadDocument } = useDocuments(funeralId);
  const { createNote } = useNotes(funeralId);
  const { createCost } = useCosts(funeralId);
  const { createContact } = useFuneralContacts(funeralId);
  const { scenarios } = useScenarios(funeralId);

  const processVoiceCommand = useCallback(
    async (transcript: string): Promise<VoiceCommandResult> => {
      const lowerTranscript = transcript.toLowerCase().trim();

      try {
        // Notitie toevoegen
        if (
          lowerTranscript.includes("voeg notitie toe") ||
          lowerTranscript.includes("notitie")
        ) {
          const noteContent = extractContentAfter(lowerTranscript, [
            "voeg notitie toe:",
            "notitie:",
          ]);
          if (noteContent) {
            await createNote({ content: noteContent });
            return {
              success: true,
              message: `Notitie toegevoegd: "${noteContent}"`,
              data: { type: "note", content: noteContent },
            };
          }
        }

        // Kosten toevoegen
        if (
          lowerTranscript.includes("voeg kosten toe") ||
          lowerTranscript.includes("kosten")
        ) {
          const costMatch = lowerTranscript.match(
            /voeg kosten toe:?\s*(\d+(?:\.\d+)?)\s*voor\s*(.+)/
          );
          if (costMatch) {
            const amount = parseFloat(costMatch[1]);
            const supplier = costMatch[2].trim();

            await createCost({
              amount,
              description: `Kosten voor ${supplier}`,
              supplier_name: supplier,
            });

            return {
              success: true,
              message: `Kosten toegevoegd: €${amount} voor ${supplier}`,
              data: { type: "cost", amount, supplier },
            };
          }
        }

        // Contact toevoegen
        if (
          lowerTranscript.includes("voeg contact toe") ||
          lowerTranscript.includes("contact")
        ) {
          const contactMatch = lowerTranscript.match(
            /voeg contact toe:?\s*(.+?)\s*(\d{10,})/
          );
          if (contactMatch) {
            const name = contactMatch[1].trim();
            const phone = contactMatch[2].trim();

            await createContact({
              name,
              phone,
              relationship: "family",
            });

            return {
              success: true,
              message: `Contact toegevoegd: ${name} (${phone})`,
              data: { type: "contact", name, phone },
            };
          }
        }

        // Document zoeken
        if (
          lowerTranscript.includes("zoek document") ||
          lowerTranscript.includes("document")
        ) {
          const docName = extractContentAfter(lowerTranscript, [
            "zoek document:",
            "document:",
          ]);
          if (docName) {
            // This would trigger a search in the documents
            return {
              success: true,
              message: `Zoeken naar document: "${docName}"`,
              data: { type: "search", query: docName, category: "document" },
            };
          }
        }

        // Scenario tonen
        if (
          lowerTranscript.includes("toon scenario") ||
          lowerTranscript.includes("scenario")
        ) {
          const scenarioPart = extractContentAfter(lowerTranscript, [
            "toon scenario voor",
            "scenario voor",
          ]);
          if (scenarioPart) {
            const matchingScenario = scenarios.find((s) =>
              s.title.toLowerCase().includes(scenarioPart.toLowerCase())
            );

            if (matchingScenario) {
              return {
                success: true,
                message: `Scenario gevonden: "${matchingScenario.title}"`,
                data: { type: "scenario", scenario: matchingScenario },
              };
            } else {
              return {
                success: false,
                message: `Geen scenario gevonden voor: "${scenarioPart}"`,
                data: { type: "scenario", query: scenarioPart },
              };
            }
          }
        }

        // Default response
        return {
          success: false,
          message:
            'Commando niet herkend. Probeer: "voeg notitie toe", "voeg kosten toe", "zoek document", of "toon scenario"',
          data: { type: "unknown", transcript },
        };
      } catch (error) {
        console.error("Error processing voice command:", error);
        return {
          success: false,
          message:
            "Er is een fout opgetreden bij het verwerken van het commando",
          data: { type: "error", error: error.message },
        };
      }
    },
    [funeralId, createNote, createCost, createContact, scenarios]
  );

  return {
    processVoiceCommand,
  };
}

// Helper function to extract content after specific keywords
function extractContentAfter(text: string, keywords: string[]): string | null {
  for (const keyword of keywords) {
    const index = text.indexOf(keyword);
    if (index !== -1) {
      const content = text.substring(index + keyword.length).trim();
      return content || null;
    }
  }
  return null;
}
