import { auth } from "@/auth";
import { UserSettingsClient } from "@/components/settings/user-settings-client";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();

  if (!session || !session.user) {
    return <div>Unauthorized</div>;
  }

  // Get user data with timezone and country
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true,
      country: true,
      role: true,
      image: true,
    }
  });

  return <UserSettingsClient user={user} />;
} 