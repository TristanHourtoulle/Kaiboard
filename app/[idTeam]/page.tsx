"use client";

import { useProfile } from "@/hooks/useProfile";
import { useProject } from "@/hooks/useProject";
import { useTeam } from "@/hooks/useTeam";
import { useUser } from "@/hooks/useUser";
import { memberType } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Meetings } from "./dashboard/Meetings";
import { Tasks } from "./dashboard/Tasks";

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
  const { projects, sprints, fetchProjects, fetchTasksByProfileId } =
    useProject(idTeam);
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
  const [userTasks, setUserTasks] = useState<any[]>([]);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  const refreshTasksSection = async () => {
    fetchProjects(idTeam);
    fetchTasksByProfileId(user.id).then((tasks: any) => {
      setUserTasks(tasks);
    });
  };

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
        fetchProjects(idTeam);
        fetchTasksByProfileId(user.id).then((tasks: any) => {
          setUserTasks(tasks); // Mettre à jour avec les données retournées
        });
      });
    }
  }, [user, idTeam]);

  if (loading || !user || !profile || !team) {
    return <p>Loading user information...</p>;
  }

  return (
    <div className="grid grid-rows-[auto,1fr] gap-4 p-4 h-screen">
      <h1 className="text-2xl font-semibold">
        Welcome in {team ? team.name : "the team"}, {profile.username}!
      </h1>
      <div className="grid grid-cols-[auto,1fr] gap-4 items-start w-full h-full">
        <div className="rounded-lg border border-border p-4 shadow h-full max-h-[450px]">
          <Meetings team_id={idTeam} />
        </div>
        <div className="rounded-lg border border-border p-4 shadow h-full max-h-[450px]">
          <Tasks
            project={projects}
            tasks={userTasks}
            team_id={idTeam}
            refreshFunction={refreshTasksSection}
          />
        </div>
      </div>
    </div>
  );
}
