import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthClaims } from "@/lib/auth";
import { login } from "./actions";

export default async function LoginPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  if (await getAuthClaims()) redirect("/");
  return <AuthForm mode="login" action={login} />;
}
