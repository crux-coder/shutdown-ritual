import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type User = {
  id: string;
  email: string;
};

// Authoritative check: getUser() validates the token with Supabase.
// The proxy is only an optimistic redirect.
export async function getCurrentUser(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { id: user.id, email: user.email ?? "" };
}
