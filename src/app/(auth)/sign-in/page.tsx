import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { login } from "../actions";
import { AuthMain } from "../frame";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthMain>
      <Suspense fallback={<AuthForm mode="login" action={login} />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthMain>
  );
}

async function LoginForm({
  searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
  const { error } = await searchParams;
  const initialError =
    error === "confirm"
      ? "That confirmation link didn't work. It may have expired."
      : error === "reset"
        ? "That reset link didn't work. It may have expired, so ask for a new one."
        : undefined;

  return <AuthForm mode="login" action={login} initialError={initialError} />;
}
