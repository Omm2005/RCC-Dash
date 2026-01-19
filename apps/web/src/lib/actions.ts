"use server";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@repo/supabase/server";
import type { Provider } from "@repo/supabase/types";
import { revalidatePath } from "next/cache";

export type AuthState = {
  error?: string;
  success?: string;
};

type AddAuthorizedUserInput = {
  name: string;
  email: string;
  role: string;
};

type AddAuthorizedUserResult = AuthState & {
  data?: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
    created_at: string | null;
  };
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
  const { error } =
    await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: error.message };
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
  const adminClient = await createAdminClient();
  const credentials = {
    email: (formData.get("email") as string | null)?.trim().toLowerCase(),
    password: formData.get("password") as string | null,
  };

  if (!credentials.email || !credentials.password) {
    return { error: "Email and password are required." };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("email, role, name, avatar")
    .eq("email", credentials.email)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message };
  }

  if (!profile) {
    return { error: "You are not authorized" };
  }

  const displayName =
    (formData.get("displayName") as string | null)?.trim() || undefined;

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        role: profile.role ?? "member",
        ...(displayName ? { display_name: displayName } : {}),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (signUpData?.user) {
    const updatedName = displayName ?? profile?.name ?? null;
    const updatedAvatar = profile?.avatar ?? null;
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        user_id: signUpData.user.id,
        ...(updatedName ? { name: updatedName } : {}),
        ...(updatedAvatar ? { avatar: updatedAvatar } : {}),
      })
      .eq("email", credentials.email);

    if (updateError) {
      return { error: updateError.message };
    }
  }

  if (!signUpData.session) {
    return {
      success: "Check your email to verify your account before signing in.",
    };
  }

  return { success: "Account created. You can sign in now." };
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
    .select("role, id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return null;
  }

  if (!data || !data.role || !data.id) {
    return null;
  }

  return {
    data: {
      role: data.role,
      id: data.id,
    }
  };
}

const getAllUsers = async () => {
  const roleData = await getUserRole();
  if (!roleData || roleData.data.role !== "admin") {
    return [];
  }

  const adminClient = await createAdminClient();

  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("email, name, avatar, role, created_at, id")
    .order("created_at", { ascending: false });

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  return (profiles ?? []).map((profile) => {
    const email = profile.email ?? "";
    const fallbackName =
      profile.name ?? (email ? email.split("@")[0] : "Authorized user");

    return {
      id: profile.id ?? "",
      email,
      name: fallbackName,
      avatar: profile.avatar ?? "",
      role: profile.role ?? "member",
      created_at: profile.created_at ?? null,
    };
  });
};

type UpdateUserRoleInput = {
  id?: string;
  email?: string;
  role: string;
};

const updateUserRole = async (
  input: UpdateUserRoleInput,
): Promise<AuthState> => {
  const currentRole = await getUserRole();
  if (!currentRole || currentRole.data.role !== "admin") {
    return { error: "Not authorized to update roles." };
  }

  if (!input.role) {
    return { error: "Invalid role update request." };
  }

  const normalizedEmail = input.email?.trim().toLowerCase();
  if (!input.id && !normalizedEmail) {
    return { error: "User identifier is required." };
  }

  const adminClient = await createAdminClient();

  const updateQuery = adminClient.from("profiles").update({ role: input.role });
  const { error: profileError } = input.id
    ? await updateQuery.eq("id", input.id)
    : await updateQuery.eq("email", normalizedEmail ?? "");

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/users");
  return { success: "Role updated." };
};

const addAuthorizedUser = async (
  input: AddAuthorizedUserInput,
): Promise<AddAuthorizedUserResult> => {
  const currentRole = await getUserRole();
  if (!currentRole || currentRole.data.role !== "admin") {
    return { error: "Not authorized to add users." };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedName = input.name.trim();

  if (!normalizedEmail || !normalizedName) {
    return { error: "Name and email are required." };
  }

  if (!input.role) {
    return { error: "Role is required." };
  }

  const adminClient = await createAdminClient();
  const { data: existing, error: existingError } = await adminClient
    .from("profiles")
    .select("email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (existing) {
    return { error: "User already exists." };
  }

  const { error: insertError, data: insertData } = await adminClient
    .from("profiles")
    .insert({
      email: normalizedEmail,
      name: normalizedName,
      avatar: "",
      role: input.role,
    })
    .select("email, role, user_id, created_at, name, avatar")
    .single();

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/users");
  return {
    success: "User added.",
    data: {
      id: insertData?.user_id ?? "",
      name: insertData?.name ?? normalizedName,
      email: insertData?.email ?? normalizedEmail,
      avatar: insertData?.avatar ?? "",
      role: insertData?.role ?? input.role,
      created_at: insertData?.created_at ?? null,
    },
  };
};

const deleteAuthorizedUser = async (
  id: string,
): Promise<{
  error?: string;
  success?: string;
}> => {
  const currentRole = await getUserRole();
  if (!currentRole || currentRole.data.role !== "admin") {
    return { error: "Not authorized to delete users." };
  }

  if (!id) {
    return { error: "User ID is required." };
  }

  const adminClient = await createAdminClient();
  
  // Check if profile exists and capture linked auth user
  const { data: existing, error: existingError } = await adminClient
    .from("profiles")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError.message };
  }

  if (!existing) {
    return { error: "User not found." };
  }

  if (existing.user_id) {
    const { error: authDeleteError } =
      await adminClient.auth.admin.deleteUser(existing.user_id);
    if (authDeleteError) {
    }
  }

  // Delete the profile row
  const { error: deleteError } = await adminClient
    .from("profiles")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }
  
  revalidatePath("/users");
  return { success: "User deleted successfully." };
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
  addAuthorizedUser,
  deleteAuthorizedUser,
};
