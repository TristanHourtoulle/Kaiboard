"use client";

import { Button } from "@/components/ui/button";
import { useMeeting } from "@/hooks/useMeeting";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { CreateMeeting } from "./CreateMeeting";
import { MeetingCard } from "./MeetingCard";

export default function Page() {
  const { user, loading: userLoading } = useUser();
  const { profile, getProfile } = useProfile();
  const [userId, setUserId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    utc: null,
    savedUtc: [],
  });
  const [isFetching, setIsFetching] = useState(false);
  const [coolDownFetch, setCoolDownFetch] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!profile) return;
    setUserPreferences({
      utc: profile.location.utc,
      savedUtc: profile.location.savedZones,
    });
  }, [profile]);

  const {
    loading: meetingsLoading,
    error,
    meeting,
    meetingsList,
    fetchMeetingsList,
  } = useMeeting();

  useEffect(() => {
    if (!userLoading && user?.id && !userId) {
      setUserId(user.id);
      getProfile(user.id);
    }
  }, [user, userLoading]);

  const loadMeetings = async () => {
    setIsFetching(true);
    setCoolDownFetch(true);
    await fetchMeetingsList(user?.id);
    setLastFetchTime(new Date());
    setIsFetching(false);
    setTimeout(() => {
      setCoolDownFetch(false);
    }, 10000);
  };

  useEffect(() => {
    if (userId) {
      loadMeetings();
    }
  }, [userId]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-semibold">
            This is the meetings page,{" "}
            {!userLoading ? user?.user_metadata?.firstname : <Skeleton />}
          </h1>
          <p className="text-white text-opacity-75 text-md">
            Here, you can create some meetings and invite some collaborators.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            onClick={loadMeetings}
            disabled={coolDownFetch}
            className="py-2 max-w-sm"
          >
            {/* Utilise l'icon <RefreshCcw /> comme symbole dans le bouton refresh, quand isFetching est true alors fait que ce comp soit en spinner */}
            <RefreshCcw
              className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>

          {!userLoading && user && userPreferences.utc && (
            <CreateMeeting user={user} onMeetingCreated={loadMeetings} />
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
        {userLoading || meetingsLoading ? (
          <Skeleton count={3} height={150} />
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : meetingsList.length > 0 && userPreferences.utc ? (
          meetingsList.map((meeting: any) => {
            const schedule = splitDateTime(meeting.date_time);
            return (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                shedule={schedule}
                onMeetingDeleted={loadMeetings}
                utc={userPreferences.utc || ""}
                savedZone={userPreferences.savedUtc || []}
              />
            );
          })
        ) : !userPreferences.utc ? (
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
          meetingsList.length === 0 && (
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
