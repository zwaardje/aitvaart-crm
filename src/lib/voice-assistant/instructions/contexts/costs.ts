/**
 * Instructions for Costs context
 */

import { AIContextMetadata } from "@/types/ai-context";

export function getCostsContextInstructions(
  deceasedName: string,
  metadata: AIContextMetadata
): string {
  let instructions = `HUIDIGE PAGINA: KOSTEN
Je bevindt je op de kostenpagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je belangrijkste taak is het helpen met kostenbeheer voor deze uitvaart.`;

  if (metadata.entityId) {
    instructions += `\n\nSPECIFIEKE KOSTEN:
Je werkt momenteel met specifieke kosten (ID: ${metadata.entityId}).
De gebruiker kan deze kosten bewerken of verwijderen.`;
  }

  instructions += `\n\nBEST PRACTICES:
- Bedragen altijd in euro's
- Geef duidelijke beschrijvingen voor elk kostenitem
- Controleer of bedragen logisch zijn
- Bied aan om totalen te berekenen wanneer nuttig`;

  return instructions;
}
