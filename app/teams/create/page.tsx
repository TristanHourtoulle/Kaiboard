import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreateTeamClient } from "@/components/teams/create-team-client";

export default async function CreateTeamPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="container-responsive py-6 lg:py-8 max-w-2xl">
      <CreateTeamClient />
    </div>
  );
} 