export const DEFAULT_SUPABASE_URL = "https://vvcitwisfnmwwlvcveoj.supabase.co";
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_OzbVupgaHN_935hfYOMq8Q_2WEvnU5C";

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}

export function getSiteUrl(fallbackOrigin?: string) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    fallbackOrigin?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
