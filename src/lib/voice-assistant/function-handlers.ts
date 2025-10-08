import { NextResponse } from "next/server";
import { FuneralContext } from "./database";
import {
  createClient,
  createCompleteFuneral,
  addFuneralNote,
  updateFuneralNote,
  deleteFuneralNote,
  listFuneralNotes,
  addFuneralCost,
  updateFuneralCost,
  deleteFuneralCost,
  listFuneralCosts,
  addFuneralContact,
  updateFuneralContact,
  deleteFuneralContact,
  listFuneralContacts,
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

/**
 * Handle function-based note update
 */
export async function handleUpdateNoteFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { noteId, content, title, is_important } = args;

  if (!noteId) {
    throw new Error("Note ID is required for updating a note");
  }

  const updateData: any = {};
  if (content !== undefined) updateData.content = content;
  if (title !== undefined) updateData.title = title;
  if (is_important !== undefined) updateData.is_important = is_important;

  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  const data = await updateFuneralNote(noteId, updateData);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Notitie bijgewerkt voor ${deceasedName}`,
    action: "note_updated",
    data,
  });
}

/**
 * Handle function-based note deletion
 */
export async function handleDeleteNoteFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { noteId } = args;

  if (!noteId) {
    throw new Error("Note ID is required for deleting a note");
  }

  await deleteFuneralNote(noteId);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Notitie verwijderd voor ${deceasedName}`,
    action: "note_deleted",
  });
}

/**
 * Handle function-based notes listing
 */
export async function handleListNotesFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { important_only = false } = args;

  const notes = await listFuneralNotes(funeralData.id, important_only);
  const deceasedName = getDeceasedName(funeralData.deceased);

  let message = `Notities voor ${deceasedName}:\n\n`;
  if (notes.length === 0) {
    message += "Geen notities gevonden.";
  } else {
    notes.forEach((note: any, index: number) => {
      message += `${index + 1}. ${note.title || "Zonder titel"}\n`;
      message += `   ${note.content}\n`;
      if (note.is_important) message += `   ⭐ Belangrijk\n`;
      message += `   (ID: ${note.id})\n\n`;
    });
  }

  return NextResponse.json({
    success: true,
    message,
    action: "notes_listed",
    data: notes,
  });
}

/**
 * Handle function-based cost update
 */
export async function handleUpdateCostFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { costId, amount, description } = args;

  if (!costId) {
    throw new Error("Cost ID is required for updating costs");
  }

  const updateData: any = {};
  if (amount !== undefined) updateData.amount = amount;
  if (description !== undefined) updateData.description = description;

  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  const data = await updateFuneralCost(costId, updateData);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Kosten bijgewerkt voor ${deceasedName}`,
    action: "cost_updated",
    data,
  });
}

/**
 * Handle function-based cost deletion
 */
export async function handleDeleteCostFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { costId } = args;

  if (!costId) {
    throw new Error("Cost ID is required for deleting costs");
  }

  await deleteFuneralCost(costId);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Kosten verwijderd voor ${deceasedName}`,
    action: "cost_deleted",
  });
}

/**
 * Handle function-based costs listing
 */
export async function handleListCostsFunction(
  args: any,
  funeralData: FuneralContext
) {
  const costs = await listFuneralCosts(funeralData.id);
  const deceasedName = getDeceasedName(funeralData.deceased);

  let message = `Kosten voor ${deceasedName}:\n\n`;
  if (costs.length === 0) {
    message += "Geen kosten gevonden.";
  } else {
    let total = 0;
    costs.forEach((cost: any, index: number) => {
      message += `${index + 1}. €${cost.amount} - ${cost.description}\n`;
      message += `   (ID: ${cost.id})\n`;
      total += parseFloat(cost.amount);
    });
    message += `\nTotaal: €${total.toFixed(2)}`;
  }

  return NextResponse.json({
    success: true,
    message,
    action: "costs_listed",
    data: costs,
  });
}

/**
 * Handle function-based contact update
 */
export async function handleUpdateContactFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { contactId, name, phone, email, relationship } = args;

  if (!contactId) {
    throw new Error("Contact ID is required for updating a contact");
  }

  const updateData: any = {};
  if (relationship !== undefined) updateData.relation = relationship;

  // Build notes field if phone or email changed
  if (phone !== undefined || email !== undefined) {
    updateData.notes = `Telefoon: ${phone || "N/A"}, Email: ${email || "N/A"}`;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  const data = await updateFuneralContact(contactId, updateData);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Contact bijgewerkt voor ${deceasedName}`,
    action: "contact_updated",
    data,
  });
}

/**
 * Handle function-based contact deletion
 */
export async function handleDeleteContactFunction(
  args: any,
  funeralData: FuneralContext
) {
  const { contactId } = args;

  if (!contactId) {
    throw new Error("Contact ID is required for deleting a contact");
  }

  await deleteFuneralContact(contactId);
  const deceasedName = getDeceasedName(funeralData.deceased);

  return NextResponse.json({
    success: true,
    message: `Contact verwijderd voor ${deceasedName}`,
    action: "contact_deleted",
  });
}

/**
 * Handle function-based contacts listing
 */
export async function handleListContactsFunction(
  args: any,
  funeralData: FuneralContext
) {
  const contacts = await listFuneralContacts(funeralData.id);
  const deceasedName = getDeceasedName(funeralData.deceased);

  let message = `Contacten voor ${deceasedName}:\n\n`;
  if (contacts.length === 0) {
    message += "Geen contacten gevonden.";
  } else {
    contacts.forEach((contact: any, index: number) => {
      const clientName = contact.client?.preferred_name || "Onbekend";
      message += `${index + 1}. ${clientName}`;
      if (contact.client?.last_name) message += ` ${contact.client.last_name}`;
      message += `\n`;
      message += `   Relatie: ${contact.relation}\n`;
      if (contact.client?.phone_number)
        message += `   Telefoon: ${contact.client.phone_number}\n`;
      if (contact.client?.email)
        message += `   Email: ${contact.client.email}\n`;
      if (contact.notes) message += `   Notities: ${contact.notes}\n`;
      message += `   (ID: ${contact.id})\n\n`;
    });
  }

  return NextResponse.json({
    success: true,
    message,
    action: "contacts_listed",
    data: contacts,
  });
}

/**
 * Handle create complete funeral function
 * Creates deceased, client, and funeral in one operation
 */
export async function handleCreateFuneralFunction(
  args: any,
  context: FuneralContext
) {
  const {
    deceased_first_names,
    deceased_last_name,
    deceased_preferred_name,
    deceased_date_of_birth,
    deceased_place_of_birth,
    deceased_date_of_death,
    deceased_gender,
    deceased_social_security_number,
    client_preferred_name,
    client_last_name,
    client_phone_number,
    client_email,
    client_street,
    client_house_number,
    client_house_number_addition,
    client_postal_code,
    client_city,
    funeral_location,
    funeral_signing_date,
    funeral_director,
  } = args;

  // Validate required fields
  if (!deceased_first_names || !deceased_last_name) {
    return NextResponse.json({
      success: false,
      message:
        "Overledene voor- en achternaam zijn verplicht. Vraag de gebruiker om deze gegevens.",
    });
  }

  if (!client_preferred_name || !client_last_name || !client_phone_number) {
    return NextResponse.json({
      success: false,
      message:
        "Opdrachtgever voor- en achternaam en telefoonnummer zijn verplicht. Vraag de gebruiker om deze gegevens.",
    });
  }

  try {
    console.log("Creating complete funeral with data:", {
      deceased: { deceased_first_names, deceased_last_name },
      client: { client_preferred_name, client_last_name },
    });

    const funeralData = await createCompleteFuneral({
      entrepreneur_id: context.entrepreneur_id,
      deceased: {
        first_names: deceased_first_names,
        last_name: deceased_last_name,
        preferred_name: deceased_preferred_name,
        date_of_birth: deceased_date_of_birth,
        place_of_birth: deceased_place_of_birth,
        date_of_death: deceased_date_of_death,
        gender: deceased_gender,
        social_security_number: deceased_social_security_number,
      },
      client: {
        preferred_name: client_preferred_name,
        last_name: client_last_name,
        phone_number: client_phone_number,
        email: client_email,
        street: client_street,
        house_number: client_house_number,
        house_number_addition: client_house_number_addition,
        postal_code: client_postal_code,
        city: client_city,
      },
      funeral: {
        location: funeral_location,
        signing_date: funeral_signing_date,
        funeral_director: funeral_director,
      },
    });

    const deceasedName = getDeceasedName(funeralData.deceased);
    const clientName = getClientName(funeralData.client);

    return NextResponse.json({
      success: true,
      message: `✅ Uitvaart succesvol aangemaakt voor ${deceasedName}. Opdrachtgever: ${clientName}. Uitvaart ID: ${funeralData.id}`,
      action: "funeral_created",
      data: {
        funeral_id: funeralData.id,
        deceased_name: deceasedName,
        client_name: clientName,
        location: funeralData.location,
      },
    });
  } catch (error) {
    console.error("Error creating funeral:", error);
    return NextResponse.json({
      success: false,
      message: `Er is een fout opgetreden bij het aanmaken van de uitvaart: ${
        error instanceof Error ? error.message : "Onbekende fout"
      }`,
    });
  }
}
