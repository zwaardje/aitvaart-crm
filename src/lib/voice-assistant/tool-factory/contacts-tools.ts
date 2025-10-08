/**
 * Contacts-related tools for the AI assistant
 */

import { AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "../database";
import {
  handleAddContactFunction,
  handleUpdateContactFunction,
  handleDeleteContactFunction,
  handleListContactsFunction,
} from "../function-handlers";
import { parseHandlerResponse } from "./utils";

export function createAddContactTool(
  funeralContext: FuneralContext
): AIToolHandler {
  return {
    name: "add_contact",
    description: "Voeg een contact toe aan de uitvaart",
    parameters: {
      type: "object",
      properties: {
        first_name: {
          type: "string",
          description: "De voornaam van het contact",
        },
        last_name: {
          type: "string",
          description: "De achternaam van het contact",
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
      required: ["first_name", "last_name"],
    },
    handler: async (args: any) => {
      const response = await handleAddContactFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateContactTool(
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
      const response = await handleUpdateContactFunction(
        { contactId, ...args },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateContactByQueryTool(
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
      const response = await handleUpdateContactFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteContactTool(
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
      const response = await handleDeleteContactFunction(
        { contactId },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteContactByQueryTool(
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
      const response = await handleDeleteContactFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createListContactsTool(
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
      const response = await handleListContactsFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}
