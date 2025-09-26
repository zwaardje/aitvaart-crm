import { NextRequest, NextResponse } from "next/server";
import { processVoiceCommand } from "@/lib/voice-assistant/command-processor";
import { getCurrentFuneralContext } from "@/lib/voice-assistant/stream-client";

export async function POST(request: NextRequest) {
  try {
    const { message, callId } = await request.json();

    if (!message || !callId) {
      return NextResponse.json(
        {
          success: false,
          error: "Message and callId are required",
        },
        { status: 400 }
      );
    }

    console.log("Received text message:", { message, callId });

    // Get current funeral context for this call
    // Note: We'll need to store the realtimeClient reference to get context
    // For now, we'll use a simplified approach

    // TODO: Get funeral context from stored client reference
    // const context = getCurrentFuneralContext(realtimeClient);

    // For now, use empty context - this will be improved when we integrate with Stream
    const emptyContext = {
      id: "",
      entrepreneur_id: "",
      deceased_id: "",
      client_id: "",
      created_at: "",
      updated_at: "",
    };

    // Process the text message using existing command processor
    const result = await processVoiceCommand(
      message,
      "", // funeralId - will be populated from context
      emptyContext
    );

    console.log("Text message processed:", result);

    return NextResponse.json({
      success: true,
      result,
      message: "Text message processed successfully",
    });
  } catch (error) {
    console.error("Text message processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process text message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
