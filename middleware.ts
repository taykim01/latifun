import { updateSession } from "@/data/infrastructures/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|assets/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  // Always perform session update
  let supabaseResponse = await updateSession(req);

  // Extract hostname
  const hostname = req.headers.get("host") || "";
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${req.nextUrl.pathname}${searchParams ? `?${searchParams}` : ""}`;

  // Extract the subdomain (e.g., 'app' from 'app.madeact.com')
  const subDomain = hostname.split(".")[0];

  // Check if the request is from 'app.madeact.com' or its local equivalent
  // console.log("subDomain", subDomain);
  if (subDomain === "app") {
    // Rewrite the URL to point to /app/*
    const newUrl = new URL(`/app${path}`, req.url);

    // Instead of creating a new response, modify the existing one
    supabaseResponse.headers.set("x-rewrite-url", newUrl.toString()); // Optional: For debugging
    return NextResponse.rewrite(newUrl, supabaseResponse);
  }

  // If no rewrite is needed, return the session-updated response as is
  return supabaseResponse;
}
