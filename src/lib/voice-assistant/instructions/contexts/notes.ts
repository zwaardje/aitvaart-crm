/**
 * Instructions for Notes context
 */

import { AIContextMetadata } from "@/types/ai-context";

export function getNotesContextInstructions(
  deceasedName: string,
  metadata: AIContextMetadata
): string {
  let instructions = `HUIDIGE PAGINA: NOTITIES
Je bevindt je op de notities pagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je belangrijkste taak is het helpen met notities voor deze uitvaart.`;

  if (metadata.entityId) {
    instructions += `\n\nSPECIFIEKE NOTITIE:
Je werkt momenteel met een specifieke notitie (ID: ${metadata.entityId}).
De gebruiker kan deze notitie bewerken of verwijderen.`;
  }

  instructions += `\n\nBEST PRACTICES:
- Houd notities kort en to-the-point
- Markeer belangrijke notities met de is_important flag
- Geef elke notitie een duidelijke titel
- Verwijs naar de overledene bij naam in je bevestigingen`;

  return instructions;
}
