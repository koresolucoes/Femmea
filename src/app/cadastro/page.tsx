import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthClaims } from "@/lib/auth";
import { signup } from "./actions";

export default async function SignupPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  if (await getAuthClaims()) redirect("/");
  return <AuthForm mode="signup" action={signup} />;
}
