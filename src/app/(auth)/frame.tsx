import type { ReactNode } from "react";

// The rows of the auth layout's frame. Pages place their parts in them:
// AuthTop under the logo (e.g. onboarding's progress), AuthMain centred in
// the space left, AuthBottom at the foot of the screen.

export function AuthTop({ children }: { children: ReactNode }) {
  return <div className="row-start-2 pt-4">{children}</div>;
}

export function AuthMain({
  className = "max-w-sm",
  children,
}: {
  // Sets the width of the centred column.
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`row-start-3 flex w-full flex-col self-center py-10 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthBottom({ children }: { children: ReactNode }) {
  return <div className="row-start-4 pb-8">{children}</div>;
}
