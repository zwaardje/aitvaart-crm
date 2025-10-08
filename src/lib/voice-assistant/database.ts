import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export interface FuneralContext {
  id: string;
  entrepreneur_id: string;
  organization_id?: string;
  deceased_id: string;
  client_id: string;
  location?: string;
  signing_date?: string;
  funeral_director?: string;
  created_at: string;
  updated_at: string;
  deceased?: {
    first_names?: string;
    preferred_name?: string;
    last_name?: string;
    date_of_birth?: string;
    date_of_death?: string;
    place_of_birth?: string;
    gender?: string;
    social_security_number?: string;
  };
  client?: {
    preferred_name?: string;
    last_name?: string;
    gender?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    street?: string;
    house_number?: string;
    house_number_addition?: string;
    postal_code?: string;
    city?: string;
    phone_number?: string;
    email?: string;
  };
}

/**
 * Search for funeral by deceased name
 */
export async function searchFuneralByName(
  deceasedName: string
): Promise<FuneralContext | null> {
  try {
    console.log("searchFuneralByName: Searching for:", deceasedName);

    // Initialize Supabase client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Split the name into parts for more flexible searching
    const nameParts = deceasedName.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    console.log("Searching with name parts:", {
      fullName: deceasedName,
      firstName,
      lastName,
    });

    // First, find deceased records that match the name
    // Try different search patterns: full name, first name, last name, and combinations
    const searchPatterns = [
      `first_names.ilike.%${deceasedName}%`, // Full name in first_names
      `last_name.ilike.%${deceasedName}%`, // Full name in last_name
      `preferred_name.ilike.%${deceasedName}%`, // Full name in preferred_name
    ];

    // Add individual name part searches if we have multiple parts
    if (nameParts.length > 1) {
      searchPatterns.push(
        `first_names.ilike.%${firstName}%`, // First name only
        `last_name.ilike.%${lastName}%`, // Last name only
        `preferred_name.ilike.%${firstName}%`, // First name in preferred_name
        `preferred_name.ilike.%${lastName}%` // Last name in preferred_name
      );
    }

    const { data: deceasedRecords, error: deceasedError } = await supabase
      .from("deceased")
      .select("id, first_names, last_name, preferred_name")
      .or(searchPatterns.join(","))
      .limit(5); // Get more results to see what we find

    if (deceasedError) {
      console.error("Error searching deceased records:", deceasedError);
      return null;
    }

    if (!deceasedRecords || deceasedRecords.length === 0) {
      console.log("No deceased records found for name:", deceasedName);
      return null;
    }

    console.log(
      "Found deceased records:",
      deceasedRecords.map((r) => ({
        id: r.id,
        first_names: r.first_names,
        last_name: r.last_name,
        preferred_name: r.preferred_name,
      }))
    );

    const deceasedId = deceasedRecords[0].id;
    console.log("Using deceased record with ID:", deceasedId);

    // Now get the funeral data for this deceased person
    const { data: funerals, error } = await supabase
      .from("funerals")
      .select(
        `
        id,
        entrepreneur_id,
        deceased_id,
        client_id,
        location,
        signing_date,
        funeral_director,
        created_at,
        updated_at,
        deceased:deceased_id (
          first_names,
          preferred_name,
          last_name,
          date_of_birth,
          date_of_death,
          place_of_birth,
          gender,
          social_security_number
        ),
        client:client_id (
          preferred_name,
          last_name,
          gender,
          date_of_birth,
          place_of_birth,
          street,
          house_number,
          house_number_addition,
          postal_code,
          city,
          phone_number,
          email
        )
      `
      )
      .eq("deceased_id", deceasedId)
      .limit(1);

    if (error) {
      console.error("Error searching funeral by name:", error);
      return null;
    }

    if (!funerals || funerals.length === 0) {
      console.log("No funeral found for deceased ID:", deceasedId);
      return null;
    }

    const funeral = funerals[0];
    console.log("Found funeral:", funeral.id);

    return funeral as FuneralContext;
  } catch (error) {
    console.error("Error in searchFuneralByName:", error);
    return null;
  }
}

/**
 * Get comprehensive funeral context including deceased and client data
 */
export async function getFuneralContext(
  funeralId: string
): Promise<FuneralContext | null> {
  try {
    console.log("getFuneralContext: Starting with funeralId:", funeralId);

    // Initialize Supabase client
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("getFuneralContext: Supabase client initialized");

    // Get comprehensive funeral context
    const { data: funeralData, error: funeralError } = await supabase
      .from("funerals")
      .select(
        `
        id,
        entrepreneur_id,
        organization_id,
        deceased_id,
        client_id,
        location,
        signing_date,
        funeral_director,
        created_at,
        updated_at
      `
      )
      .eq("id", funeralId)
      .single();

    console.log("getFuneralContext: Funeral query result:", {
      funeralData,
      funeralError,
      hasData: !!funeralData,
      errorMessage: funeralError?.message,
    });

    if (funeralError || !funeralData) {
      console.error("Error fetching funeral data:", {
        error: funeralError,
        message: funeralError?.message,
        details: funeralError?.details,
        hint: funeralError?.hint,
        code: funeralError?.code,
      });
      return null;
    }

    // Get deceased data
    const { data: deceasedData, error: deceasedError } = await supabase
      .from("deceased")
      .select(
        "first_names, preferred_name, last_name, date_of_birth, date_of_death, place_of_birth, gender, social_security_number"
      )
      .eq("id", funeralData.deceased_id)
      .single();

    if (deceasedError) {
      console.error("Error fetching deceased data:", deceasedError);
    }

    // Get client data
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select(
        "preferred_name, last_name, gender, date_of_birth, place_of_birth, street, house_number, house_number_addition, postal_code, city, phone_number, email"
      )
      .eq("id", funeralData.client_id)
      .single();

    if (clientError) {
      console.error("Error fetching client data:", clientError);
    }

    // Combine all data
    return {
      ...funeralData,
      deceased: deceasedData || undefined,
      client: clientData || undefined,
    };
  } catch (error) {
    console.error("Error in getFuneralContext:", error);
    return null;
  }
}

/**
 * Create a new client in the database
 */
export async function createClient(clientData: {
  entrepreneur_id: string;
  organization_id?: string;
  preferred_name: string;
  last_name: string; // REQUIRED in database schema
  phone_number?: string;
  email?: string;
  gender?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  street?: string;
  house_number?: string;
  house_number_addition?: string;
  postal_code?: string;
  city?: string;
}) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("clients")
    .insert({
      ...clientData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Client creation error: ${error.message}`);
  }

  return data;
}

/**
 * Create a new deceased person in the database
 */
export async function createDeceased(deceasedData: {
  entrepreneur_id: string;
  organization_id?: string;
  first_names: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  date_of_death?: string;
  gender?: string;
  social_security_number?: string;
}) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("deceased")
    .insert({
      ...deceasedData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Deceased creation error: ${error.message}`);
  }

  return data;
}

/**
 * Create a complete funeral (deceased + client + funeral) in one operation
 * This is used by the AI voice assistant to create new funerals from speech
 */
export async function createCompleteFuneral(params: {
  entrepreneur_id: string;
  organization_id?: string;
  deceased: {
    first_names: string;
    last_name: string;
    preferred_name?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    date_of_death?: string;
    gender?: string;
    social_security_number?: string;
  };
  client: {
    preferred_name: string;
    last_name: string;
    phone_number?: string;
    email?: string;
    street?: string;
    house_number?: string;
    house_number_addition?: string;
    postal_code?: string;
    city?: string;
  };
  funeral?: {
    location?: string;
    signing_date?: string;
    funeral_director?: string;
  };
}): Promise<FuneralContext> {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Step 1: Create deceased
    console.log("Step 1: Creating deceased with data:", params.deceased);
    const deceasedData = await createDeceased({
      entrepreneur_id: params.entrepreneur_id,
      organization_id: params.organization_id,
      ...params.deceased,
    });
    console.log("Deceased created successfully:", deceasedData.id);

    // Step 2: Create client
    console.log("Step 2: Creating client with data:", params.client);
    const clientData = await createClient({
      entrepreneur_id: params.entrepreneur_id,
      organization_id: params.organization_id,
      ...params.client,
    });
    console.log("Client created successfully:", clientData.id);

    // Step 3: Create funeral linking both
    console.log("Step 3: Creating funeral record");
    const now = new Date().toISOString();
    const { data: funeralData, error: funeralError } = await supabase
      .from("funerals")
      .insert({
        entrepreneur_id: params.entrepreneur_id,
        organization_id: params.organization_id || null,
        deceased_id: deceasedData.id,
        client_id: clientData.id,
        location: params.funeral?.location,
        signing_date: params.funeral?.signing_date,
        funeral_director: params.funeral?.funeral_director,
        status: "planning",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (funeralError) {
      console.error("Funeral creation failed:", funeralError);
      throw new Error(`Funeral creation error: ${funeralError.message}`);
    }

    console.log("Funeral created successfully:", funeralData.id);

    // Return complete funeral context
    return {
      id: funeralData.id,
      entrepreneur_id: funeralData.entrepreneur_id,
      organization_id: funeralData.organization_id || undefined,
      deceased_id: funeralData.deceased_id,
      client_id: funeralData.client_id,
      location: funeralData.location || undefined,
      signing_date: funeralData.signing_date || undefined,
      funeral_director: funeralData.funeral_director || undefined,
      created_at: funeralData.created_at!,
      updated_at: funeralData.updated_at!,
      deceased: {
        first_names: deceasedData.first_names,
        preferred_name: deceasedData.preferred_name || undefined,
        last_name: deceasedData.last_name,
        date_of_birth: deceasedData.date_of_birth || undefined,
        date_of_death: deceasedData.date_of_death || undefined,
        place_of_birth: deceasedData.place_of_birth || undefined,
        gender: deceasedData.gender || undefined,
        social_security_number:
          deceasedData.social_security_number || undefined,
      },
      client: {
        preferred_name: clientData.preferred_name,
        last_name: clientData.last_name,
        phone_number: clientData.phone_number || undefined,
        email: clientData.email || undefined,
        street: clientData.street || undefined,
        house_number: clientData.house_number || undefined,
        house_number_addition: clientData.house_number_addition || undefined,
        postal_code: clientData.postal_code || undefined,
        city: clientData.city || undefined,
      },
    };
  } catch (error) {
    console.error("Error creating complete funeral:", error);
    throw error;
  }
}

/**
 * Add a funeral note
 */
export async function addFuneralNote(noteData: {
  funeral_id: string;
  entrepreneur_id: string;
  title: string;
  content: string;
  is_important?: boolean;
  created_by: string;
}) {
  console.log("addFuneralNote called with:", {
    funeral_id: noteData.funeral_id,
    entrepreneur_id: noteData.entrepreneur_id,
    title: noteData.title,
    content_length: noteData.content?.length,
  });

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const insertData = {
    ...noteData,
    created_at: new Date().toISOString(),
  };

  console.log("Inserting note into database:", insertData);

  const { data, error } = await supabase
    .from("funeral_notes")
    .insert(insertData)
    .select();

  if (error) {
    console.error("Database error adding note:", error);
    throw new Error(`Database error: ${error.message}`);
  }

  console.log("Note inserted successfully:", data[0]);
  return data[0];
}

/**
 * Add funeral costs via funeral_suppliers
 * Uses a special "Voice Assistant" supplier for costs added via voice
 */
export async function addFuneralCost(costData: {
  funeral_id: string;
  entrepreneur_id: string;
  organization_id?: string;
  amount: number;
  description: string;
}) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get or create the voice assistant supplier
  const { data: supplierId, error: supplierError } = await supabase.rpc(
    "get_or_create_voice_assistant_supplier",
    {
      p_entrepreneur_id: costData.entrepreneur_id,
      p_organization_id: costData.organization_id || null,
    }
  );

  if (supplierError || !supplierId) {
    console.error("Error getting voice assistant supplier:", supplierError);
    throw new Error(
      `Could not get voice assistant supplier: ${supplierError?.message}`
    );
  }

  console.log("Using voice assistant supplier:", supplierId);

  // Insert into funeral_suppliers (the actual costs table)
  const { data, error } = await supabase
    .from("funeral_suppliers")
    .insert({
      funeral_id: costData.funeral_id,
      entrepreneur_id: costData.entrepreneur_id,
      organization_id: costData.organization_id || null,
      supplier_id: supplierId,
      product_name: costData.description,
      unit_price: costData.amount,
      quantity: 1,
      notes: "Toegevoegd via voice assistant",
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data[0];
}

/**
 * Add funeral contact
 */
export async function addFuneralContact(contactData: {
  funeral_id: string;
  entrepreneur_id: string;
  organization_id?: string;
  client_id: string;
  relation: string;
  notes?: string;
}) {
  console.log("addFuneralContact called with:", {
    funeral_id: contactData.funeral_id,
    client_id: contactData.client_id,
    entrepreneur_id: contactData.entrepreneur_id,
    organization_id: contactData.organization_id,
    relation: contactData.relation,
  });

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const insertData = {
    ...contactData,
    created_at: new Date().toISOString(),
  };

  console.log("Inserting funeral_contact link:", insertData);

  const { data, error } = await supabase
    .from("funeral_contacts")
    .insert(insertData)
    .select();

  if (error) {
    console.error("Database error adding funeral_contact:", error);
    // Handle unique constraint violation (same client already exists for this funeral)
    if (error.code === "23505" && error.message.includes("unique")) {
      throw new Error("CONTACT_EXISTS");
    }
    throw new Error(`Database error: ${error.message}`);
  }

  console.log("Funeral contact link created successfully:", data[0]);
  return data[0];
}

/**
 * Update funeral note
 */
export async function updateFuneralNote(
  noteId: string,
  noteData: {
    title?: string;
    content?: string;
    is_important?: boolean;
  }
) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_notes")
    .update({
      ...noteData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Notitie niet gevonden");
  }

  return data[0];
}

/**
 * Delete funeral note
 */
export async function deleteFuneralNote(noteId: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("funeral_notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { success: true };
}

/**
 * List funeral notes
 */
export async function listFuneralNotes(
  funeralId: string,
  importantOnly: boolean = false
) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from("funeral_notes")
    .select("*")
    .eq("funeral_id", funeralId)
    .order("created_at", { ascending: false });

  if (importantOnly) {
    query = query.eq("is_important", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

/**
 * Update funeral cost
 */
export async function updateFuneralCost(
  costId: string,
  costData: {
    amount?: number;
    description?: string;
  }
) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_costs")
    .update({
      ...costData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", costId)
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Kosten niet gevonden");
  }

  return data[0];
}

/**
 * Delete funeral cost
 */
export async function deleteFuneralCost(costId: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("funeral_costs")
    .delete()
    .eq("id", costId);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { success: true };
}

/**
 * List funeral costs
 */
export async function listFuneralCosts(funeralId: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_costs")
    .select("*")
    .eq("funeral_id", funeralId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}

/**
 * Update funeral contact
 */
export async function updateFuneralContact(
  contactId: string,
  contactData: {
    relation?: string;
    notes?: string;
  }
) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_contacts")
    .update({
      ...contactData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", contactId)
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error("Contact niet gevonden");
  }

  return data[0];
}

/**
 * Delete funeral contact
 */
export async function deleteFuneralContact(contactId: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("funeral_contacts")
    .delete()
    .eq("id", contactId);

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { success: true };
}

/**
 * List funeral contacts
 */
export async function listFuneralContacts(funeralId: string) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_contacts")
    .select(
      `
      *,
      client:client_id (
        preferred_name,
        last_name,
        phone_number,
        email
      )
    `
    )
    .eq("funeral_id", funeralId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data || [];
}
