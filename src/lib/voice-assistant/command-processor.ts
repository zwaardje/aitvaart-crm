import { NextResponse } from "next/server";
import { FuneralContext } from "./database";
import {
  handleNoteCommand,
  handleCostCommand,
  handleContactCommand,
  handleDocumentCommand,
  handleAddNoteFunction,
  handleAddCostFunction,
  handleAddContactFunction,
  handleGetFuneralInfoFunction,
  handleSearchFuneralCommand,
} from "./function-handlers";
import {
  OPENAI_FUNCTIONS,
  createFunctionCallFromTranscript,
} from "./openai-functions";
import { hasCommandPattern } from "./transcript-parser";

/**
 * Process voice commands - handles both search and regular commands
 */
export async function processSearchCommand(transcript: string) {
  console.log("Processing voice command:", transcript);

  // First, try to detect if this is a search command
  const searchPatterns = [
    /(?:zoek|find|vind|toon|show).*?(?:uitvaart|funeral)/i,
    /(?:uitvaart|funeral).*?(?:van|voor|for)/i,
  ];

  const isSearchCommand = searchPatterns.some((pattern) =>
    pattern.test(transcript)
  );

  if (isSearchCommand) {
    // Extract name from transcript for search
    const namePatterns = [
      /(?:zoek|find|vind|toon|show).*?([A-Za-z\s]+)/i,
      /(?:uitvaart|funeral).*?([A-Za-z\s]+)/i,
      /([A-Za-z\s]+).*?(?:uitvaart|funeral)/i,
    ];

    let deceasedName = "";
    for (const pattern of namePatterns) {
      const match = transcript.match(pattern);
      if (match && match[1]) {
        deceasedName = match[1].trim();
        break;
      }
    }

    // If no name found, try to extract any capitalized words
    if (!deceasedName) {
      const words = transcript.split(/\s+/);
      const capitalizedWords = words.filter(
        (word) =>
          word.length > 1 &&
          word[0] === word[0].toUpperCase() &&
          /^[A-Za-z]+$/.test(word)
      );
      if (capitalizedWords.length > 0) {
        deceasedName = capitalizedWords.join(" ");
      }
    }

    if (!deceasedName) {
      return NextResponse.json({
        success: false,
        message:
          "Ik kon geen naam herkennen in je bericht. Probeer bijvoorbeeld: 'zoek uitvaart voor Jan Jansen' of 'toon uitvaart van Maria de Vries'.",
      });
    }

    return await handleSearchFuneralCommand(transcript, deceasedName);
  }

  // If not a search command, try to process as a regular command
  // This will be handled by the AI assistant with context
  return NextResponse.json({
    success: true,
    message:
      "Ik heb je bericht ontvangen. Ik ga je helpen met je vraag over uitvaarten.",
    requiresContext: true,
  });
}

/**
 * Process voice commands and route to appropriate handlers
 */
export async function processVoiceCommand(
  transcript: string,
  funeralId: string,
  funeralContext: FuneralContext
) {
  console.log(`Processing voice command for funeral ${funeralId}:`, transcript);

  const lowerTranscript = transcript.toLowerCase();
  console.log("Lower transcript:", lowerTranscript);

  // Parse voice commands - check for specific patterns first
  if (
    hasCommandPattern(lowerTranscript, ["voeg", "kosten", "toe"]) ||
    hasCommandPattern(lowerTranscript, ["kosten"]) ||
    hasCommandPattern(lowerTranscript, ["cost"])
  ) {
    // Try to extract function call parameters using OpenAI function definitions
    const functionCall = createFunctionCallFromTranscript(
      transcript,
      "add_cost",
      OPENAI_FUNCTIONS
    );
    if (functionCall) {
      console.log("Using function call approach for cost:", functionCall);
      return await processFunctionCall(functionCall, funeralId, funeralContext);
    }

    // Fallback to old method
    console.log("Falling back to old method for cost");
    return await handleCostCommand(transcript, funeralId, funeralContext);
  }

  if (
    hasCommandPattern(lowerTranscript, ["voeg", "contact", "toe"]) ||
    hasCommandPattern(lowerTranscript, ["contact"]) ||
    hasCommandPattern(lowerTranscript, ["persoon"])
  ) {
    // Try to extract function call parameters using OpenAI function definitions
    const functionCall = createFunctionCallFromTranscript(
      transcript,
      "add_contact",
      OPENAI_FUNCTIONS
    );
    if (functionCall) {
      console.log("Using function call approach for contact:", functionCall);
      return await processFunctionCall(functionCall, funeralId, funeralContext);
    }

    // Fallback to old method
    console.log("Falling back to old method for contact");
    return await handleContactCommand(transcript, funeralId, funeralContext);
  }

  if (
    hasCommandPattern(lowerTranscript, ["voeg", "notitie", "toe"]) ||
    hasCommandPattern(lowerTranscript, ["notitie"]) ||
    hasCommandPattern(lowerTranscript, ["note"])
  ) {
    // Try to extract function call parameters using OpenAI function definitions
    const functionCall = createFunctionCallFromTranscript(
      transcript,
      "add_note",
      OPENAI_FUNCTIONS
    );
    if (functionCall) {
      console.log("Using function call approach for note:", functionCall);
      return await processFunctionCall(functionCall, funeralId, funeralContext);
    }

    // Fallback to old method
    console.log("Falling back to old method for note");
    return await handleNoteCommand(transcript, funeralId, funeralContext);
  }

  if (
    hasCommandPattern(lowerTranscript, ["document"]) ||
    hasCommandPattern(lowerTranscript, ["bestand"])
  ) {
    return await handleDocumentCommand(transcript, funeralId, funeralContext);
  }

  // Default response for unrecognized commands
  return NextResponse.json({
    success: true,
    message:
      "Ik heb je bericht ontvangen, maar kon geen specifieke actie herkennen. Probeer 'voeg notitie toe', 'voeg kosten toe', 'voeg contact toe', of 'voeg document toe'.",
    action: "unknown",
    transcript,
  });
}

/**
 * Process OpenAI function calls
 */
export async function processFunctionCall(
  functionCall: any,
  funeralId: string,
  funeralContext: FuneralContext
) {
  console.log(`Processing function call: ${functionCall.name}`, functionCall);

  // Process the function call
  switch (functionCall.name) {
    case "add_note":
      return await handleAddNoteFunction(
        functionCall.arguments,
        funeralContext
      );

    case "add_cost":
      return await handleAddCostFunction(
        functionCall.arguments,
        funeralContext
      );

    case "add_contact":
      return await handleAddContactFunction(
        functionCall.arguments,
        funeralContext
      );

    case "get_funeral_info":
      return await handleGetFuneralInfoFunction(funeralContext);

    default:
      throw new Error(`Unknown function: ${functionCall.name}`);
  }
}
