import { StreamClient } from "@stream-io/node-sdk";
import crypto from "crypto";
import { env } from "@/lib/env";
import { FuneralContext } from "./database";
import { generateFuneralInstructions } from "./openai-functions";
import {
  handleAddNoteFunction,
  handleAddCostFunction,
  handleAddContactFunction,
  handleGetFuneralInfoFunction,
  handleSearchFuneralByNameFunction,
  handleDocumentCommand,
} from "./function-handlers";

/**
 * Initialize Stream client and create call
 */
export async function initializeStreamCall(
  funeralId: string,
  funeralContext: FuneralContext
) {
  // Check if required environment variables are set
  if (!env.STREAM_API_KEY || !env.STREAM_API_SECRET) {
    throw new Error("Stream credentials not configured");
  }

  // Initialize Stream client
  const streamClient = new StreamClient(
    env.STREAM_API_KEY,
    env.STREAM_API_SECRET
  );

  // Create a unique call ID for this voice session (max 64 characters)
  const shortId = crypto.randomUUID().substring(0, 8);
  const callId = `voice-${shortId}`;
  console.log("Creating call with ID:", callId);
  console.log("Call ID length:", callId.length);

  // Create the call with user information
  const call = streamClient.video.call("default", callId);

  // Get or create the call with user data
  console.log("Attempting to create call...");
  const callData = await call.getOrCreate({
    data: {
      created_by_id: "user",
    },
  });
  console.log("Call created successfully:", callData);
  console.log("Call ID from response:", callData.call.id);

  // Try to connect to OpenAI Realtime API (if available in this version)
  let realtimeClient: any = null;
  let hasAI = false;

  try {
    if (env.OPENAI_API_KEY && streamClient.video.connectOpenAi) {
      console.log("Attempting to connect to OpenAI Realtime...");
      realtimeClient = await streamClient.video.connectOpenAi({
        call,
        openAiApiKey: env.OPENAI_API_KEY,
        agentUserId: "funeral-assistant",
      });
      console.log("OpenAI Realtime connected successfully");

      // Set up comprehensive funeral-specific instructions
      const funeralInstructions = generateFuneralInstructions(
        funeralId,
        funeralContext
      );
      console.log("Funeral instructions:", funeralInstructions);

      // Configure the AI agent with basic settings
      await realtimeClient.updateSession({
        instructions: funeralInstructions,
        voice: "alloy", // Use OpenAI's built-in voice instead of Eleven Labs
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      });

      // Store initial context
      clientContexts.set(realtimeClient, {
        funeralId,
        context: funeralContext,
      });

      // Add tools using the correct addTool method
      await setupFuneralTools(realtimeClient, funeralId, funeralContext);

      console.log("AI agent configured successfully with tools");
      hasAI = true;
    }
  } catch (openaiError) {
    console.log("OpenAI Realtime not available:", openaiError);
  }

  // Generate a user token for the frontend
  const userToken = streamClient.createToken("user");
  console.log(
    "Generated token:",
    userToken ? "Token generated" : "Token is empty"
  );
  console.log("Token length:", userToken ? userToken.length : 0);
  console.log("API Key used for token:", env.STREAM_API_KEY);
  console.log(
    "API Secret used for token:",
    env.STREAM_API_SECRET ? "Set" : "Not set"
  );

  return {
    success: true,
    apiKey: env.STREAM_API_KEY,
    callId,
    message: realtimeClient
      ? "Voice assistant session created with AI"
      : "Voice assistant session created (basic)",
    token: userToken,
    hasAI,
    callData: {
      id: callData.call.id,
      type: callData.call.type,
      created_at: callData.call.created_at,
    },
    // Add additional info for debugging
    debug: {
      streamApiKey: env.STREAM_API_KEY ? "Set" : "Not set",
      openaiApiKey: env.OPENAI_API_KEY ? "Set" : "Not set",
      realtimeClientAvailable: !!realtimeClient,
      tokenGenerated: userToken ? "Yes" : "No",
      tokenLength: userToken ? userToken.length : 0,
    },
  };
}

/**
 * Setup funeral-specific tools for the AI agent
 */
async function setupFuneralTools(
  realtimeClient: any,
  funeralId: string,
  funeralContext: FuneralContext
) {
  // Add note tool
  realtimeClient.addTool(
    {
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
    },
    async ({ content, title, is_important = false }: any) => {
      console.log("add_note request", { content, title, is_important });
      return await handleAddNoteFunction(
        {
          content,
          title,
          is_important,
        },
        funeralContext
      );
    }
  );

  // Add cost tool
  realtimeClient.addTool(
    {
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
    },
    async ({ amount, description }: any) => {
      console.log("add_cost request", { amount, description });
      return await handleAddCostFunction(
        {
          amount,
          description,
        },
        funeralContext
      );
    }
  );

  // Add contact tool
  realtimeClient.addTool(
    {
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
    },
    async ({ name, phone, email, relationship = "Familie" }: any) => {
      console.log("add_contact request", { name, phone, email, relationship });
      return await handleAddContactFunction(
        {
          name,
          phone,
          email,
          relationship,
        },
        funeralContext
      );
    }
  );

  // Add scenario tool
  realtimeClient.addTool(
    {
      name: "add_scenario",
      description: "Voeg een scenario toe aan de uitvaart",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Titel van het scenario",
          },
          description: {
            type: "string",
            description: "Beschrijving van het scenario",
          },
          is_selected: {
            type: "boolean",
            description: "Of dit scenario geselecteerd is (standaard: false)",
          },
        },
        required: ["title", "description"],
      },
    },
    async ({ title, description, is_selected = false }: any) => {
      console.log("add_scenario request", { title, description, is_selected });
      return await handleDocumentCommand(
        `voeg scenario toe: ${title} - ${description}`,
        funeralId,
        funeralContext
      );
    }
  );

  // Add document tool
  realtimeClient.addTool(
    {
      name: "add_document",
      description: "Voeg een document toe aan de uitvaart",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Naam van het document",
          },
          description: {
            type: "string",
            description: "Beschrijving van het document",
          },
          file_type: {
            type: "string",
            description: "Type bestand (bijv. PDF, DOC, JPG)",
          },
        },
        required: ["name"],
      },
    },
    async ({ name, description, file_type }: any) => {
      console.log("add_document request", { name, description, file_type });
      return await handleDocumentCommand(
        `voeg document toe: ${name} - ${description || ""} (${
          file_type || "bestand"
        })`,
        funeralId,
        funeralContext
      );
    }
  );

  // Get funeral info tool
  realtimeClient.addTool(
    {
      name: "get_funeral_info",
      description: "Krijg informatie over de uitvaart",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    async () => {
      console.log("get_funeral_info request");
      return await handleGetFuneralInfoFunction(funeralContext);
    }
  );

  // Search funeral by name tool
  realtimeClient.addTool(
    {
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
    },
    async ({ deceased_name }: any) => {
      console.log("search_funeral_by_name request", { deceased_name });
      return await handleSearchFuneralByNameFunction(
        { deceased_name },
        realtimeClient
      );
    }
  );

  console.log("All funeral tools registered successfully");
}

/**
 * Store current funeral context for a realtime client
 */
const clientContexts = new Map<
  any,
  { funeralId: string; context: FuneralContext }
>();

/**
 * Update funeral context and instructions for an existing realtime client
 */
export async function updateFuneralContext(
  realtimeClient: any,
  newFuneralId: string,
  newFuneralContext: FuneralContext
) {
  try {
    console.log("Updating funeral context for:", newFuneralId);

    // Store the new context
    clientContexts.set(realtimeClient, {
      funeralId: newFuneralId,
      context: newFuneralContext,
    });

    // Generate new funeral instructions with updated context
    const updatedInstructions = generateFuneralInstructions(
      newFuneralId,
      newFuneralContext
    );

    console.log("Updated funeral instructions:", updatedInstructions);

    // Update the session with new instructions
    await realtimeClient.updateSession({
      instructions: updatedInstructions,
    });

    // Remove existing tools before re-registering
    const toolNames = [
      "add_note",
      "add_cost",
      "add_contact",
      "add_scenario",
      "add_document",
      "get_funeral_info",
      "search_funeral_by_name",
    ];

    for (const toolName of toolNames) {
      try {
        await realtimeClient.removeTool(toolName);
        console.log(`Removed tool: ${toolName}`);
      } catch (error) {
        console.log(`Tool ${toolName} was not found or already removed`);
      }
    }

    // Re-register tools with new context
    await setupFuneralTools(realtimeClient, newFuneralId, newFuneralContext);

    console.log("Funeral context updated successfully");

    return {
      success: true,
      message: "Uitvaart context succesvol bijgewerkt",
      funeralId: newFuneralId,
      deceasedName:
        newFuneralContext.deceased?.preferred_name ||
        newFuneralContext.deceased?.first_names ||
        "Onbekend",
    };
  } catch (error) {
    console.error("Error updating funeral context:", error);
    return {
      success: false,
      message: "Fout bij bijwerken van uitvaart context",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get current funeral context for a realtime client
 */
export function getCurrentFuneralContext(
  realtimeClient: any
): { funeralId: string; context: FuneralContext } | null {
  return clientContexts.get(realtimeClient) || null;
}

/**
 * Clear funeral context for a realtime client
 */
export function clearFuneralContext(realtimeClient: any) {
  clientContexts.delete(realtimeClient);
}

/**
 * Send text message to the voice assistant
 */
export async function sendTextMessage(realtimeClient: any, message: string) {
  try {
    if (!realtimeClient) {
      throw new Error("Realtime client not available");
    }

    console.log("Sending text message to AI:", message);

    // Send text message to OpenAI Realtime API
    // The exact method depends on the Stream/OpenAI integration
    // This is a placeholder - we'll need to check the actual API

    // Option 1: If Stream supports direct text input
    if (realtimeClient.sendMessage) {
      await realtimeClient.sendMessage({
        type: "text",
        content: message,
        role: "user",
      });
    }

    // Option 2: If we need to use the session update method
    else if (realtimeClient.updateSession) {
      // Send as a text input to the session
      await realtimeClient.updateSession({
        input: message,
      });
    }

    // Option 3: If we need to simulate a text transcript
    else {
      // This would trigger the transcript processing
      await realtimeClient.processTextInput(message);
    }

    console.log("Text message sent successfully");

    return {
      success: true,
      message: "Text message sent successfully",
    };
  } catch (error) {
    console.error("Error sending text message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get funeral context by call ID
 */
export function getFuneralContextByCallId(
  callId: string
): { funeralId: string; context: FuneralContext } | null {
  // Search through all stored contexts to find the one with matching call ID
  const entries = Array.from(clientContexts.entries());
  for (const [client, contextData] of entries) {
    // We'll need to store callId in the context data structure
    if ((contextData as any).callId === callId) {
      return contextData;
    }
  }
  return null;
}
