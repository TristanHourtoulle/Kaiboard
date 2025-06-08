import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MainAppLayout } from "./main-app-layout";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { ActivityTracker } from "@/components/providers/activity-tracker";

export async function AppLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Get user role if session exists
  let userRole: string | null = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    userRole = user?.role || null;
  }

  return (
    <AuthSessionProvider>
      <ActivityTracker />
      <MainAppLayout session={session} userRole={userRole}>
        {children}
      </MainAppLayout>
    </AuthSessionProvider>
  );
} 