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
        .select("id, organization_id")
        .eq("id", user.id)
        .single();

    if (
      !existingProfile ||
      (profileCheckError && (profileCheckError as any).code === "PGRST116")
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

    let organizationId = existingProfile?.organization_id ?? null;

    if (!organizationId) {
      const { data: existingMembership } = await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      organizationId = existingMembership?.organization_id ?? null;
    }

    if (!organizationId) {
      const organizationPayload = {
        name: body.companyName,
        description: body.description ?? null,
        website: body.website ?? null,
        phone_number: body.phone ?? null,
        address: body.address ?? null,
        postal_code: body.postalCode ?? null,
        city: body.city ?? null,
        billing_address: body.address ?? null,
        billing_postal_code: body.postalCode ?? null,
        billing_city: body.city ?? null,
        billing_email: user.email ?? null,
      };

      const { data: newOrganization, error: organizationError } =
        await supabaseAdmin
          .from("organizations")
          .insert(organizationPayload)
          .select("id")
          .single();

      if (organizationError) {
        return NextResponse.json(
          { error: organizationError.message },
          { status: 500 }
        );
      }

      organizationId = newOrganization.id;
    }

    const ownerMembership = {
      organization_id: organizationId,
      user_id: user.id,
      role: "owner",
      status: "active",
      can_manage_users: true,
      can_manage_funerals: true,
      can_manage_clients: true,
      can_manage_suppliers: true,
      can_view_financials: true,
      can_manage_settings: true,
      joined_at: new Date().toISOString(),
    };

    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .upsert(ownerMembership, { onConflict: "organization_id,user_id" });

    if (membershipError) {
      return NextResponse.json(
        { error: membershipError.message },
        { status: 500 }
      );
    }

    const { error: profileOrgUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({
        organization_id: organizationId,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileOrgUpdateError) {
      return NextResponse.json(
        { error: profileOrgUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, organizationId });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
