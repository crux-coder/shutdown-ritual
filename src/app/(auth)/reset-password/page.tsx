import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/password-forms";
import { AuthMain } from "../frame";

export const metadata: Metadata = { title: "New password" };

// Reached from a reset link, which signs the user in first; the proxy sends
// anyone signed out to the login page.
export default function ResetPasswordPage() {
  return (
    <AuthMain>
      <ResetPasswordForm />
    </AuthMain>
  );
}
