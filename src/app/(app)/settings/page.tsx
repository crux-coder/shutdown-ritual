import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { NameForm } from "./name-form";
import { PasswordForm } from "./password-form";
import { SettingsSection, SettingsSkeleton } from "./settings-section";

export const metadata: Metadata = { title: "Profile · Settings" };

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <ProfileSettings />
    </Suspense>
  );
}

async function ProfileSettings() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Profile" description="How we greet you each day.">
        <NameForm firstName={user.firstName} email={user.email} />
      </SettingsSection>
      <SettingsSection title="Password" description="At least 8 characters.">
        <PasswordForm />
      </SettingsSection>
    </div>
  );
}
