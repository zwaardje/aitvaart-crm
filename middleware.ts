import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response object to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware using SSR pattern
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired - this is the recommended pattern
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && !pathname.startsWith("/auth/") && pathname !== "/") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // If user is authenticated, check onboarding status only when redirecting
  if (isAuthenticated) {
    // Allow access to onboarding page
    if (pathname === "/onboarding") {
      return response;
    }

    // Only check onboarding status when we need to redirect (auth pages, root)
    // For other protected routes like /dashboard, let OnboardingGuard handle it
    if (pathname.startsWith("/auth/") || pathname === "/") {
      // Check if user needs onboarding
      let needsOnboarding = false;
      if (user?.id) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

          // If profile doesn't exist (error PGRST116) or onboarding is not completed, user needs onboarding
          if (error && error.code === "PGRST116") {
            needsOnboarding = true;
          } else if (!profile || !profile.onboarding_completed) {
            needsOnboarding = true;
          }
        } catch (error) {
          // If query fails, let OnboardingGuard handle it - don't block the request
          console.error(
            "Error checking onboarding status in middleware:",
            error
          );
        }
      }

      // Redirect based on onboarding status
      if (pathname.startsWith("/auth/")) {
        if (needsOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (pathname === "/") {
        if (needsOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
