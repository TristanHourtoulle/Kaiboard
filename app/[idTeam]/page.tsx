"use client";

import { useProfile } from "@/hooks/useProfile";
import { useTeam } from "@/hooks/useTeam";
import { useUser } from "@/hooks/useUser";
import { memberType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type allMembersType = {
  user_id: any;
  role: any;
  profile: { name: any; firstname: any; email: any; id: any };
}[];

export default function TeamHome({
  params: { idTeam },
}: {
  params: { idTeam: string };
}) {
  const router = useRouter();
  const { getProfile } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const { user, loading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const { getTeamById, getTeamMembers } = useTeam();
  const [team, setTeam] = useState<any>(null);
  const [member, setMember] = useState<memberType>({
    id_team: "",
    role: "",
    join_at: "",
    id_user: "",
  });
  const [allMembers, setAllMembers] = useState<any[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  // Ensure the `useEffect` hook is always called
  useEffect(() => {
    if (!loading && idTeam && user?.id) {
      getTeamById(idTeam, user.id).then((data: any) => {
        setTeam(data[0].teams); // Set the team data if available
        setMember({
          id_team: data[0].team_id,
          role: data[0].role,
          join_at: data[0].join_at,
          id_user: user.id,
        });
        getTeamMembers(idTeam).then((members: any) => {
          setAllMembers(members);
        });
        fetchProfile(user.id);
      });
    }
  }, [user, idTeam]);

  // Early return for loading state
  if (loading || !user || !profile || !team) {
    return <p>Loading user information...</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-semibold">
        Welcome in {team ? team.name : "the team"}, {profile.username}!
      </h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
