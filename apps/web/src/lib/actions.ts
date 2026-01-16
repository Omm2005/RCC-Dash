"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@repo/supabase/server";
import type { Provider } from "@repo/supabase/types";
import { revalidatePath } from "next/cache";
import { ensureProfileExists } from "@/lib/profile";

export type AuthState = {
  error?: string;
  success?: string;
};

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

const signInWithPassword = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const supabase = await createClient();
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { data: signInData, error } =
    await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: error.message };
  }

  const profileError = await ensureProfileExists(supabase, signInData.user);
  if (profileError) {
    return { error: profileError };
  }

  return redirect("/");
};

const signInWithOAuth = async (provider: Provider) => {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_BASE_URL;
  const redirectTo = `${baseUrl}/api/auth/callback`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error) {
    redirect("/signup");
  }

  if (data?.url) {
    return redirect(data.url as any);
  }

  return redirect("/");
};

const signOut = async () => {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return redirect("/signin");
};

const signUpWithPassword = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const supabase = await createClient();
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const displayName =
    (formData.get("displayName") as string | null)?.trim() || undefined;

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        role: "member",
        ...(displayName ? { display_name: displayName } : {}),
      },
    },
  });

  if(signUpData && signUpData.session) {
    return { success: "User already exists. Please sign in instead." };
  }
  if(error) {
    return { error: error.message };
  }

  if (signUpData.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: signUpData.user.id,
        role: "member",
      },
      { onConflict: "user_id" },
    );
    if (profileError) {
      return { error: profileError.message };
    }
  }

  if (!signUpData.session) {
    return {
      success: "Check your email to verify your account before signing in.",
    };
  }

  revalidatePath("/", "layout");
  return redirect("/");
};

const requestPasswordReset = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const supabase = await createClient();
  const email = (formData.get("email") as string | null)?.trim();

  if (!email) {
    return { error: "Email is required" };
  }

  const redirectTo = `${getBaseUrl()}/api/auth/callback?next=/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: error.message };
  }
  return { success: "Check your email for the reset link." };
};

const updatePassword = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const supabase = await createClient();
  const password = (formData.get("password") as string | null)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string | null)?.trim();

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated. You can close this tab or continue." };
};

const updateProfile = async (
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> => {
  const supabase = await createClient();
  const displayName = (formData.get("displayName") as string | null)?.trim();

  if (!displayName) {
    return { error: "Display name is required." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: "Profile updated." };
};

const getUser = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const identityData = user.identities?.[0]?.identity_data ?? {};
  const metadata = user.user_metadata ?? {};

  return {
    ...identityData,
    ...metadata,
    id: user.id,
    email: user.email ?? "",
    created_at: user.created_at ?? null,
  };
}

const getUserRole = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return data?.role ?? null;
}

const getAllUsers = async () => {
  const role = await getUserRole();
  if (role !== "admin") {
    return [];
  }

  const adminClient = await createAdminClient();

  const { data: usersData, error: usersError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    throw new Error(usersError.message);
  }

  const users = usersData?.users ?? [];
  if (!users.length) {
    return [];
  }

  const userIds = users.map((user) => user.id);
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("user_id, role")
    .in("user_id", userIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const roleMap = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile.role])
  );

  return users.map((user) => {
    const metadata = user.user_metadata ?? {};
    const identityData = user.identities?.[0]?.identity_data ?? {};
    const displayName =
      (metadata.display_name as string | undefined) ||
      (metadata.full_name as string | undefined) ||
      (metadata.name as string | undefined) ||
      (identityData.full_name as string | undefined) ||
      (identityData.name as string | undefined) ||
      user.email ||
      "User";
    const avatar =
      (metadata.avatar_url as string | undefined) ||
      (metadata.picture as string | undefined) ||
      (metadata.avatarUrl as string | undefined) ||
      (identityData.avatar_url as string | undefined) ||
      (identityData.picture as string | undefined) ||
      "";

    return {
      id: user.id,
      email: user.email ?? "",
      name: displayName,
      avatar,
      role:
        roleMap.get(user.id) ??
        (metadata.role as string | undefined) ??
        "member",
      created_at: user.created_at ?? null,
    };
  });
};

const updateUserRole = async (
  userId: string,
  role: string,
): Promise<AuthState> => {
  const currentRole = await getUserRole();
  if (currentRole !== "admin") {
    return { error: "Not authorized to update roles." };
  }

  if (!userId || !role) {
    return { error: "Invalid role update request." };
  }

  const adminClient = await createAdminClient();

  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        role,
      },
      { onConflict: "user_id" },
    );

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/users");
  return { success: "Role updated." };
};

export {
  signInWithPassword,
  signInWithOAuth,
  signUpWithPassword,
  signOut,
  getUser,
  getUserRole,
  updateProfile,
  requestPasswordReset,
  updatePassword,
  getAllUsers,
  updateUserRole,
};
