import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

// Authoritative check: getUser() validates the token with Supabase.
// The proxy is only an optimistic redirect.
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Deduped per request, so several components can call it for one getUser().
export const getCurrentUser = cache(async (): Promise<User> => {
  const user = await getAuthenticatedUser();
  const firstName: string | undefined = user.user_metadata?.first_name;

  if (!firstName) {
    redirect("/onboarding");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    firstName,
    lastName: user.user_metadata?.last_name ?? "",
  };
});
