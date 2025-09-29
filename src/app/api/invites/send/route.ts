import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables
    console.log("Environment check:");
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "SERVICE_ROLE_KEY exists:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    console.log(
      "SERVICE_ROLE_KEY length:",
      process.env.SUPABASE_SERVICE_ROLE_KEY?.length
    );

    // Use admin client for admin operations
    const supabaseAdmin = getSupabaseAdmin();
    const supabase = getSupabaseServer();

    // Test service role key permissions
    console.log("Testing service role key permissions...");
    console.log(
      "Service role key starts with:",
      process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10)
    );

    const { data: testUsers, error: testError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (testError) {
      console.error("Service role key test failed:", testError);
      console.error("Error details:", {
        message: testError.message,
        status: testError.status,
        code: testError.code,
      });
      return NextResponse.json(
        {
          error: `Service role key invalid: ${testError.message}. Please check your Supabase dashboard for the correct service role key.`,
        },
        { status: 500 }
      );
    }
    console.log(
      "Service role key works, found",
      testUsers.users.length,
      "users"
    );

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, email, role, permissions } = body;

    if (!organizationId || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has permission to invite
    const { data: member } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!member || !["owner", "admin"].includes(member.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Get organization details
    const { data: organization } = await supabase
      .from("organizations")
      .select("name, description")
      .eq("id", organizationId)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user already exists by looking up in auth.users
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.users?.find(
      (user: any) => user.email === email
    );

    if (existingUser) {
      // User exists - add directly to organization
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          user_id: existingUser.id,
          role,
          status: "active",
          joined_at: new Date().toISOString(),
          ...permissions,
        })
        .select()
        .single();

      if (memberError) {
        return NextResponse.json(
          { error: "Failed to add member" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User added successfully",
        type: "existing_user",
        data: memberData,
      });
    } else {
      // User doesn't exist - use Supabase invite flow
      console.log("Attempting to invite new user:", email);
      console.log("Organization ID:", organizationId);
      console.log("Role:", role);
      console.log(
        "Redirect URL:",
        `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?organization=${organizationId}&role=${role}`
      );

      // Check if email contains + character (known issue with Supabase)
      if (email.includes("+")) {
        console.log(
          "Warning: Email contains + character, this may cause issues with Supabase"
        );
      }

      const { data: inviteData, error: inviteError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
          data: {
            organization_id: organizationId,
            role: role,
            permissions: permissions,
            invited_by: user.id,
          },
          redirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/accept-invite?organization=${organizationId}&role=${role}`,
        });

      if (inviteError) {
        console.error("Supabase invite error:", inviteError);

        // If Supabase invite fails, try to add user directly as pending
        console.log("Falling back to direct user addition...");

        // Since organization_members doesn't have email column, we can't create a pending record
        // Return a more helpful error message
        return NextResponse.json(
          {
            error: `Supabase invite failed: ${inviteError.message}. Please check your Supabase configuration.`,
          },
          { status: 500 }
        );
      }

      // Note: We're using Supabase's native invite system
      // No need to store custom invite data as Supabase handles everything

      return NextResponse.json({
        success: true,
        message: "Invite sent successfully via Supabase",
        type: "new_user",
        data: {
          supabase_invite: inviteData,
        },
      });
    }
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
