import { NextRequest, NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";
import { env } from "@/lib/env";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { funeralId, action, transcript, command } = await request.json();

    console.log("Voice assistant request:", {
      funeralId,
      action,
      transcript,
      command,
    });

    // Handle voice command processing
    if (action === "process_command" && transcript) {
      console.log("Processing voice command:", { transcript, funeralId });
      try {
        const result = await processVoiceCommand(transcript, funeralId);
        console.log("Voice command result:", result);
        return result;
      } catch (error) {
        console.error("Voice command processing error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Voice command processing failed",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Check if required environment variables are set
    if (!env.STREAM_API_KEY || !env.STREAM_API_SECRET) {
      console.error("Missing Stream credentials:", {
        STREAM_API_KEY: !!env.STREAM_API_KEY,
        STREAM_API_SECRET: !!env.STREAM_API_SECRET,
      });
      return NextResponse.json(
        { error: "Stream credentials not configured" },
        { status: 500 }
      );
    }

    // Initialize Stream client
    const streamClient = new StreamClient(
      env.STREAM_API_KEY,
      env.STREAM_API_SECRET
    );

    // Create a unique call ID for this voice session (max 64 characters)
    const shortId = crypto.randomUUID().substring(0, 8);
    const callId = `funeral-${funeralId}-${shortId}`;
    console.log("Creating call with ID:", callId);

    try {
      // Create the call with user information
      const call = streamClient.video.call("default", callId);

      // Get or create the call with user data
      const callData = await call.getOrCreate({
        data: {
          created_by_id: "user",
        },
      });
      console.log("Call created successfully:", callData);

      // Try to connect to OpenAI Realtime API (if available in this version)
      let realtimeClient = null;
      try {
        if (env.OPENAI_API_KEY && streamClient.video.connectOpenAi) {
          console.log("Attempting to connect to OpenAI Realtime...");
          realtimeClient = await streamClient.video.connectOpenAi({
            call,
            openAiApiKey: env.OPENAI_API_KEY,
            agentUserId: "funeral-assistant",
          });
          console.log("OpenAI Realtime connected successfully");

          // Initialize Supabase client for context
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // Get funeral context for AI instructions
          const { data: funeralContext, error: contextError } = await supabase
            .from("funerals")
            .select(
              `
              id,
              entrepreneur_id,
              deceased_id,
              client_id,
              location,
              signing_date,
              funeral_director
            `
            )
            .eq("id", funeralId)
            .single();

          if (contextError || !funeralContext) {
            console.error(
              "Error getting funeral context for AI:",
              contextError
            );
            // Continue without context rather than failing
          }

          // Get deceased and client data separately for AI context
          let deceasedContext = null;
          let clientContext = null;

          if (funeralContext) {
            const { data: deceasedData } = await supabase
              .from("deceased")
              .select("first_name, last_name, date_of_birth, date_of_death")
              .eq("id", funeralContext.deceased_id)
              .single();

            const { data: clientData } = await supabase
              .from("clients")
              .select("first_name, last_name, email, phone")
              .eq("id", funeralContext.client_id)
              .single();

            deceasedContext = deceasedData;
            clientContext = clientData;
          }

          console.log("Funeral context for AI:", {
            funeralContext,
            contextError,
            deceased: deceasedContext,
            client: clientContext,
          });

          // Set up funeral-specific instructions
          const funeralInstructions = `
Je bent een Nederlandse voice assistant voor uitvaartbegeleiders. 
Je helpt bij het beheren van uitvaarten en hun details.

HUIDIGE UITVAART CONTEXT:
- Uitvaart ID: ${funeralId}
- Overledene: ${deceasedContext?.first_name || "Onbekend"} ${
            deceasedContext?.last_name || ""
          }
- Overlijdensdatum: ${deceasedContext?.date_of_death || "Onbekend"}
- Locatie: ${funeralContext?.location || "Nog niet bepaald"}
- Uitvaartleider: ${funeralContext?.funeral_director || "Nog niet toegewezen"}
- Opdrachtgever: ${clientContext?.first_name || "Onbekend"} ${
            clientContext?.last_name || ""
          }

Je kunt helpen met:
- Notities toevoegen en beheren
- Kosten bijhouden en leveranciers
- Contacten van familie en vrienden
- Documenten zoeken en organiseren
- Scenario's doorlopen voor verschillende onderdelen
- Algemene vragen over uitvaartbegeleiding

DATABASE FUNCTIONALITEIT:
Je kunt direct data toevoegen aan de database door te zeggen:
- "Voeg notitie toe: [jouw notitie]" - voegt een notitie toe
- "Voeg kosten toe: [bedrag] voor [beschrijving]" - voegt kosten toe
- "Voeg contact toe: naam [naam] telefoon [nummer] email [email]" - voegt contact toe
- "Voeg document toe" - geeft instructies voor document upload

Wanneer je data toevoegt, bevestig dit altijd met een korte samenvatting en verwijs naar de overledene.

Wees vriendelijk, professioneel en spreek Nederlands.
Geef korte, duidelijke antwoorden en vraag door als je meer informatie nodig hebt.
`;

          // Configure the AI agent
          await realtimeClient.updateSession({
            instructions: funeralInstructions,
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          });

          console.log("AI agent configured successfully");
        }
      } catch (openaiError) {
        console.log("OpenAI Realtime not available:", openaiError);
      }

      // Generate a user token for the frontend
      const userToken = streamClient.createToken("user");

      return NextResponse.json({
        success: true,
        callId,
        message: realtimeClient
          ? "Voice assistant session created with AI"
          : "Voice assistant session created (basic)",
        token: userToken,
        hasAI: !!realtimeClient,
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
        },
      });
    } catch (callError) {
      console.error("Call creation error:", callError);
      return NextResponse.json(
        {
          error: "Failed to create Stream call",
          details:
            callError instanceof Error
              ? callError.message
              : "Unknown call error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Voice assistant error:", error);
    return NextResponse.json(
      {
        error: "Failed to create voice assistant session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function processVoiceCommand(transcript: string, funeralId: string) {
  console.log(`Processing voice command for funeral ${funeralId}:`, transcript);

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Supabase client initialized for voice command processing");

    // Get funeral context data
    const { data: funeralData, error: funeralError } = await supabase
      .from("funerals")
      .select(
        `
        id,
        entrepreneur_id,
        deceased_id,
        client_id,
        location,
        signing_date,
        funeral_director
      `
      )
      .eq("id", funeralId)
      .single();

    if (funeralError || !funeralData) {
      throw new Error(
        `Funeral not found: ${funeralError?.message || "Unknown error"}`
      );
    }

    // Get deceased data separately
    const { data: deceasedData, error: deceasedError } = await supabase
      .from("deceased")
      .select("first_name, last_name, date_of_birth, date_of_death")
      .eq("id", funeralData.deceased_id)
      .single();

    // Get client data separately
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("first_name, last_name, email, phone")
      .eq("id", funeralData.client_id)
      .single();

    // Combine all data
    const combinedFuneralData = {
      ...funeralData,
      deceased: deceasedData,
      client: clientData,
    };

    console.log("Funeral context:", {
      funeralData,
      deceased: combinedFuneralData?.deceased,
      client: combinedFuneralData?.client,
      entrepreneur_id: combinedFuneralData?.entrepreneur_id,
    });

    const lowerTranscript = transcript.toLowerCase();

    // Parse voice commands
    if (
      lowerTranscript.includes("notitie") ||
      lowerTranscript.includes("note")
    ) {
      return await handleNoteCommand(
        transcript,
        funeralId,
        combinedFuneralData,
        supabase
      );
    }

    if (
      lowerTranscript.includes("kosten") ||
      lowerTranscript.includes("cost")
    ) {
      return await handleCostCommand(
        transcript,
        funeralId,
        combinedFuneralData,
        supabase
      );
    }

    if (
      lowerTranscript.includes("contact") ||
      lowerTranscript.includes("persoon")
    ) {
      return await handleContactCommand(
        transcript,
        funeralId,
        combinedFuneralData,
        supabase
      );
    }

    if (
      lowerTranscript.includes("document") ||
      lowerTranscript.includes("bestand")
    ) {
      return await handleDocumentCommand(
        transcript,
        funeralId,
        combinedFuneralData,
        supabase
      );
    }

    // Default response for unrecognized commands
    return NextResponse.json({
      success: true,
      message:
        "Ik heb je bericht ontvangen, maar kon geen specifieke actie herkennen. Probeer 'voeg notitie toe', 'voeg kosten toe', 'voeg contact toe', of 'voeg document toe'.",
      action: "unknown",
      transcript,
    });
  } catch (error) {
    console.error("Error processing voice command:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Fout bij verwerken van voice command",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleNoteCommand(
  transcript: string,
  funeralId: string,
  funeralData: any,
  supabase: any
) {
  // Extract note content from transcript
  const noteContent = extractContentFromTranscript(transcript, [
    "notitie",
    "note",
  ]);

  if (!noteContent) {
    return NextResponse.json({
      success: false,
      message:
        "Ik kon geen notitie inhoud herkennen. Probeer 'voeg notitie toe: [jouw notitie]'",
    });
  }

  // Get deceased name for title and message
  const deceasedName = Array.isArray(funeralData.deceased)
    ? funeralData.deceased[0]?.first_name || "overledene"
    : (funeralData.deceased as any)?.first_name || "overledene";

  // Insert note into database with all required fields
  const { data, error } = await supabase
    .from("funeral_notes")
    .insert({
      funeral_id: funeralId,
      entrepreneur_id: funeralData.entrepreneur_id,
      title: `Notitie voor ${deceasedName}`,
      content: noteContent,
      created_at: new Date().toISOString(),
      created_by: funeralData.entrepreneur_id, // Assuming the entrepreneur is creating the note
    })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return NextResponse.json({
    success: true,
    message: `Notitie toegevoegd voor ${deceasedName}: "${noteContent}"`,
    action: "note_added",
    data: data[0],
  });
}

async function handleCostCommand(
  transcript: string,
  funeralId: string,
  funeralData: any,
  supabase: any
) {
  // Extract cost information from transcript
  const costInfo = extractCostFromTranscript(transcript);

  if (!costInfo) {
    return NextResponse.json({
      success: false,
      message:
        "Ik kon geen kosten informatie herkennen. Probeer 'voeg kosten toe: [bedrag] voor [beschrijving]'",
    });
  }

  // Insert cost into database with all required fields
  const { data, error } = await supabase
    .from("funeral_costs")
    .insert({
      funeral_id: funeralId,
      entrepreneur_id: funeralData.entrepreneur_id,
      amount: costInfo.amount,
      description: costInfo.description,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // Get deceased name for message
  const deceasedName = Array.isArray(funeralData.deceased)
    ? funeralData.deceased[0]?.first_name || "overledene"
    : (funeralData.deceased as any)?.first_name || "overledene";

  return NextResponse.json({
    success: true,
    message: `Kosten toegevoegd voor ${deceasedName}: €${costInfo.amount} voor ${costInfo.description}`,
    action: "cost_added",
    data: data[0],
  });
}

async function handleContactCommand(
  transcript: string,
  funeralId: string,
  funeralData: any,
  supabase: any
) {
  // Extract contact information from transcript
  const contactInfo = extractContactFromTranscript(transcript);

  if (!contactInfo) {
    return NextResponse.json({
      success: false,
      message:
        "Ik kon geen contact informatie herkennen. Probeer 'voeg contact toe: [naam] [telefoon] [email]'",
    });
  }

  // First, create or find the client
  let clientId = funeralData.client_id; // Use existing client as default

  if (contactInfo.name && contactInfo.name !== funeralData.client?.first_name) {
    // Create new client for this contact
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        entrepreneur_id: funeralData.entrepreneur_id,
        first_name: contactInfo.name.split(" ")[0] || contactInfo.name,
        last_name: contactInfo.name.split(" ").slice(1).join(" ") || "",
        email: contactInfo.email || null,
        phone: contactInfo.phone || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (clientError) {
      throw new Error(`Client creation error: ${clientError.message}`);
    }

    clientId = newClient.id;
  }

  // Insert contact into database with all required fields
  const { data, error } = await supabase
    .from("funeral_contacts")
    .insert({
      funeral_id: funeralId,
      entrepreneur_id: funeralData.entrepreneur_id,
      client_id: clientId,
      relation: contactInfo.relationship || "Familie",
      notes:
        contactInfo.phone || contactInfo.email
          ? `Telefoon: ${contactInfo.phone || "N/A"}, Email: ${
              contactInfo.email || "N/A"
            }`
          : null,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // Get deceased name for message
  const deceasedName = Array.isArray(funeralData.deceased)
    ? funeralData.deceased[0]?.first_name || "overledene"
    : (funeralData.deceased as any)?.first_name || "overledene";

  return NextResponse.json({
    success: true,
    message: `Contact toegevoegd voor ${deceasedName}: ${contactInfo.name}`,
    action: "contact_added",
    data: data[0],
  });
}

async function handleDocumentCommand(
  transcript: string,
  funeralId: string,
  funeralData: any,
  supabase: any
) {
  // For now, just acknowledge the document command
  // In a real implementation, you might want to trigger a file upload flow
  // Get deceased name for message
  const deceasedName = Array.isArray(funeralData.deceased)
    ? funeralData.deceased[0]?.first_name || "overledene"
    : (funeralData.deceased as any)?.first_name || "overledene";

  return NextResponse.json({
    success: true,
    message: `Document functionaliteit is nog in ontwikkeling. Gebruik de documenten sectie om bestanden toe te voegen voor ${deceasedName}.`,
    action: "document_acknowledged",
  });
}

function extractContentFromTranscript(
  transcript: string,
  keywords: string[]
): string | null {
  const lowerTranscript = transcript.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerTranscript.indexOf(keyword);
    if (index !== -1) {
      // Extract content after the keyword
      const afterKeyword = transcript.substring(index + keyword.length).trim();
      // Remove common prefixes
      const content = afterKeyword.replace(/^(toe|add|:)/i, "").trim();
      if (content.length > 0) {
        return content;
      }
    }
  }

  return null;
}

function extractCostFromTranscript(
  transcript: string
): { amount: number; description: string } | null {
  const lowerTranscript = transcript.toLowerCase();

  // Look for patterns like "€50", "50 euro", "50 euro's", etc.
  const amountMatch = lowerTranscript.match(
    /(?:€|euro|euro's?)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|euro|euro's?)/
  );

  if (!amountMatch) return null;

  const amount = parseFloat(
    (amountMatch[1] || amountMatch[2]).replace(",", ".")
  );

  // Extract description - look for "voor" or "for"
  const descriptionMatch = lowerTranscript.match(/(?:voor|for)\s+(.+)/);
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : "Onbekende kosten";

  return { amount, description };
}

function extractContactFromTranscript(transcript: string): {
  name: string;
  phone?: string;
  email?: string;
  relationship?: string;
} | null {
  const lowerTranscript = transcript.toLowerCase();

  // Look for name patterns
  const nameMatch = lowerTranscript.match(
    /(?:naam|name)\s+([a-zA-Z\s]+?)(?:\s|$|telefoon|phone|email)/
  );
  if (!nameMatch) return null;

  const name = nameMatch[1].trim();

  // Look for phone patterns
  const phoneMatch = lowerTranscript.match(
    /(?:telefoon|phone)\s+([0-9\s\-\+\(\)]+)/
  );
  const phone = phoneMatch ? phoneMatch[1].trim() : undefined;

  // Look for email patterns
  const emailMatch = lowerTranscript.match(
    /(?:email|e-mail)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  );
  const email = emailMatch ? emailMatch[1].trim() : undefined;

  return { name, phone, email };
}
