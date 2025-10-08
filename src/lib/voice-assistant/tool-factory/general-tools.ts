/**
 * General tools for the AI assistant (funeral info, search, create)
 */

import { AIToolHandler } from "@/types/ai-context";
import { FuneralContext } from "../database";
import {
  handleGetFuneralInfoFunction,
  handleSearchFuneralByNameFunction,
  handleCreateFuneralFunction,
} from "../function-handlers";
import { parseHandlerResponse } from "./utils";

export function createGetFuneralInfoTool(
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
      const response = await handleGetFuneralInfoFunction(funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createCreateFuneralTool(
  funeralContext: FuneralContext
): AIToolHandler {
  return {
    name: "create_funeral",
    description:
      "Maak een complete nieuwe uitvaart aan met overledene, opdrachtgever en uitvaart gegevens. Gebruik deze functie nadat je alle benodigde gegevens hebt verzameld en de gebruiker heeft bevestigd.",
    parameters: {
      type: "object",
      properties: {
        deceased_first_names: {
          type: "string",
          description: "Voornamen van de overledene (verplicht)",
        },
        deceased_last_name: {
          type: "string",
          description: "Achternaam van de overledene (verplicht)",
        },
        deceased_preferred_name: {
          type: "string",
          description: "Voorkeursnaam/roepnaam van de overledene (optioneel)",
        },
        deceased_date_of_birth: {
          type: "string",
          description:
            "Geboortedatum overledene in formaat YYYY-MM-DD (optioneel)",
        },
        deceased_place_of_birth: {
          type: "string",
          description: "Geboorteplaats overledene (optioneel)",
        },
        deceased_date_of_death: {
          type: "string",
          description: "Overlijdensdatum in formaat YYYY-MM-DD (optioneel)",
        },
        deceased_gender: {
          type: "string",
          description: "Geslacht: 'male', 'female', of 'other' (optioneel)",
        },
        deceased_social_security_number: {
          type: "string",
          description: "BSN nummer overledene (optioneel)",
        },
        client_preferred_name: {
          type: "string",
          description: "Voornaam opdrachtgever (verplicht)",
        },
        client_last_name: {
          type: "string",
          description: "Achternaam opdrachtgever (verplicht)",
        },
        client_phone_number: {
          type: "string",
          description: "Telefoonnummer opdrachtgever (verplicht)",
        },
        client_email: {
          type: "string",
          description: "E-mailadres opdrachtgever (optioneel)",
        },
        client_street: {
          type: "string",
          description: "Straatnaam opdrachtgever (optioneel)",
        },
        client_house_number: {
          type: "string",
          description: "Huisnummer opdrachtgever (optioneel)",
        },
        client_house_number_addition: {
          type: "string",
          description: "Huisnummer toevoeging (optioneel)",
        },
        client_postal_code: {
          type: "string",
          description: "Postcode opdrachtgever (optioneel)",
        },
        client_city: {
          type: "string",
          description: "Plaats opdrachtgever (optioneel)",
        },
        funeral_location: {
          type: "string",
          description: "Locatie van de uitvaart (optioneel)",
        },
        funeral_signing_date: {
          type: "string",
          description:
            "Datum van tekenen opdracht in formaat YYYY-MM-DD (optioneel)",
        },
        funeral_director: {
          type: "string",
          description: "Naam van de uitvaartleider (optioneel)",
        },
        funeral_notes: {
          type: "array",
          description:
            "Array van notities om toe te voegen aan de uitvaart (optioneel)",
          items: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "Inhoud van de notitie",
              },
              title: {
                type: "string",
                description: "Titel van de notitie (optioneel)",
              },
              is_important: {
                type: "boolean",
                description: "Of de notitie belangrijk is (optioneel)",
              },
            },
            required: ["content"],
          },
        },
        funeral_contacts: {
          type: "array",
          description:
            "Array van contactpersonen om toe te voegen aan de uitvaart (optioneel)",
          items: {
            type: "object",
            properties: {
              first_name: {
                type: "string",
                description: "Voornaam van het contact",
              },
              last_name: {
                type: "string",
                description: "Achternaam van het contact",
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
                description: "Relatie tot de overledene (optioneel)",
              },
            },
            required: ["first_name", "last_name"],
          },
        },
        funeral_costs: {
          type: "array",
          description:
            "Array van kosten om toe te voegen aan de uitvaart (optioneel)",
          items: {
            type: "object",
            properties: {
              amount: {
                type: "number",
                description: "Bedrag in euro's",
              },
              description: {
                type: "string",
                description: "Beschrijving van de kosten",
              },
            },
            required: ["amount", "description"],
          },
        },
      },
      required: [
        "deceased_first_names",
        "deceased_last_name",
        "client_preferred_name",
        "client_last_name",
        "client_phone_number",
      ],
    },
    handler: async (args: any) => {
      const response = await handleCreateFuneralFunction(args, funeralContext);
      return await parseHandlerResponse(response);
    },
  };
}

export function createSearchFuneralTool(): AIToolHandler {
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
      const response = await handleSearchFuneralByNameFunction(args, null);
      return await parseHandlerResponse(response);
    },
  };
}
