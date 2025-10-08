/**
 * AI Instruction Builder - Generates context-aware instructions for the AI
 *
 * This file orchestrates the instruction building process by importing
 * modular instruction functions from the ./instructions directory.
 */

import { AIContextMetadata } from "@/types/ai-context";
import { FuneralContext } from "./database";

// Import all instruction modules
import {
  getFuneralCreateNewInstructions,
  getFuneralEditExistingInstructions,
  getFuneralWishesListenerInstructions,
  getFuneralModeSelectionInstructions,
  getNotesContextInstructions,
  getCostsContextInstructions,
  getContactsContextInstructions,
  getScenariosContextInstructions,
  getDocumentsContextInstructions,
  getGeneralContextInstructions,
} from "./instructions";

/**
 * Main Instruction Builder class
 */
export class AIInstructionBuilder {
  /**
   * Build complete instructions for the AI based on context
   */
  build(metadata: AIContextMetadata, context: FuneralContext): string {
    const baseInstructions = this.getBaseInstructions(context);
    const contextInstructions = this.getContextInstructions(metadata, context);
    const scopeInstructions = this.getScopeInstructions(metadata);
    const capabilityInstructions = this.getCapabilityInstructions(metadata);

    return `${baseInstructions}\n\n${contextInstructions}\n\n${scopeInstructions}\n\n${capabilityInstructions}`;
  }

  /**
   * Get base instructions that apply to all contexts
   */
  private getBaseInstructions(context: FuneralContext): string {
    const deceasedName =
      context.deceased?.preferred_name ||
      context.deceased?.first_names ||
      "Onbekend";
    const clientName = context.client?.preferred_name || "Onbekend";

    return `Je bent een Nederlandse voice assistant voor uitvaartbegeleiders.
Je helpt bij het beheren van uitvaarten en hun details.

HUIDIGE UITVAART CONTEXT:
- Uitvaart ID: ${context.id}
- Status: Actief
- Aangemaakt: ${context.created_at}
- Laatst bijgewerkt: ${context.updated_at}

👤 OVERLEDENE:
- Naam: ${deceasedName}
- Geboortedatum: ${context.deceased?.date_of_birth || "Onbekend"}
- Overlijdensdatum: ${context.deceased?.date_of_death || "Onbekend"}
- Geslacht: ${context.deceased?.gender || "Onbekend"}

👥 OPDRACHTGEVER:
- Naam: ${clientName}
- Telefoon: ${context.client?.phone_number || "Onbekend"}
- Locatie: ${context.client?.city || "Onbekend"}

🏢 UITVAART DETAILS:
- Locatie: ${context.location || "Nog niet bepaald"}
- Uitvaartleider: ${context.funeral_director || "Nog niet toegewezen"}

Wees vriendelijk, professioneel en spreek Nederlands.
Geef korte, duidelijke antwoorden en vraag door als je meer informatie nodig hebt.
Wanneer je data toevoegt, bevestig dit altijd met een korte samenvatting.`;
  }

  /**
   * Get page-specific context instructions
   */
  private getContextInstructions(
    metadata: AIContextMetadata,
    context: FuneralContext
  ): string {
    const deceasedName =
      context.deceased?.preferred_name ||
      context.deceased?.first_names ||
      "Onbekend";

    switch (metadata.page) {
      case "funerals":
        return this.getFuneralsContextInstructions(metadata, context);

      case "notes":
        return getNotesContextInstructions(deceasedName, metadata);

      case "costs":
        return getCostsContextInstructions(deceasedName, metadata);

      case "contacts":
        return getContactsContextInstructions(deceasedName, metadata);

      case "scenarios":
        return getScenariosContextInstructions(deceasedName, metadata);

      case "documents":
        return getDocumentsContextInstructions(deceasedName, metadata);

      case "general":
        return getGeneralContextInstructions(deceasedName, metadata);

      default:
        return "";
    }
  }

  /**
   * Funerals page context instructions with mode support
   */
  private getFuneralsContextInstructions(
    metadata: AIContextMetadata,
    context: FuneralContext
  ): string {
    // Determine which mode is selected
    switch (metadata.funeralMode) {
      case "create_new":
        return getFuneralCreateNewInstructions();

      case "edit_existing":
        return getFuneralEditExistingInstructions(context);

      case "wishes_listener":
        return getFuneralWishesListenerInstructions(context);

      default:
        // Fallback: no mode selected - show mode selection
        return getFuneralModeSelectionInstructions();
    }
  }

  /**
   * Get scope-specific instructions
   */
  private getScopeInstructions(metadata: AIContextMetadata): string {
    switch (metadata.scope) {
      case "create":
        return `TOEGANGSRECHTEN: AANMAKEN
Je kunt alleen nieuwe items aanmaken in deze context.
Je kunt geen bestaande items bewerken of verwijderen.`;

      case "edit":
        return `TOEGANGSRECHTEN: BEWERKEN
Je kunt het huidige item bewerken.
Vraag altijd om bevestiging voordat je wijzigingen doorvoert.`;

      case "view":
        return `TOEGANGSRECHTEN: BEKIJKEN
Je kunt alleen informatie bekijken en ophalen.
Je kunt geen wijzigingen maken in deze context.`;

      case "manage":
        return `TOEGANGSRECHTEN: VOLLEDIG BEHEER
Je hebt volledige toegang om items aan te maken, bewerken en verwijderen.
Wees extra voorzichtig met verwijder-operaties en vraag altijd om bevestiging.`;

      default:
        return "";
    }
  }

  /**
   * Get capability instructions based on context
   */
  private getCapabilityInstructions(metadata: AIContextMetadata): string {
    const capabilities: string[] = [];

    switch (metadata.page) {
      case "notes":
        if (metadata.scope === "create" || metadata.scope === "manage") {
          capabilities.push("- Nieuwe notities toevoegen");
        }
        if (metadata.scope === "edit" || metadata.scope === "manage") {
          capabilities.push("- Notities bewerken");
          capabilities.push("- Notities verwijderen (met bevestiging)");
        }
        capabilities.push("- Alle notities ophalen");
        capabilities.push("- Belangrijke notities filteren");
        break;

      case "costs":
        if (metadata.scope === "create" || metadata.scope === "manage") {
          capabilities.push("- Nieuwe kosten toevoegen");
        }
        if (metadata.scope === "edit" || metadata.scope === "manage") {
          capabilities.push("- Kosten bewerken");
          capabilities.push("- Kosten verwijderen (met bevestiging)");
        }
        capabilities.push("- Alle kosten ophalen");
        capabilities.push("- Totalen berekenen");
        break;

      case "contacts":
        if (metadata.scope === "create" || metadata.scope === "manage") {
          capabilities.push("- Nieuwe contacten toevoegen");
        }
        if (metadata.scope === "edit" || metadata.scope === "manage") {
          capabilities.push("- Contacten bewerken");
          capabilities.push("- Contacten verwijderen (met bevestiging)");
        }
        capabilities.push("- Alle contacten ophalen");
        break;

      case "general":
        capabilities.push("- Notities toevoegen");
        capabilities.push("- Kosten toevoegen");
        capabilities.push("- Contacten toevoegen");
        capabilities.push("- Uitvaart informatie ophalen");
        capabilities.push("- Zoeken naar andere uitvaarten");
        break;
    }

    // Always available
    capabilities.push("- Uitvaart informatie opvragen");

    if (capabilities.length === 0) {
      return "";
    }

    return `BESCHIKBARE FUNCTIES:\n${capabilities.join("\n")}

Gebruik deze functies om de gebruiker te helpen.
Als een gebruiker om iets vraagt dat buiten je mogelijkheden ligt, leg dit vriendelijk uit.`;
  }
}

/**
 * Singleton instance
 */
export const instructionBuilder = new AIInstructionBuilder();
