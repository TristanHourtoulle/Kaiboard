"use client";

import { useUserMeetings } from "@/hooks/useMeeting";
import { useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { CreateMeeting } from "./CreateMeeting";
import { MeetingCard } from "./MeetingCard";

export default function Page() {
  const { user, loading: userLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

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

  useEffect(() => {
    if (userId) {
      fetchMeetings();
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
        {!userLoading && user && <CreateMeeting user={user} />}
      </div>

      {/* Meetings Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userLoading || meetingsLoading ? (
          <Skeleton count={3} height={150} />
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : meetings.length > 0 ? (
          meetings.map((meeting: any) => {
            const schedule = splitDateTime(meeting.date_time);
            console.log(schedule); // Optionnel : à garder si vous voulez vérifier dans la console
            return (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                shedule={schedule}
              />
            );
          })
        ) : (
          <p className="text-gray-500">No meetings found.</p>
        )}
      </div>
    </div>
  );
}
