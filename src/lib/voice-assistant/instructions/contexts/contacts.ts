/**
 * Instructions for Contacts context
 */

import { AIContextMetadata } from "@/types/ai-context";

export function getContactsContextInstructions(
  deceasedName: string,
  metadata: AIContextMetadata
): string {
  let instructions = `HUIDIGE PAGINA: CONTACTEN
Je bevindt je op de contactenpagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je belangrijkste taak is het helpen met nabestaanden en contactpersonen.`;

  if (metadata.entityId) {
    instructions += `\n\nSPECIFIEK CONTACT:
Je werkt momenteel met een specifiek contact (ID: ${metadata.entityId}).
De gebruiker kan dit contact bewerken of verwijderen.`;
  }

  instructions += `\n\nBEST PRACTICES:
- Vraag altijd naar de relatie tot de overledene
- Leg contactgegevens (telefoon, email) vast wanneer beschikbaar
- Wees respectvol bij het omgaan met familie en nabestaanden`;

  return instructions;
}
