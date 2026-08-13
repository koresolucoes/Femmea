import { MobileShell } from "@/components/mobile-shell";
import { LogOutIcon, UserIcon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./profile-form";
import { logout } from "./actions";

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("femmea_profiles").select("display_name,daily_water_goal_ml").eq("id", user.id).maybeSingle();

  return (
    <MobileShell active="profile">
      <header className="simple-header"><h1>Perfil</h1></header>
      <section className="profile-hero">
        <div className="profile-avatar"><UserIcon /></div>
        <strong>{profile?.display_name || "Seu perfil"}</strong>
        <small>{user.email}</small>
      </section>
      <ProfileForm displayName={profile?.display_name || ""} waterGoal={profile?.daily_water_goal_ml || 2000} />
      <form action={logout}>
        <button className="logout-button"><LogOutIcon /> Sair da conta</button>
      </form>
    </MobileShell>
  );
}
