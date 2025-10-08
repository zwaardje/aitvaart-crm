/**
 * Notes-related tools for the AI assistant
 */

import { AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "../database";
import {
  handleAddNoteFunction,
  handleUpdateNoteFunction,
  handleDeleteNoteFunction,
  handleListNotesFunction,
} from "../function-handlers";
import { parseHandlerResponse } from "./utils";

export function createAddNoteTool(
  funeralContext: FuneralContext
): AIToolHandler {
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
      const response = await handleAddNoteFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateNoteTool(
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
      const response = await handleUpdateNoteFunction(
        { noteId, ...args },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateNoteByQueryTool(
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
      const response = await handleUpdateNoteFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteNoteTool(
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
      const response = await handleDeleteNoteFunction(
        { noteId },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteNoteByQueryTool(
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
      const response = await handleDeleteNoteFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createListNotesTool(
  funeralContext: FuneralContext
): AIToolHandler {
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
      const response = await handleListNotesFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}
