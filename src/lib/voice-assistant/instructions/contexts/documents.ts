/**
 * Instructions for Documents context
 */

import { AIContextMetadata } from "@/types/ai-context";

export function getDocumentsContextInstructions(
  deceasedName: string,
  metadata: AIContextMetadata
): string {
  return `HUIDIGE PAGINA: DOCUMENTEN
Je bevindt je op de documentenpagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je helpt met het organiseren en tracken van documenten voor deze uitvaart.

BEST PRACTICES:
- Leg documenttype en beschrijving duidelijk vast
- Help bij het categoriseren van documenten`;
}
