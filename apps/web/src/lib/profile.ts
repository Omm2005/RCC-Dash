import type { SupabaseClient, User } from "@supabase/supabase-js";

const resolveProfileRole = (user: User) => {
  const role = user.user_metadata?.role;
  return typeof role === "string" && role.trim().length > 0 ? role : "member";
};

const ensureProfileExists = async (
  supabase: SupabaseClient,
  user: User | null,
) => {
  if (!user?.id) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return profileError.message;
  }

  if (!profile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      user_id: user.id,
      role: resolveProfileRole(user),
    });

    if (insertError) {
      return insertError.message;
    }
  }

  return null;
};

export { ensureProfileExists };
