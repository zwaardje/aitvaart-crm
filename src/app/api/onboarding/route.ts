import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();

    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } =
      await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

    if (
      !existingProfile ||
      (profileCheckError && profileCheckError.code === "PGRST116")
    ) {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          full_name: body.fullName,
          company_name: body.companyName,
          phone: body.phone,
          phone_number: body.phone,
          address: body.address,
          city: body.city,
          postal_code: body.postalCode,
          kvk_number: body.kvkNumber,
          btw_number: body.btwNumber || null,
          website: body.website || null,
          description: body.description,
          onboarding_completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    } else {
      // Profile exists, update it
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          full_name: body.fullName,
          company_name: body.companyName,
          phone: body.phone,
          phone_number: body.phone,
          address: body.address,
          city: body.city,
          postal_code: body.postalCode,
          kvk_number: body.kvkNumber,
          btw_number: body.btwNumber || null,
          website: body.website || null,
          description: body.description,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
