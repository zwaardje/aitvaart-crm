import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, role, permissions } = body;

    if (!organizationId || !role) {
      return NextResponse.json(
        { error: "Organization ID and role are required" },
        { status: 400 }
      );
    }

    // Add user to organization
    const { data: memberData, error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        role: role,
        status: "active",
        joined_at: new Date().toISOString(),
        ...permissions,
      })
      .select()
      .single();

    if (memberError) {
      return NextResponse.json(
        { error: "Failed to add member to organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined organization",
      data: memberData,
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
