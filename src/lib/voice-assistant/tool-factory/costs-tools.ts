/**
 * Costs-related tools for the AI assistant
 */

import { AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "../database";
import {
  handleAddCostFunction,
  handleUpdateCostFunction,
  handleDeleteCostFunction,
  handleListCostsFunction,
} from "../function-handlers";
import { parseHandlerResponse } from "./utils";

export function createAddCostTool(
  funeralContext: FuneralContext
): AIToolHandler {
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
      const response = await handleAddCostFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateCostTool(
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
      const response = await handleUpdateCostFunction(
        { costId, ...args },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createUpdateCostByQueryTool(
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
      const response = await handleUpdateCostFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteCostTool(
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
      const response = await handleDeleteCostFunction(
        { costId },
        funeralContext
      );
      return await parseHandlerResponse(response);
    },
  };
}

export function createDeleteCostByQueryTool(
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
      const response = await handleDeleteCostFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createListCostsTool(
  funeralContext: FuneralContext
): AIToolHandler {
  return {
    name: "list_costs",
    description: "Haal alle kosten op van deze uitvaart",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async (args: any) => {
      const response = await handleListCostsFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}
