"use client";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useTeam } from "@/hooks/useTeam";
import { TeamMeetingType, useTeamMeeting } from "@/hooks/useTeamMeeting";
import { useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
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
  const [teamMeetingsToShow, setTeamMeetingsToShow] = useState<
    TeamMeetingType[]
  >([]);
  const { profile, getProfile } = useProfile();
  const { user, loading } = useUser();
  const [userPreferences, setUserPreferences] = useState({
    utc: null,
    savedUtc: [],
  });
  const { getTeamById } = useTeam();
  const [team, setTeam] = useState<any>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [coolDownFetch, setCoolDownFetch] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setUserPreferences({
      utc: profile.location.utc,
      savedUtc: profile.location.savedZones,
    });
  }, [profile]);

  const fetchProfile = async (userId: string) => {
    try {
      await getProfile(userId);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  useEffect(() => {
    // Fetch team meetings
    fetchMeetings();
  }, [idTeam]);

  // fetch profile when user is loaded
  useEffect(() => {
    if (!loading && user?.id) {
      fetchProfile(user.id);
      // Fetch team data
      getTeamById(idTeam, user.id).then((data: any) => {
        // Handle if the team is not found => user is not a member of the team
        setTeam(data[0]?.teams || null);
      });
    }
  }, [user, loading]);

  // Update teamMeetingsToShow when teamMeetings changes
  useEffect(() => {
    setTeamMeetingsToShow(getUpcomingMeetings());
  }, [teamMeetings]);

  const fetchMeetings = async () => {
    if (!idTeam || isFetching) return;
    setCoolDownFetch(true);
    setIsFetching(true); // Prevent multiple fetch requests simultaneously
    try {
      const meetings = await getTeamMeetings(idTeam);
      const sortedMeetings = meetings.sort(
        (a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      );
      setTeamMeetings(sortedMeetings);
      setLastFetchTime(new Date()); // Update the last fetch time
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsFetching(false);
      setTimeout(() => setCoolDownFetch(false), 10000); // Allow refresh after 5 seconds
    }
  };

  const loadMeetings = async () => {
    fetchMeetings();
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = teamMeetings.filter(
      (meeting) => new Date(meeting.date_time) > now
    );
    return upcomingMeetings;
  };

  const getPastMeetings = () => {
    const now = new Date();
    const pastMeetings = teamMeetings.filter(
      (meeting) => new Date(meeting.date_time) <= now
    );
    return pastMeetings;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-semibold">
            This is the meetings page of {team ? team.name : <Skeleton />},{" "}
            {!loading && profile ? profile.username : <Skeleton />}
          </h1>
          <p className="text-white text-opacity-75 text-md">
            Here, you can create some meetings and invite some collaborators.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            onClick={fetchMeetings}
            disabled={coolDownFetch}
            className="py-2 max-w-sm"
          >
            {/* Utilise l'icon <RefreshCcw /> comme symbole dans le bouton refresh, quand isFetching est true alors fait que ce comp soit en spinner */}
            <RefreshCcw
              className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          {!loading && user && profile && idTeam && (
            <CreateMeeting
              user={user}
              onMeetingCreated={loadMeetings}
              teamId={idTeam}
            />
          )}
        </div>
      </div>

      {/* Last Fetch Time */}
      {lastFetchTime && (
        <p className="text-sm text-gray-400">
          Last updated: {lastFetchTime.toLocaleString()}
        </p>
      )}

      {/* Meetings Layout */}
      <div className="flex flex-wrap gap-4 items-center justify-start w-full">
        {loading ? (
          <Skeleton count={3} height={150} />
        ) : teamMeetingsToShow.length > 0 && userPreferences.utc ? (
          teamMeetingsToShow.map((meeting: any) => {
            const schedule = splitDateTime(meeting.date_time);
            return (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                shedule={schedule}
                onMeetingDeleted={loadMeetings}
                utc={profile.location.utc}
                savedZone={userPreferences.savedUtc}
              />
            );
          })
        ) : !userPreferences.utc ? (
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
            <div className="text-center">
              <p className="text-gray-600">You have no meetings scheduled.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
