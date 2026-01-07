"use server";
import { redirect } from "next/navigation";
import { createClient } from "@RCC-Dash/supabase/server";
import type { Provider } from "@RCC-Dash/supabase/types";
import { revalidatePath } from "next/cache";

const signInWithPassword = async (formData: FormData) => {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/signin");
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

const signUpWithPassword = async (formData: FormData) => {
  const supabase = await createClient();
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const { error } = await supabase.auth.signUp(data);

  if (error) {
console.log("Error signing up:", error.message);
  }

  revalidatePath("/", "layout");
  return redirect("/");
};

export { signInWithPassword, signInWithOAuth, signUpWithPassword, signOut };
