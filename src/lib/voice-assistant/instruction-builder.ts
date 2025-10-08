/**
 * AI Instruction Builder - Generates context-aware instructions for the AI
 */

import { AIContextMetadata } from "@/types/ai-context";
import { FuneralContext } from "./database";

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
      case "notes":
        return this.getNotesContextInstructions(deceasedName, metadata);

      case "costs":
        return this.getCostsContextInstructions(deceasedName, metadata);

      case "contacts":
        return this.getContactsContextInstructions(deceasedName, metadata);

      case "scenarios":
        return this.getScenariosContextInstructions(deceasedName, metadata);

      case "documents":
        return this.getDocumentsContextInstructions(deceasedName, metadata);

      case "general":
        return this.getGeneralContextInstructions(deceasedName, metadata);

      default:
        return "";
    }
  }

  /**
   * Notes context instructions
   */
  private getNotesContextInstructions(
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

  /**
   * Costs context instructions
   */
  private getCostsContextInstructions(
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
- Bied aan om totalen te berekenen wanneer nuttig
- Verwijs naar de overledene bij naam in je bevestigingen`;

    return instructions;
  }

  /**
   * Contacts context instructions
   */
  private getContactsContextInstructions(
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
- Wees respectvol bij het omgaan met familie en nabestaanden
- Verwijs naar de overledene bij naam in je bevestigingen`;

    return instructions;
  }

  /**
   * Scenarios context instructions
   */
  private getScenariosContextInstructions(
    deceasedName: string,
    metadata: AIContextMetadata
  ): string {
    return `HUIDIGE PAGINA: SCENARIO'S
Je bevindt je op de scenario's pagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je helpt met het vastleggen en beheren van verschillende scenario's en wensen voor de uitvaart.

BEST PRACTICES:
- Leg scenario's en wensen gedetailleerd vast
- Denk mee over praktische haalbaarheid
- Verwijs naar de overledene bij naam in je bevestigingen`;
  }

  /**
   * Documents context instructions
   */
  private getDocumentsContextInstructions(
    deceasedName: string,
    metadata: AIContextMetadata
  ): string {
    return `HUIDIGE PAGINA: DOCUMENTEN
Je bevindt je op de documentenpagina van de uitvaart voor ${deceasedName}.

FOCUS:
Je helpt met het organiseren en tracken van documenten voor deze uitvaart.

BEST PRACTICES:
- Leg documenttype en beschrijving duidelijk vast
- Help bij het categoriseren van documenten
- Verwijs naar de overledene bij naam in je bevestigingen`;
  }

  /**
   * General context instructions
   */
  private getGeneralContextInstructions(
    deceasedName: string,
    metadata: AIContextMetadata
  ): string {
    return `HUIDIGE PAGINA: ALGEMEEN
Je bent in een algemene context voor de uitvaart van ${deceasedName}.

FOCUS:
Je kunt helpen met verschillende taken voor deze uitvaart, inclusief:
- Notities toevoegen
- Kosten registreren
- Contacten beheren
- Algemene vragen beantwoorden

BEST PRACTICES:
- Vraag om verduidelijking als de gebruiker niet specifiek is
- Bied suggesties voor relevante acties
- Verwijs naar de overledene bij naam in je bevestigingen`;
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
