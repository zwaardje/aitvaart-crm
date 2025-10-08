import { NextRequest, NextResponse } from "next/server";
import { initializeStreamCall } from "@/lib/voice-assistant/stream-client";
import {
  FuneralContext,
  getFuneralContext,
} from "@/lib/voice-assistant/database";
import { AIContextMetadata } from "@/types/ai-context";
import { getSupabaseServer } from "@/lib/supabase/server";

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
        // No funeralId - get entrepreneur_id from authenticated user
        const supabase = getSupabaseServer();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          return NextResponse.json(
            {
              success: false,
              error: "Unauthorized",
              details: "User not authenticated",
            },
            { status: 401 }
          );
        }

        // Get user's organization
        const { data: membership } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single();

        const organization_id = membership?.organization_id || user.id; // Fallback to user.id if no org

        // Use context with user's ID as entrepreneur_id and organization_id
        funeralContext = {
          id: "",
          entrepreneur_id: user.id,
          organization_id: organization_id,
          deceased_id: "",
          client_id: "",
          created_at: "",
          updated_at: "",
        };

        console.log(
          "Using empty context with entrepreneur_id:",
          user.id,
          "organization_id:",
          organization_id
        );
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
