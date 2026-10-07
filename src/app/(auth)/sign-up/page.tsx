import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { signup } from "../actions";
import { AuthMain } from "../frame";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthMain>
      <AuthForm mode="signup" action={signup} />
    </AuthMain>
  );
}
