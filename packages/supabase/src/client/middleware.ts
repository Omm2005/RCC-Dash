import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Get the current user from Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth");

  // Redirect logged-out visitors to the sign-in page, but allow auth routes.
  if (!user && !isAuthRoute) {
    url.pathname = "/signin";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirectResponse.cookies.set(name, value),
    );
    return redirectResponse;
  }

  // Redirect authenticated users away from auth routes.
  if (user && isAuthRoute) {
    url.pathname = "/";
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) =>
      redirectResponse.cookies.set(name, value),
    );
    return redirectResponse;
  }

  // Default response if no conditions match
  return supabaseResponse;
}
