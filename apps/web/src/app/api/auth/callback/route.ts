import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createAdminClient, createClient } from "@repo/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const user = data.user;
      const email = user?.email ?? "";
      if (!email) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/signin?error=not_authorized`);
      }

      const adminClient = await createAdminClient();
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("id, name, avatar")
        .eq("email", email)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/signin?error=not_authorized`);
      }

      const identityData = user.identities?.[0]?.identity_data ?? {};
      const metadata = user.user_metadata ?? {};
      const resolvedName =
        (metadata.full_name as string | undefined) ||
        (metadata.name as string | undefined) ||
        (metadata.display_name as string | undefined) ||
        (identityData.full_name as string | undefined) ||
        (identityData.name as string | undefined) ||
        profile.name ||
        email;
      const resolvedAvatar =
        (metadata.avatar_url as string | undefined) ||
        (metadata.picture as string | undefined) ||
        (identityData.avatar_url as string | undefined) ||
        (identityData.picture as string | undefined) ||
        profile.avatar ||
        "";

      const { error: updateError } = await adminClient
        .from("profiles")
        .update({
          user_id: user.id,
          name: resolvedName,
          avatar: resolvedAvatar,
        })
        .eq("id", profile.id);

      if (updateError) {
        console.log("Failed to update profile after OAuth sign-in:", updateError);
      }

      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
