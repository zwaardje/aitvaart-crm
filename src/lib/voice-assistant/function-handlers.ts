import { NextResponse } from "next/server";
import { FuneralContext } from "./database";
import {
  createClient,
  addFuneralNote,
  addFuneralCost,
  addFuneralContact,
  searchFuneralByName,
  getFuneralContext,
} from "./database";
import {
  getDeceasedName,
  getClientName,
  extractContactFromTranscript,
  extractCostFromTranscript,
  extractContentFromTranscript,
} from "./transcript-parser";

/**
 * Handle funeral search by name
 */
export async function handleSearchFuneralCommand(
  transcript: string,
  deceasedName: string
) {
  try {
    console.log("Searching for funeral with name:", deceasedName);

    // Search for funeral by name
    const funeralData = await searchFuneralByName(deceasedName);

    if (!funeralData) {
      return NextResponse.json({
        success: false,
        message: `Ik kon geen uitvaart vinden voor de naam "${deceasedName}". Controleer de spelling of probeer een andere naam.`,
      });
    }

    // Get deceased and client names for confirmation
    const foundDeceasedName = getDeceasedName(funeralData.deceased);
    const clientName = getClientName(funeralData.client);

    return NextResponse.json({
      success: true,
      message: `Ik heb de uitvaart gevonden voor ${foundDeceasedName}. Client: ${clientName}. Je kunt nu vragen stellen over deze uitvaart of taken uitvoeren.`,
      funeralData: {
        id: funeralData.id,
        deceased: funeralData.deceased,
        client: funeralData.client,
        location: funeralData.location,
        signing_date: funeralData.signing_date,
        funeral_director: funeralData.funeral_director,
      },
    });
  } catch (error) {
    console.error("Error in handleSearchFuneralCommand:", error);
    return NextResponse.json({
      success: false,
      message: "Er is een fout opgetreden bij het zoeken naar de uitvaart.",
    });
  }
}

/**
 * Handle note addition command
 */
export async function handleNoteCommand(
  transcript: string,
  funeralId: string,
  funeralData: FuneralContext
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
  const deceasedName = getDeceasedName(funeralData.deceased);

  // Insert note into database
  const data = await addFuneralNote({
    funeral_id: funeralId,
    entrepreneur_id: funeralData.entrepreneur_id,
    title: `Notitie voor ${deceasedName}`,
    content: noteContent,
    created_by: funeralData.entrepreneur_id,
  });

  return NextResponse.json({
    success: true,
    message: `Notitie toegevoegd voor ${deceasedName}: "${noteContent}"`,
    action: "note_added",
    data,
  });
}

/**
 * Handle cost addition command
 */
export async function handleCostCommand(
  transcript: string,
  funeralId: string,
  funeralData: FuneralContext
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

  // Insert cost into database
  const data = await addFuneralCost({
    funeral_id: funeralId,
    entrepreneur_id: funeralData.entrepreneur_id,
    amount: costInfo.amount,
    description: costInfo.description,
  });

  // Get deceased name for message
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Kosten toegevoegd voor ${deceasedName}: €${costInfo.amount} voor ${costInfo.description}`,
    action: "cost_added",
    data,
  });
}

/**
 * Handle contact addition command
 */
export async function handleContactCommand(
  transcript: string,
  funeralId: string,
  funeralData: FuneralContext
) {
  console.log("handleContactCommand: Processing transcript:", transcript);

  // Extract contact information from transcript
  const contactInfo = extractContactFromTranscript(transcript);
  console.log("handleContactCommand: Extracted contact info:", contactInfo);

  if (!contactInfo) {
    return NextResponse.json({
      success: false,
      message:
        "Ik kon geen contact informatie herkennen. Probeer 'voeg contact toe: [naam] [telefoon] [email]'",
    });
  }

  // First, create or find the client
  let clientId = funeralData.client_id; // Use existing client as default

  if (
    contactInfo.name &&
    contactInfo.name !== funeralData.client?.preferred_name
  ) {
    // Create new client for this contact
    const newClient = await createClient({
      entrepreneur_id: funeralData.entrepreneur_id,
      preferred_name: contactInfo.name.split(" ")[0] || contactInfo.name,
      last_name: contactInfo.name.split(" ").slice(1).join(" ") || "",
      phone_number: contactInfo.phone || undefined,
      email: contactInfo.email || undefined,
    });

    clientId = newClient.id;
  }

  try {
    // Insert contact into database
    const data = await addFuneralContact({
      funeral_id: funeralId,
      entrepreneur_id: funeralData.entrepreneur_id,
      client_id: clientId,
      relation: contactInfo.relationship || "Familie",
      notes:
        contactInfo.phone || contactInfo.email
          ? `Telefoon: ${contactInfo.phone || "N/A"}, Email: ${
              contactInfo.email || "N/A"
            }`
          : undefined,
    });

    // Get deceased name for message
    const deceasedName = getDeceasedName(funeralData.deceased);

    return NextResponse.json({
      success: true,
      message: `Contact toegevoegd voor ${deceasedName}: ${contactInfo.name}`,
      action: "contact_added",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONTACT_EXISTS") {
      return NextResponse.json({
        success: false,
        message: `Contact "${contactInfo.name}" bestaat al voor deze uitvaart.`,
        action: "contact_exists",
      });
    }
    throw error;
  }
}

/**
 * Handle document command (placeholder)
 */
export async function handleDocumentCommand(
  transcript: string,
  funeralId: string,
  funeralData: FuneralContext
) {
  // For now, just acknowledge the document command
  // In a real implementation, you might want to trigger a file upload flow
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Document functionaliteit is nog in ontwikkeling. Gebruik de documenten sectie om bestanden toe te voegen voor ${deceasedName}.`,
    action: "document_acknowledged",
  });
}

/**
 * Handle function-based note addition
 */
export async function handleAddNoteFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { content, title, is_important = false } = args;

  if (!content) {
    throw new Error("Content is required for adding a note");
  }

  const deceasedName = getDeceasedName(funeralData.deceased);
  const noteTitle = title || `Notitie voor ${deceasedName}`;

  const data = await addFuneralNote({
    funeral_id: funeralData.id,
    entrepreneur_id: funeralData.entrepreneur_id,
    title: noteTitle,
    content: content,
    is_important: is_important,
    created_by: funeralData.entrepreneur_id,
  });

  return NextResponse.json({
    success: true,
    message: `Notitie toegevoegd voor ${deceasedName}: "${content}"`,
    action: "note_added",
    data,
  });
}

/**
 * Handle function-based cost addition
 */
export async function handleAddCostFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { amount, description } = args;

  if (!amount || !description) {
    throw new Error("Amount and description are required for adding costs");
  }

  const deceasedName = getDeceasedName(funeralData.deceased);

  const data = await addFuneralCost({
    funeral_id: funeralData.id,
    entrepreneur_id: funeralData.entrepreneur_id,
    amount: amount,
    description: description,
  });

  return NextResponse.json({
    success: true,
    message: `Kosten toegevoegd voor ${deceasedName}: €${amount} voor ${description}`,
    action: "cost_added",
    data,
  });
}

/**
 * Handle function-based contact addition
 */
export async function handleAddContactFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { name, phone, email, relationship = "Familie" } = args;

  if (!name) {
    throw new Error("Name is required for adding a contact");
  }

  const deceasedName = getDeceasedName(funeralData.deceased);

  // Create or find the client
  let clientId = funeralData.client_id;

  if (name !== funeralData.client?.preferred_name) {
    const newClient = await createClient({
      entrepreneur_id: funeralData.entrepreneur_id,
      preferred_name: name.split(" ")[0] || name,
      last_name: name.split(" ").slice(1).join(" ") || "",
      phone_number: phone || undefined,
      email: email || undefined,
    });

    clientId = newClient.id;
  }

  try {
    // Add contact
    const data = await addFuneralContact({
      funeral_id: funeralData.id,
      entrepreneur_id: funeralData.entrepreneur_id,
      client_id: clientId,
      relation: relationship,
      notes:
        phone || email
          ? `Telefoon: ${phone || "N/A"}, Email: ${email || "N/A"}`
          : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Contact toegevoegd voor ${deceasedName}: ${name}`,
      action: "contact_added",
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CONTACT_EXISTS") {
      return NextResponse.json({
        success: false,
        message: `Contact "${name}" bestaat al voor deze uitvaart.`,
        action: "contact_exists",
      });
    }
    throw error;
  }
}

/**
 * Handle function-based funeral search by name
 */
export async function handleSearchFuneralByNameFunction(
  args: any,
  realtimeClient?: any
) {
  const { deceased_name } = args;

  if (!deceased_name) {
    throw new Error("Deceased name is required for searching");
  }

  try {
    console.log("Searching for funeral with name:", deceased_name);

    // Search for funeral by name
    const funeralData = await searchFuneralByName(deceased_name);

    if (!funeralData) {
      return NextResponse.json({
        success: false,
        message: `Ik kon geen uitvaart vinden voor de naam "${deceased_name}". Controleer de spelling of probeer een andere naam.`,
      });
    }

    // Get deceased and client names for confirmation
    const foundDeceasedName = getDeceasedName(funeralData.deceased);
    const clientName = getClientName(funeralData.client);

    // If realtimeClient is provided, update the context
    let contextUpdateResult = null;
    if (realtimeClient) {
      try {
        // Import the update function dynamically to avoid circular dependencies
        const { updateFuneralContext } = await import("./stream-client");
        contextUpdateResult = await updateFuneralContext(
          realtimeClient,
          funeralData.id,
          funeralData
        );
        console.log("Context update result:", contextUpdateResult);
      } catch (updateError) {
        console.error("Error updating context:", updateError);
        // Continue with the response even if context update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ik heb de uitvaart gevonden voor ${foundDeceasedName}. Client: ${clientName}. Je kunt nu vragen stellen over deze uitvaart of taken uitvoeren.`,
      action: "funeral_found",
      funeralData: {
        id: funeralData.id,
        deceased: funeralData.deceased,
        client: funeralData.client,
        location: funeralData.location,
        signing_date: funeralData.signing_date,
        funeral_director: funeralData.funeral_director,
      },
      contextUpdated: contextUpdateResult?.success || false,
    });
  } catch (error) {
    console.error("Error in handleSearchFuneralByNameFunction:", error);
    return NextResponse.json({
      success: false,
      message: "Er is een fout opgetreden bij het zoeken naar de uitvaart.",
    });
  }
}

/**
 * Handle function-based funeral info retrieval
 */
export async function handleGetFuneralInfoFunction(
  funeralData: FuneralContext
) {
  const deceased = funeralData.deceased;
  const client = funeralData.client;

  const deceasedName =
    deceased?.preferred_name && deceased?.last_name
      ? `${deceased.preferred_name} ${deceased.last_name}`
      : deceased?.preferred_name || deceased?.first_names || "Onbekend";

  const clientName =
    client?.preferred_name && client?.last_name
      ? `${client.preferred_name} ${client.last_name}`
      : client?.preferred_name || "Onbekend";

  // Build comprehensive funeral information
  let infoMessage = `Uitvaart informatie voor ${deceasedName}:\n\n`;

  // Deceased information
  infoMessage += `👤 OVERLEDENE:\n`;
  infoMessage += `- Naam: ${deceasedName}\n`;
  if (deceased?.date_of_birth)
    infoMessage += `- Geboortedatum: ${deceased.date_of_birth}\n`;
  if (deceased?.date_of_death)
    infoMessage += `- Overlijdensdatum: ${deceased.date_of_death}\n`;
  if (deceased?.place_of_birth)
    infoMessage += `- Geboorteplaats: ${deceased.place_of_birth}\n`;
  if (deceased?.gender) infoMessage += `- Geslacht: ${deceased.gender}\n`;
  if (deceased?.social_security_number)
    infoMessage += `- BSN: ${deceased.social_security_number}\n`;

  infoMessage += `\n👥 OPDRACHTGEVER:\n`;
  infoMessage += `- Naam: ${clientName}\n`;
  if (client?.email) infoMessage += `- Email: ${client.email}\n`;
  if (client?.phone_number)
    infoMessage += `- Telefoon: ${client.phone_number}\n`;
  if (client?.street)
    infoMessage += `- Adres: ${client.street} ${client.house_number || ""} ${
      client.house_number_addition || ""
    }\n`;
  if (client?.city) infoMessage += `- Plaats: ${client.city}\n`;
  if (client?.postal_code) infoMessage += `- Postcode: ${client.postal_code}\n`;

  infoMessage += `\n🏢 UITVAART DETAILS:\n`;
  infoMessage += `- Locatie: ${funeralData.location || "Nog niet bepaald"}\n`;
  if (funeralData?.funeral_director)
    infoMessage += `- Uitvaartleider: ${funeralData.funeral_director}\n`;
  if (funeralData?.signing_date)
    infoMessage += `- Ondertekend op: ${funeralData.signing_date}\n`;
  infoMessage += `- Status: Actief\n`;

  return NextResponse.json({
    success: true,
    message: infoMessage,
    action: "funeral_info",
    data: funeralData,
  });
}
