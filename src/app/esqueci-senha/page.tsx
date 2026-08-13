import { AuthForm } from "@/components/auth-form";
import { SetupRequired } from "@/components/setup-required";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  return <AuthForm mode="reset" action={requestPasswordReset} />;
}
