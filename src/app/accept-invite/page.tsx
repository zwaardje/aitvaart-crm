"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import {
  RiCheckLine,
  RiCloseLine,
  RiBuildingLine,
  RiUserLine,
  RiShieldLine,
} from "@remixicon/react";

interface InviteData {
  id: string;
  organization: {
    id: string;
    name: string;
    description: string | null;
  };
  inviter: {
    full_name: string;
    email: string;
  };
  role: string;
  permissions: {
    can_manage_users: boolean;
    can_manage_funerals: boolean;
    can_manage_clients: boolean;
    can_manage_suppliers: boolean;
    can_view_financials: boolean;
    can_manage_settings: boolean;
  };
  expiresAt: string;
}

function AcceptInvitePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();
  const organizationId = searchParams.get("organization");
  const role = searchParams.get("role");

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Define translations outside of useCallback
  const invalidInviteParams = t("auth.signIn.invalidInviteParams");
  const acceptInviteError = t("auth.signIn.acceptInviteError");
  const processInviteError = t("auth.signIn.processInviteError");

  const processInvite = useCallback(
    async (user: any) => {
      if (!organizationId || !role) {
        setError(invalidInviteParams);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/invites/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationId,
            role,
            permissions: {
              can_manage_users: role === "admin" || role === "owner",
              can_manage_funerals: true,
              can_manage_clients: true,
              can_manage_suppliers: true,
              can_view_financials: role === "admin" || role === "owner",
              can_manage_settings: role === "owner",
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || acceptInviteError);
          setLoading(false);
          return;
        }

        // Get organization details for display
        const supabase = getSupabaseBrowser();
        const { data: organization } = await supabase
          .from("organizations")
          .select("id, name, description")
          .eq("id", organizationId)
          .single();

        setInviteData({
          id: data.data.id,
          organization: organization || {
            id: organizationId,
            name: "Unknown",
            description: null,
          },
          inviter: { full_name: "System", email: "system@aitvaart.com" },
          role: role,
          permissions: {
            can_manage_users: data.data.can_manage_users || false,
            can_manage_funerals: data.data.can_manage_funerals || false,
            can_manage_clients: data.data.can_manage_clients || false,
            can_manage_suppliers: data.data.can_manage_suppliers || false,
            can_view_financials: data.data.can_view_financials || false,
            can_manage_settings: data.data.can_manage_settings || false,
          },
          expiresAt: new Date().toISOString(),
        });

        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        setError(processInviteError);
        setLoading(false);
      }
    },
    [
      organizationId,
      role,
      router,
      invalidInviteParams,
      acceptInviteError,
      processInviteError,
    ]
  );

  const checkAuthStatus = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // User is already signed in, process the invite
      await processInvite(user);
    } else {
      // User needs to sign in first
      setLoading(false);
    }
  }, [processInvite]);

  useEffect(() => {
    // Check if user is already signed in
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleSignIn = () => {
    const supabase = getSupabaseBrowser();
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/accept-invite?organization=${organizationId}&role=${role}`,
      },
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case "can_manage_users":
        return <RiUserLine className="h-4 w-4" />;
      case "can_manage_funerals":
        return <RiBuildingLine className="h-4 w-4" />;
      case "can_manage_settings":
        return <RiShieldLine className="h-4 w-4" />;
      default:
        return <RiCheckLine className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Alert>
              <RiCloseLine className="h-4 w-4" />
              <AlertTitle>Fout</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              Terug naar Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <RiCheckLine className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Uitnodiging Verwerkt
            </h2>
            <p className="text-gray-600">Je wordt doorgestuurd...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Uitnodiging Accepteren
            </CardTitle>
            <p className="text-gray-600">
              Je bent uitgenodigd om lid te worden van een organisatie. Meld je
              eerst aan om de uitnodiging te accepteren.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleSignIn} className="w-full">
              {t("auth.signIn.signInWithGoogle")}
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full"
            >
              Terug naar Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Uitnodiging voor {inviteData.organization.name}
          </CardTitle>
          <p className="text-gray-600">
            Je bent uitgenodigd door {inviteData.inviter.full_name}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <RiBuildingLine className="h-5 w-5 mr-2" />
              Organisatie Details
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {inviteData.organization.description ||
                t("auth.signIn.noDescriptionAvailable")}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Je rol:</span>
              <Badge className={getRoleColor(inviteData.role)}>
                {inviteData.role}
              </Badge>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <RiShieldLine className="h-5 w-5 mr-2" />
              Je Permissions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(inviteData.permissions).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    value
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {getPermissionIcon(key)}
                  <span className="text-sm">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expiry Notice */}
          <Alert>
            <RiCloseLine className="h-4 w-4" />
            <AlertTitle>Let op</AlertTitle>
            <AlertDescription>
              Deze uitnodiging verloopt op{" "}
              {new Date(inviteData.expiresAt).toLocaleDateString("nl-NL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </AlertDescription>
          </Alert>

          {/* Success Message */}
          <Alert>
            <RiCheckLine className="h-4 w-4" />
            <AlertTitle>Uitnodiging Geaccepteerd!</AlertTitle>
            <AlertDescription>
              Je bent succesvol toegevoegd aan {inviteData.organization.name}{" "}
              als {inviteData.role}. Je wordt doorgestuurd naar het dashboard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      }
    >
      <AcceptInvitePageContent />
    </Suspense>
  );
}
