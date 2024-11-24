"use client";

import { useProfile } from "@/hooks/useProfile";
import { useTeam } from "@/hooks/useTeam";
import { TeamMeetingType, useTeamMeeting } from "@/hooks/useTeamMeeting";
import { getSavedZones, getUTC, useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { CreateMeeting } from "./CreateMeeting";
import { MeetingCard } from "./MeetingCard";

export default function TeamMeeting({
  params: { idTeam },
}: {
  params: { idTeam: string };
}) {
  const { createTeamMeeting, getTeamMeetings } = useTeamMeeting();
  const [teamMeetings, setTeamMeetings] = useState<TeamMeetingType[]>([]);
  const { getProfile } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const { user, loading } = useUser();
  const [userPreferences, setUserPreferences] = useState({
    utc: getUTC(),
    savedUtc: getSavedZones(),
  });
  const hasUtcSettings = userPreferences.utc;
  const { getTeamById } = useTeam();
  const [team, setTeam] = useState<any>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  useEffect(() => {
    // Fetch team meetings
    getTeamMeetings(idTeam).then((meetings) => {
      setTeamMeetings(meetings);
    });
  }, [idTeam]);

  // fetch profile when user is loaded
  useEffect(() => {
    if (!loading && user?.id) {
      fetchProfile(user.id);
      // Fetch team data
      getTeamById(idTeam, user.id).then((data: any) => {
        //TODO: Handle if the team is not found => user is not a member of the team
        setTeam(data[0].teams);
      });
    }
  }, [user, loading]);

  const fetchMeetings = async () => {
    if (!idTeam) return;
    getTeamMeetings(idTeam).then((meetings) => {
      setTeamMeetings(meetings);
    });
  };

  const loadMeetings = async () => {
    fetchMeetings();
    setTeamMeetings(teamMeetings || []);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {/* Header */}
      <div className="flex items-center w-full mb-6">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-semibold">
            This is the meetings page of {team ? team.name : <Skeleton />},{" "}
            {!loading && profile ? profile.username : <Skeleton />}
          </h1>
          <p className="text-white text-opacity-75 text-md">
            Here, you can create some meetings and invite some collaborators.
          </p>
        </div>
        {!loading && user && profile && idTeam && (
          <CreateMeeting
            user={user}
            onMeetingCreated={loadMeetings}
            teamId={idTeam}
          />
        )}
      </div>

      {/* Meetings Layout */}
      <div className="flex flex-wrap gap-4 items-center justify-start w-full">
        {loading ? (
          <Skeleton count={3} height={150} />
        ) : teamMeetings.length > 0 && hasUtcSettings ? (
          teamMeetings.map((meeting: any) => {
            const schedule = splitDateTime(meeting.date_time);
            return (
              // <p>{meeting.title}</p>
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                shedule={schedule}
                onMeetingDeleted={loadMeetings}
              />
            );
          })
        ) : !hasUtcSettings ? (
          // If the user has no UTC settings
          <div className="text-left w-full">
            <p className="text-gray-600">
              You haven't set your personal UTC yet.
            </p>
            <div className="flex gap-2 items-center w-full">
              <p className="text-gray-600 inline">
                Please go to the <strong>Preferences</strong> section to set
                your UTC or click here{" "}
              </p>
              <Link href="/preference" className="underline">
                preferences page
              </Link>
            </div>
          </div>
        ) : (
          teamMeetings.length === 0 && (
            // If there are no meetings
            <div className="text-center">
              <p className="text-gray-600">You have no meetings scheduled.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
