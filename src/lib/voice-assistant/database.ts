import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export interface FuneralContext {
  id: string;
  entrepreneur_id: string;
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
  preferred_name: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
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
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_notes")
    .insert({
      ...noteData,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data[0];
}

/**
 * Add funeral costs
 */
export async function addFuneralCost(costData: {
  funeral_id: string;
  entrepreneur_id: string;
  amount: number;
  description: string;
}) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_costs")
    .insert({
      ...costData,
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
  client_id: string;
  relation: string;
  notes?: string;
}) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("funeral_contacts")
    .insert({
      ...contactData,
      created_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    // Handle unique constraint violation (same client already exists for this funeral)
    if (error.code === "23505" && error.message.includes("unique")) {
      throw new Error("CONTACT_EXISTS");
    }
    throw new Error(`Database error: ${error.message}`);
  }

  return data[0];
}
