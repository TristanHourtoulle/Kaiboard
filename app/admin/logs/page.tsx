import { auth } from "@/auth";
import { AdminLogsClient } from "@/components/admin/admin-logs-client";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLogsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }

  // Get user and verify super admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== 'SUPER_ADMIN') {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Request Logs</h1>
            <p className="text-muted-foreground">
              Monitor and analyze all system requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Super Admin Only</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        
        <AdminLogsClient />
      </div>
    </div>
  );
} 