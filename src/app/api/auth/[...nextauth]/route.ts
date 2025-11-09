/**
 * @deprecated This NextAuth API route is not currently used.
 * The application uses Supabase Auth directly via client-side forms.
 * This route is kept for reference but can be removed if NextAuth is not needed.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
