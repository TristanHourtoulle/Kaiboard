"use client";

import { useUserMeetings } from "@/hooks/useMeeting";
import { getSavedZones, getUTC, useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { CreateMeeting } from "./CreateMeeting";
import { MeetingCard } from "./MeetingCard";

export default function Page() {
  const { user, loading: userLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    utc: getUTC(),
    savedUtc: getSavedZones(),
  });
  const [meetingsList, setMeetingsList] = useState<any[]>([]);

  // Check if UTC settings are missing
  const hasUtcSettings = userPreferences.utc;

  const {
    loading: meetingsLoading,
    meetings,
    error,
    fetchMeetings,
  } = useUserMeetings(userId || "");

  useEffect(() => {
    if (!userLoading && user?.id && !userId) {
      setUserId(user.id);
    }
  }, [user, userLoading]);

  const loadMeetings = async () => {
    fetchMeetings();
    setMeetingsList(meetings || []);
  };

  useEffect(() => {
    if (userId) {
      loadMeetings();
    }
  }, [userId]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {/* Header */}
      <div className="flex items-center w-full mb-6">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-semibold">
            This is the meetings page,{" "}
            {!userLoading ? user?.user_metadata?.firstname : <Skeleton />}
          </h1>
          <p className="text-white text-opacity-75 text-md">
            Here, you can create some meetings and invite some collaborators.
          </p>
        </div>
        {!userLoading && user && hasUtcSettings && (
          <CreateMeeting user={user} onMeetingCreated={loadMeetings} />
        )}
      </div>

      {/* Meetings Layout */}
      <div className="flex flex-wrap gap-4 items-center justify-start w-full">
        {userLoading || meetingsLoading ? (
          <Skeleton count={3} height={150} />
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : meetings.length > 0 && hasUtcSettings ? (
          meetings.map((meeting: any) => {
            const schedule = splitDateTime(meeting.date_time);
            return (
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
          meetings.length === 0 && (
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
