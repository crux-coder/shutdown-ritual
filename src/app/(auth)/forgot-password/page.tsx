import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/password-forms";
import { AuthMain } from "../frame";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthMain>
      <ForgotPasswordForm />
    </AuthMain>
  );
}
