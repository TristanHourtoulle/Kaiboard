"use client";

import { useProfile } from "@/hooks/useProfile";
import { useTeam } from "@/hooks/useTeam";
import { useUser } from "@/hooks/useUser";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TeamInformation } from "./TeamInformation";
import { TeamMembers } from "./TeamMembers";

export default function Preference() {
  const { getTeamById } = useTeam();
  const { user, loading } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const { getProfile } = useProfile();
  const params = useParams();
  const [idTeam, setIdTeam] = useState<string>(params.idTeam as string);
  const [team, setTeam] = useState<any>(null);

  const setNewTeam = (teams: any) => {
    setTeam(teams);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  useEffect(() => {
    if (user && profile) {
      getTeamById(idTeam, user.id).then((team) => {
        setTeam(team);
      });
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && user && user.id) {
      fetchProfile(user.id);
    }
  }, [user, loading]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {user && profile && team ? (
        <div className="flex flex-col gap-4 p-4 pt-0 w-full">
          <h1 className="text-2xl font-semibold">Preference</h1>
          <div className="flex items-stretch gap-6 w-full flex-wrap lg:flex-nowrap">
            <div className="flex-1 flex">
              <TeamInformation
                team_id={team[0].team_id}
                loadTeam={setNewTeam}
                user_id={user.id}
              />
            </div>
            <div className="flex-1 flex">
              <TeamMembers team_id={team[0].team_id} user_id={user.id} />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading user and team informations...</p>
      )}
    </div>
  );
}
