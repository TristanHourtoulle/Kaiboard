"use client";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { TeamMeetingType, useTeamMeeting } from "@/hooks/useTeamMeeting";
import { useUser } from "@/hooks/useUser";
import { splitDateTime } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { MeetingCard } from "../meetings/MeetingCard";

export type MeetingsProps = {
  team_id: string;
};

export const Meetings = (props: MeetingsProps) => {
  const { getTeamMeetings } = useTeamMeeting();
  const { profile, getProfile } = useProfile();
  const { user, loading } = useUser();
  const [closestMeeting, setClosestMeeting] = useState<TeamMeetingType | null>(
    null
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [userPreferences, setUserPreferences] = useState({
    utc: null,
    savedUtc: [],
  });

  const getClosestMeeting = (data: TeamMeetingType[]) => {
    const now = new Date();
    const upcomingMeetings = data.filter(
      (meeting) => new Date(meeting.date_time) >= now
    );
    if (upcomingMeetings.length === 0) return null;
    return upcomingMeetings.reduce((closest, current) => {
      const closestTime = new Date(closest.date_time).getTime();
      const currentTime = new Date(current.date_time).getTime();
      return currentTime < closestTime ? current : closest;
    });
  };

  const refreshFunction = async () => {
    setIsFetching(true);
    await getTeamMeetings(props.team_id).then((data: any) => {
      setClosestMeeting(getClosestMeeting(data));
    });
    setIsFetching(false);
  };

  useEffect(() => {
    if (!user) return;
    getProfile(user.id);
    refreshFunction();
  }, [props.team_id, user]);

  useEffect(() => {
    if (!profile) return;
    setUserPreferences({
      utc: profile.location.utc,
      savedUtc: profile.location.savedZones,
    });
  }, [profile]);

  return (
    <div className="flex flex-col gap-3 items-start rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg font-semibold">Next Meeting</h2>
        <Button
          onClick={refreshFunction}
          variant={"outline"}
          disabled={isFetching}
        >
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex items-center justify-start gap-3 flex-wrap">
        {/* Content */}
        {closestMeeting && userPreferences.utc ? (
          (() => {
            const schedule = splitDateTime(closestMeeting.date_time);
            return (
              <MeetingCard
                key={closestMeeting.id}
                meeting={closestMeeting}
                shedule={schedule}
                onMeetingDeleted={refreshFunction}
                utc={profile.location.utc}
                savedZone={userPreferences.savedUtc}
              />
            );
          })()
        ) : (
          <p>No upcoming meetings scheduled for this team.</p>
        )}
      </div>
    </div>
  );
};
