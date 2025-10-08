import { StreamClient } from "@stream-io/node-sdk";
import crypto from "crypto";
import { env } from "@/lib/env";
import { FuneralContext } from "./database";
import { AIContextMetadata } from "@/types/ai-context";
import { toolFactory } from "./tool-factory";
import { instructionBuilder } from "./instruction-builder";

/**
 * Initialize Stream client and create call
 */
export async function initializeStreamCall(
  funeralId: string,
  funeralContext: FuneralContext,
  aiContext?: AIContextMetadata
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

      // Build context-aware instructions
      let instructions: string;
      if (aiContext) {
        console.log("Building context-aware instructions for:", aiContext);
        instructions = instructionBuilder.build(aiContext, funeralContext);
      } else {
        // Fallback to general context
        const defaultContext: AIContextMetadata = {
          page: "general",
          funeralId: funeralId,
          scope: "manage",
        };
        console.log("Using default general context");
        instructions = instructionBuilder.build(defaultContext, funeralContext);
      }

      console.log("AI instructions:", instructions.substring(0, 200) + "...");

      // Configure the AI agent with basic settings
      await realtimeClient.updateSession({
        instructions,
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

      // Store initial context with AI context
      clientContexts.set(realtimeClient, {
        funeralId,
        context: funeralContext,
        aiContext: aiContext || {
          page: "general",
          funeralId: funeralId,
          scope: "manage",
        },
      });

      // Generate and add context-aware tools
      await setupContextAwareTools(
        realtimeClient,
        funeralContext,
        aiContext || {
          page: "general",
          funeralId: funeralId,
          scope: "manage",
        }
      );

      console.log("AI agent configured successfully with context-aware tools");
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
 * Setup context-aware tools for the AI agent using the tool factory
 */
async function setupContextAwareTools(
  realtimeClient: any,
  funeralContext: FuneralContext,
  aiContext: AIContextMetadata
) {
  console.log("Setting up context-aware tools for:", aiContext);

  // Generate tools based on context
  const tools = await toolFactory.generateTools(aiContext, funeralContext);

  console.log(
    `Generated ${tools.length} tools for context:`,
    tools.map((t) => t.name)
  );

  // Add special set_funeral_mode tool for funerals page without mode
  if (aiContext.page === "funerals" && !aiContext.funeralMode) {
    console.log("Adding set_funeral_mode tool for mode selection");

    realtimeClient.addTool(
      {
        name: "set_funeral_mode",
        description:
          "Zet de actieve modus voor de funeral voice assistant. Roep deze functie aan zodra je weet welke modus de gebruiker wil gebruiken.",
        parameters: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["create_new", "edit_existing", "wishes_listener"],
              description:
                "De gekozen modus: 'create_new' voor nieuwe uitvaart, 'edit_existing' voor bewerken, 'wishes_listener' voor wensengesprek",
            },
          },
          required: ["mode"],
        },
      },
      async (args: { mode: string }) => {
        console.log("set_funeral_mode called with mode:", args.mode);

        try {
          // Update AI context with selected mode
          const updatedAiContext = {
            ...aiContext,
            funeralMode: args.mode as
              | "create_new"
              | "edit_existing"
              | "wishes_listener",
          };

          // Store updated context
          clientContexts.set(realtimeClient, {
            funeralId: funeralContext.id,
            context: funeralContext,
            aiContext: updatedAiContext,
          });

          // Build new instructions with the selected mode
          const newInstructions = instructionBuilder.build(
            updatedAiContext,
            funeralContext
          );

          console.log("Updating session with new mode instructions...");

          // Update the session with new instructions
          await realtimeClient.updateSession({
            instructions: newInstructions,
          });

          // Re-register tools with the new mode context
          console.log("Re-registering tools for new mode...");

          // Remove old tools first
          const toolsToRemove = [
            "add_note",
            "add_cost",
            "add_contact",
            "create_funeral",
            "set_funeral_mode",
            "list_notes",
            "list_costs",
            "list_contacts",
            "update_note",
            "update_cost",
            "update_contact",
            "delete_note",
            "delete_cost",
            "delete_contact",
            "get_funeral_info",
            "search_funeral_by_name",
          ];

          for (const toolName of toolsToRemove) {
            try {
              await realtimeClient.removeTool(toolName);
              console.log(`Removed tool: ${toolName}`);
            } catch (error) {
              // Tool might not exist, continue
            }
          }

          // Generate and register new tools for the selected mode
          const newTools = await toolFactory.generateTools(
            updatedAiContext,
            funeralContext
          );

          console.log(
            `Registering ${newTools.length} tools for mode ${args.mode}:`,
            newTools.map((t) => t.name)
          );

          for (const tool of newTools) {
            realtimeClient.addTool(
              {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters,
              },
              async (toolArgs: any) => {
                console.log(`${tool.name} called with args:`, toolArgs);
                try {
                  const result = await tool.handler(toolArgs, funeralContext);
                  console.log(`${tool.name} result:`, result);
                  return result;
                } catch (error) {
                  console.error(`Error in ${tool.name}:`, error);
                  return {
                    success: false,
                    message: `Fout bij ${tool.name}: ${
                      error instanceof Error ? error.message : "Unknown error"
                    }`,
                  };
                }
              }
            );
          }

          console.log(
            `Mode switched to: ${args.mode} with ${newTools.length} tools registered`
          );

          return {
            success: true,
            message: `Modus succesvol gezet naar: ${args.mode}. Je kunt nu de tools voor deze modus gebruiken.`,
            mode: args.mode,
            toolsRegistered: newTools.map((t) => t.name),
          };
        } catch (error) {
          console.error("Error setting funeral mode:", error);
          return {
            success: false,
            message: `Fout bij instellen van modus: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          };
        }
      }
    );
  }

  // Register each tool with the realtime client
  for (const tool of tools) {
    console.log(`Registering tool: ${tool.name}`);

    realtimeClient.addTool(
      {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
      async (args: any) => {
        console.log(`${tool.name} called with args:`, args);
        try {
          const result = await tool.handler(args, funeralContext);
          console.log(`${tool.name} result:`, result);
          return result;
        } catch (error) {
          console.error(`Error in ${tool.name}:`, error);
          return {
            success: false,
            message: `Fout bij ${tool.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          };
        }
      }
    );
  }

  console.log("All context-aware tools registered successfully");
}

/**
 * Store current funeral context for a realtime client
 */
const clientContexts = new Map<
  any,
  { funeralId: string; context: FuneralContext; aiContext: AIContextMetadata }
>();

/**
 * Update funeral context and instructions for an existing realtime client
 */
export async function updateFuneralContext(
  realtimeClient: any,
  newFuneralId: string,
  newFuneralContext: FuneralContext,
  newAiContext?: AIContextMetadata
) {
  try {
    console.log("Updating funeral context for:", newFuneralId);

    // Get current AI context if not provided
    const currentContext = clientContexts.get(realtimeClient);
    const aiContext = newAiContext ||
      currentContext?.aiContext || {
        page: "general",
        funeralId: newFuneralId,
        scope: "manage",
      };

    // Store the new context
    clientContexts.set(realtimeClient, {
      funeralId: newFuneralId,
      context: newFuneralContext,
      aiContext: aiContext,
    });

    // Generate new context-aware instructions
    const updatedInstructions = instructionBuilder.build(
      aiContext,
      newFuneralContext
    );

    console.log(
      "Updated instructions (first 200 chars):",
      updatedInstructions.substring(0, 200)
    );

    // Update the session with new instructions
    await realtimeClient.updateSession({
      instructions: updatedInstructions,
    });

    // Get all currently registered tools to remove them
    // Note: The exact method to get tool names might vary based on Stream SDK version
    console.log("Removing old tools...");

    // Try to remove common tool names
    const potentialToolNames = [
      "add_note",
      "update_note",
      "delete_note",
      "list_notes",
      "add_cost",
      "update_cost",
      "delete_cost",
      "list_costs",
      "add_contact",
      "update_contact",
      "delete_contact",
      "list_contacts",
      "get_funeral_info",
      "search_funeral_by_name",
      "create_funeral",
      "set_funeral_mode",
    ];

    for (const toolName of potentialToolNames) {
      try {
        await realtimeClient.removeTool(toolName);
        console.log(`Removed tool: ${toolName}`);
      } catch (error) {
        // Tool might not exist, continue
      }
    }

    // Re-register tools with new context
    await setupContextAwareTools(realtimeClient, newFuneralContext, aiContext);

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
export function getCurrentFuneralContext(realtimeClient: any): {
  funeralId: string;
  context: FuneralContext;
  aiContext: AIContextMetadata;
} | null {
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
export function getFuneralContextByCallId(callId: string): {
  funeralId: string;
  context: FuneralContext;
  aiContext: AIContextMetadata;
} | null {
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
