import { NextRequest, NextResponse } from "next/server";
import { initializeStreamCall } from "@/lib/voice-assistant/stream-client";
import { FuneralContext } from "@/lib/voice-assistant/database";

export async function POST(request: NextRequest) {
  try {
    console.log("Initializing voice assistant...");

    // Initialize Stream call and AI
    try {
      const emptyContext: FuneralContext = {
        id: "",
        entrepreneur_id: "",
        deceased_id: "",
        client_id: "",
        created_at: "",
        updated_at: "",
      };
      const result = await initializeStreamCall("", emptyContext);
      console.log("Voice assistant initialized:", result);
      return NextResponse.json({
        ...result,
        success: true,
        message: "Voice assistant initialized successfully",
      });
    } catch (error) {
      console.error("Voice assistant initialization error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize voice assistant",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Voice assistant error:", error);
    return NextResponse.json(
      {
        error: "Failed to initialize voice assistant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
