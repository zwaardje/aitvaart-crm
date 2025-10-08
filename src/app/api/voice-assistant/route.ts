import { NextRequest, NextResponse } from "next/server";
import { initializeStreamCall } from "@/lib/voice-assistant/stream-client";
import {
  FuneralContext,
  getFuneralContext,
} from "@/lib/voice-assistant/database";
import { AIContextMetadata } from "@/types/ai-context";

export async function POST(request: NextRequest) {
  try {
    console.log("Initializing voice assistant...");

    // Parse request body
    const body = await request.json();
    const { funeralId, aiContext } = body as {
      funeralId?: string;
      aiContext?: AIContextMetadata;
    };

    console.log("Request body:", { funeralId, aiContext });

    // Initialize Stream call and AI
    try {
      let funeralContext: FuneralContext;

      // If funeralId is provided, fetch the context
      if (funeralId) {
        console.log("Fetching funeral context for:", funeralId);
        const fetchedContext = await getFuneralContext(funeralId);

        if (!fetchedContext) {
          return NextResponse.json(
            {
              success: false,
              error: "Funeral not found",
              details: `No funeral found with ID: ${funeralId}`,
            },
            { status: 404 }
          );
        }

        funeralContext = fetchedContext;
        console.log("Funeral context fetched:", funeralContext);
      } else {
        // Use empty context as fallback
        funeralContext = {
          id: "",
          entrepreneur_id: "",
          deceased_id: "",
          client_id: "",
          created_at: "",
          updated_at: "",
        };
      }

      const result = await initializeStreamCall(
        funeralId || "",
        funeralContext,
        aiContext
      );

      console.log("Voice assistant initialized:", result);
      return NextResponse.json({
        ...result,
        success: true,
        message: "Voice assistant initialized successfully",
        aiContext: aiContext || null,
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
