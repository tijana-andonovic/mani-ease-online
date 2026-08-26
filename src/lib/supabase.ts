import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// External, user-managed Supabase project. The publishable key is designed
// to be visible in browser code — access is enforced by RLS policies.
const SUPABASE_URL = "https://kujiyhcwkixdfqeycudc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i-RIfwfyE_0Rdsu-iMBvAA_uguef5r7";

// New-style sb_publishable_ keys are opaque strings, not JWTs: they must be
// sent only as the `apikey` header, never as an Authorization bearer token
// (PostgREST rejects them with "Expected 3 parts in JWT" otherwise).
// Authenticated requests carry the user's access token instead, which must
// pass through untouched.
function createSupabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
});
