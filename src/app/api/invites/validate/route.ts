import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization");
    const role = searchParams.get("role");

    if (!organizationId || !role) {
      return NextResponse.json(
        { error: "Organization ID and role are required" },
        { status: 400 }
      );
    }

    // Get organization details
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, description")
      .eq("id", organizationId)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: organization,
      role: role,
    });
  } catch (error) {
    console.error("Error validating invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
