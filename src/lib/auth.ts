import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Removed OAuth providers (Google/Azure) to use Supabase Auth only
// import EmailProvider from "next-auth/providers/email";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email en wachtwoord zijn verplicht");
        }

        try {
          const supabase = createClient<Database>(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          );

          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error) {
            console.error("Auth error:", error.message);
            if (error.message.includes("Invalid login credentials")) {
              throw new Error("auth.errors.invalidCredentials");
            }
            if (error.message.includes("Email not confirmed")) {
              throw new Error("auth.errors.emailNotConfirmed");
            }
            throw new Error("auth.errors.loginFailed");
          }

          if (!data.user || !data.session) {
            throw new Error("auth.errors.noUser");
          }

          // Get user profile with retry logic
          let profile = null;
          let retries = 3;

          while (retries > 0) {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (!profileError) {
              profile = profileData;
              break;
            }

            if (profileError.code === "PGRST116") {
              // Profile doesn't exist, create it
              const { data: newProfile, error: createError } = await supabase
                .from("profiles")
                .insert({
                  id: data.user.id,
                  full_name: data.user.user_metadata?.full_name,
                  avatar_url: data.user.user_metadata?.avatar_url,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                profile = newProfile;
                break;
              }
            }

            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          const user = {
            id: data.user.id,
            email: data.user.email,
            name: profile?.full_name || data.user.user_metadata?.full_name,
            image: profile?.avatar_url || data.user.user_metadata?.avatar_url,
            supabaseAccessToken: data.session.access_token,
            supabaseRefreshToken: data.session.refresh_token,
          };

          return user;
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST!,
    //     port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER!,
    //       pass: process.env.EMAIL_SERVER_PASSWORD!,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM!,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Persist Supabase tokens in JWT for client bridging
        token.supabaseAccessToken = (user as any).supabaseAccessToken;
        token.supabaseRefreshToken = (user as any).supabaseRefreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        // Expose tokens to client bridge (typed in next-auth.d.ts)
        (session as any).supabaseAccessToken = token.supabaseAccessToken as
          | string
          | undefined;
        (session as any).supabaseRefreshToken = token.supabaseRefreshToken as
          | string
          | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // verifyRequest: "/auth/verify-request", // Only needed for EmailProvider
  },
};
