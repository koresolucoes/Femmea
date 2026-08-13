import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getAuthClaims } from "@/lib/auth";
import { updatePassword } from "./actions";

export default async function UpdatePasswordPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  if (!(await getAuthClaims())) redirect("/esqueci-senha");
  return <AuthForm mode="update-password" action={updatePassword} />;
}
