"use server";
import { redirect } from "next/navigation";
import { createClient } from "@repo/supabase/server";
import type { Provider } from "@repo/supabase/types";
import { revalidatePath } from "next/cache";

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
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signInWithPassword(data);

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
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const displayName =
    (formData.get("displayName") as string | null)?.trim() || undefined;

  const { data: signUpData, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if(signUpData && signUpData.session) {
    return { success: "User already exists. Please sign in instead." };
  }
  if(error) {
    return { error: error.message };
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

const getUser = async () => {
  const supabase = await createClient();
  const {
    data
  } = await supabase.auth.getUserIdentities();

  return data?.identities[0].identity_data || null;
}

export {
  signInWithPassword,
  signInWithOAuth,
  signUpWithPassword,
  signOut,
  getUser,
  requestPasswordReset,
  updatePassword,
};
