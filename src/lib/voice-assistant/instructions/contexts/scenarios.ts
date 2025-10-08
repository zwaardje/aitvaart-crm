/**
 * Instructions for Scenarios context
 */

import { AIContextMetadata } from "@/types/ai-context";

export function getScenariosContextInstructions(
  deceasedName: string,
  metadata: AIContextMetadata
): string {
  return `HUIDIGE PAGINA: SCENARIO'S
Je bevindt je op de scenario's pagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je helpt met het vastleggen en beheren van verschillende scenario's en wensen voor de uitvaart.

BEST PRACTICES:
- Leg scenario's en wensen gedetailleerd vast
- Denk mee over praktische haalbaarheid`;
}
