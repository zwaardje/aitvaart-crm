/**
 * AI Tool Factory - Generates context-aware tools based on page and permissions
 */

import { AIContextMetadata, AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "./database";
import {
  handleAddNoteFunction,
  handleUpdateNoteFunction,
  handleDeleteNoteFunction,
  handleListNotesFunction,
  handleAddCostFunction,
  handleUpdateCostFunction,
  handleDeleteCostFunction,
  handleListCostsFunction,
  handleAddContactFunction,
  handleUpdateContactFunction,
  handleDeleteContactFunction,
  handleListContactsFunction,
  handleGetFuneralInfoFunction,
  handleSearchFuneralByNameFunction,
} from "./function-handlers";

/**
 * Main Tool Factory class
 */
export class AIToolFactory {
  /**
   * Generate tools based on context metadata
   */
  async generateTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): Promise<AIToolHandler[]> {
    const tools: AIToolHandler[] = [];

    // Always include basic info tool
    tools.push(this.createGetFuneralInfoTool(funeralContext));

    // Page-specific tools
    switch (metadata.page) {
      case "notes":
        tools.push(...this.generateNotesTools(metadata, funeralContext));
        break;
      case "costs":
        tools.push(...this.generateCostsTools(metadata, funeralContext));
        break;
      case "contacts":
        tools.push(...this.generateContactsTools(metadata, funeralContext));
        break;
      case "scenarios":
        tools.push(...this.generateScenariosTools(metadata, funeralContext));
        break;
      case "documents":
        tools.push(...this.generateDocumentsTools(metadata, funeralContext));
        break;
      case "general":
        tools.push(...this.generateGeneralTools(metadata, funeralContext));
        break;
    }

    // Always include search capability
    tools.push(this.createSearchFuneralTool());

    return tools;
  }

  /**
   * Generate tools for notes context
   */
  private generateNotesTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    // List notes is always available
    tools.push(this.createListNotesTool(funeralContext));

    // Create permission
    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(this.createAddNoteTool(funeralContext));
    }

    // Edit/Delete permissions
    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(this.createUpdateNoteTool(metadata.entityId, funeralContext));
      tools.push(this.createDeleteNoteTool(metadata.entityId, funeralContext));
    }

    // Manage scope gets all operations even without specific entity
    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(this.createUpdateNoteByQueryTool(funeralContext));
      tools.push(this.createDeleteNoteByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for costs context
   */
  private generateCostsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    tools.push(this.createListCostsTool(funeralContext));

    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(this.createAddCostTool(funeralContext));
    }

    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(this.createUpdateCostTool(metadata.entityId, funeralContext));
      tools.push(this.createDeleteCostTool(metadata.entityId, funeralContext));
    }

    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(this.createUpdateCostByQueryTool(funeralContext));
      tools.push(this.createDeleteCostByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for contacts context
   */
  private generateContactsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    tools.push(this.createListContactsTool(funeralContext));

    if (metadata.scope === "create" || metadata.scope === "manage") {
      tools.push(this.createAddContactTool(funeralContext));
    }

    if (
      metadata.entityId &&
      (metadata.scope === "edit" || metadata.scope === "manage")
    ) {
      tools.push(
        this.createUpdateContactTool(metadata.entityId, funeralContext)
      );
      tools.push(
        this.createDeleteContactTool(metadata.entityId, funeralContext)
      );
    }

    if (metadata.scope === "manage" && !metadata.entityId) {
      tools.push(this.createUpdateContactByQueryTool(funeralContext));
      tools.push(this.createDeleteContactByQueryTool(funeralContext));
    }

    return tools;
  }

  /**
   * Generate tools for scenarios context
   */
  private generateScenariosTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];
    // TODO: Implement scenario-specific tools
    return tools;
  }

  /**
   * Generate tools for documents context
   */
  private generateDocumentsTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];
    // TODO: Implement document-specific tools
    return tools;
  }

  /**
   * Generate tools for general context
   */
  private generateGeneralTools(
    metadata: AIContextMetadata,
    funeralContext: FuneralContext
  ): AIToolHandler[] {
    const tools: AIToolHandler[] = [];

    // General context has all basic operations
    tools.push(this.createAddNoteTool(funeralContext));
    tools.push(this.createAddCostTool(funeralContext));
    tools.push(this.createAddContactTool(funeralContext));

    return tools;
  }

  // ==================== NOTES TOOLS ====================

  private createAddNoteTool(funeralContext: FuneralContext): AIToolHandler {
    return {
      name: "add_note",
      description: "Voeg een notitie toe aan de uitvaart",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "De inhoud van de notitie",
          },
          title: {
            type: "string",
            description: "Een korte titel voor de notitie (optioneel)",
          },
          is_important: {
            type: "boolean",
            description: "Of de notitie belangrijk is (standaard: false)",
          },
        },
        required: ["content"],
      },
      handler: async (args: any) => {
        return await handleAddNoteFunction(args, funeralContext);
      },
    };
  }

  private createUpdateNoteTool(
    noteId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_note",
      description: "Bewerk een bestaande notitie",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "De nieuwe inhoud van de notitie",
          },
          title: {
            type: "string",
            description: "De nieuwe titel van de notitie",
          },
          is_important: {
            type: "boolean",
            description: "Of de notitie belangrijk is",
          },
        },
        required: [],
      },
      handler: async (args: any) => {
        return await handleUpdateNoteFunction(
          { noteId, ...args },
          funeralContext
        );
      },
    };
  }

  private createUpdateNoteByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_note",
      description: "Bewerk een notitie door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          noteId: {
            type: "string",
            description: "Het ID van de notitie die bewerkt moet worden",
          },
          content: {
            type: "string",
            description: "De nieuwe inhoud van de notitie",
          },
          title: {
            type: "string",
            description: "De nieuwe titel van de notitie",
          },
          is_important: {
            type: "boolean",
            description: "Of de notitie belangrijk is",
          },
        },
        required: ["noteId"],
      },
      handler: async (args: any) => {
        return await handleUpdateNoteFunction(args, funeralContext);
      },
    };
  }

  private createDeleteNoteTool(
    noteId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_note",
      description: "Verwijder deze notitie",
      parameters: {
        type: "object",
        properties: {
          confirm: {
            type: "boolean",
            description: "Bevestig dat je de notitie wilt verwijderen",
          },
        },
        required: ["confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteNoteFunction({ noteId }, funeralContext);
      },
    };
  }

  private createDeleteNoteByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_note",
      description: "Verwijder een notitie door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          noteId: {
            type: "string",
            description: "Het ID van de notitie die verwijderd moet worden",
          },
          confirm: {
            type: "boolean",
            description: "Bevestig dat je de notitie wilt verwijderen",
          },
        },
        required: ["noteId", "confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteNoteFunction(args, funeralContext);
      },
    };
  }

  private createListNotesTool(funeralContext: FuneralContext): AIToolHandler {
    return {
      name: "list_notes",
      description: "Haal alle notities op van deze uitvaart",
      parameters: {
        type: "object",
        properties: {
          important_only: {
            type: "boolean",
            description: "Toon alleen belangrijke notities",
          },
        },
        required: [],
      },
      handler: async (args: any) => {
        return await handleListNotesFunction(args, funeralContext);
      },
    };
  }

  // ==================== COSTS TOOLS ====================

  private createAddCostTool(funeralContext: FuneralContext): AIToolHandler {
    return {
      name: "add_cost",
      description: "Voeg kosten toe aan de uitvaart",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Het bedrag in euro's",
          },
          description: {
            type: "string",
            description: "Beschrijving van de kosten",
          },
        },
        required: ["amount", "description"],
      },
      handler: async (args: any) => {
        return await handleAddCostFunction(args, funeralContext);
      },
    };
  }

  private createUpdateCostTool(
    costId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_cost",
      description: "Bewerk bestaande kosten",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "number",
            description: "Het nieuwe bedrag in euro's",
          },
          description: {
            type: "string",
            description: "Nieuwe beschrijving van de kosten",
          },
        },
        required: [],
      },
      handler: async (args: any) => {
        return await handleUpdateCostFunction(
          { costId, ...args },
          funeralContext
        );
      },
    };
  }

  private createUpdateCostByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_cost",
      description: "Bewerk kosten door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          costId: {
            type: "string",
            description: "Het ID van de kosten die bewerkt moeten worden",
          },
          amount: {
            type: "number",
            description: "Het nieuwe bedrag in euro's",
          },
          description: {
            type: "string",
            description: "Nieuwe beschrijving van de kosten",
          },
        },
        required: ["costId"],
      },
      handler: async (args: any) => {
        return await handleUpdateCostFunction(args, funeralContext);
      },
    };
  }

  private createDeleteCostTool(
    costId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_cost",
      description: "Verwijder deze kosten",
      parameters: {
        type: "object",
        properties: {
          confirm: {
            type: "boolean",
            description: "Bevestig dat je de kosten wilt verwijderen",
          },
        },
        required: ["confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteCostFunction({ costId }, funeralContext);
      },
    };
  }

  private createDeleteCostByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_cost",
      description: "Verwijder kosten door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          costId: {
            type: "string",
            description: "Het ID van de kosten die verwijderd moeten worden",
          },
          confirm: {
            type: "boolean",
            description: "Bevestig dat je de kosten wilt verwijderen",
          },
        },
        required: ["costId", "confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteCostFunction(args, funeralContext);
      },
    };
  }

  private createListCostsTool(funeralContext: FuneralContext): AIToolHandler {
    return {
      name: "list_costs",
      description: "Haal alle kosten op van deze uitvaart",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async (args: any) => {
        return await handleListCostsFunction(args, funeralContext);
      },
    };
  }

  // ==================== CONTACTS TOOLS ====================

  private createAddContactTool(funeralContext: FuneralContext): AIToolHandler {
    return {
      name: "add_contact",
      description: "Voeg een contact toe aan de uitvaart",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "De naam van het contact",
          },
          phone: {
            type: "string",
            description: "Telefoonnummer (optioneel)",
          },
          email: {
            type: "string",
            description: "E-mailadres (optioneel)",
          },
          relationship: {
            type: "string",
            description: "Relatie tot de overledene (bijv. Familie, Vriend)",
          },
        },
        required: ["name"],
      },
      handler: async (args: any) => {
        return await handleAddContactFunction(args, funeralContext);
      },
    };
  }

  private createUpdateContactTool(
    contactId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_contact",
      description: "Bewerk een bestaand contact",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "De nieuwe naam van het contact",
          },
          phone: {
            type: "string",
            description: "Nieuw telefoonnummer",
          },
          email: {
            type: "string",
            description: "Nieuw e-mailadres",
          },
          relationship: {
            type: "string",
            description: "Nieuwe relatie tot de overledene",
          },
        },
        required: [],
      },
      handler: async (args: any) => {
        return await handleUpdateContactFunction(
          { contactId, ...args },
          funeralContext
        );
      },
    };
  }

  private createUpdateContactByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "update_contact",
      description: "Bewerk een contact door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          contactId: {
            type: "string",
            description: "Het ID van het contact dat bewerkt moet worden",
          },
          name: {
            type: "string",
            description: "De nieuwe naam van het contact",
          },
          phone: {
            type: "string",
            description: "Nieuw telefoonnummer",
          },
          email: {
            type: "string",
            description: "Nieuw e-mailadres",
          },
          relationship: {
            type: "string",
            description: "Nieuwe relatie tot de overledene",
          },
        },
        required: ["contactId"],
      },
      handler: async (args: any) => {
        return await handleUpdateContactFunction(args, funeralContext);
      },
    };
  }

  private createDeleteContactTool(
    contactId: string,
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_contact",
      description: "Verwijder dit contact",
      parameters: {
        type: "object",
        properties: {
          confirm: {
            type: "boolean",
            description: "Bevestig dat je het contact wilt verwijderen",
          },
        },
        required: ["confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteContactFunction({ contactId }, funeralContext);
      },
    };
  }

  private createDeleteContactByQueryTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "delete_contact",
      description: "Verwijder een contact door de ID op te geven",
      parameters: {
        type: "object",
        properties: {
          contactId: {
            type: "string",
            description: "Het ID van het contact dat verwijderd moet worden",
          },
          confirm: {
            type: "boolean",
            description: "Bevestig dat je het contact wilt verwijderen",
          },
        },
        required: ["contactId", "confirm"],
      },
      handler: async (args: any) => {
        if (!args.confirm) {
          return { success: false, message: "Verwijdering niet bevestigd" };
        }
        return await handleDeleteContactFunction(args, funeralContext);
      },
    };
  }

  private createListContactsTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "list_contacts",
      description: "Haal alle contacten op van deze uitvaart",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async (args: any) => {
        return await handleListContactsFunction(args, funeralContext);
      },
    };
  }

  // ==================== GENERAL TOOLS ====================

  private createGetFuneralInfoTool(
    funeralContext: FuneralContext
  ): AIToolHandler {
    return {
      name: "get_funeral_info",
      description: "Krijg informatie over de uitvaart",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: async () => {
        return await handleGetFuneralInfoFunction(funeralContext);
      },
    };
  }

  private createSearchFuneralTool(): AIToolHandler {
    return {
      name: "search_funeral_by_name",
      description:
        "Zoek naar uitvaartgegevens op basis van de naam van de overledene",
      parameters: {
        type: "object",
        properties: {
          deceased_name: {
            type: "string",
            description: "De naam van de overledene om naar te zoeken",
          },
        },
        required: ["deceased_name"],
      },
      handler: async (args: any) => {
        return await handleSearchFuneralByNameFunction(args, null);
      },
    };
  }
}

/**
 * Singleton instance
 */
export const toolFactory = new AIToolFactory();
