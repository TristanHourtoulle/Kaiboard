"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { convertDateTimeToUtc } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type addToCalendarProps = {
  meeting: {
    title: string;
    description: string;
    date_time: string; // Meeting start time in ISO format
    link?: string;
  };
  utc: string; // User's timezone in format "utc+X"
};

export const AddToCalendar = (props: addToCalendarProps) => {
  const { meeting, utc } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const meetingDuration = 1 * 60 * 60 * 1000; // 1 hour in milliseconds

  const generateGoogleCalendarUrl = () => {
    // Convert the start date to the user's UTC
    const startDateTime = convertDateTimeToUtc(meeting.date_time, utc);
    const startDate = startDateTime.replace(/[-:]/g, "").split(".")[0] + "00"; // Add seconds

    // Calculate the end date by adding 1 hour
    const endDateTime = new Date(
      new Date(meeting.date_time).getTime() + meetingDuration
    ).toISOString();
    const endDate =
      convertDateTimeToUtc(endDateTime, utc)
        .replace(/[-:]/g, "")
        .split(".")[0] + "00";

    // Event details
    const details = encodeURIComponent(meeting.description || "");
    const meetingTitle = encodeURIComponent(meeting.title);
    const meetingLink = encodeURIComponent(meeting.link || "");

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${meetingTitle}&dates=${startDate}/${endDate}&details=${details}&location=${meetingLink}`;
  };

  const generateOutlookCalendarUrl = () => {
    // Convert the start date to the user's UTC
    const startDateTime = convertDateTimeToUtc(meeting.date_time, utc);

    // Calculate the end date by adding 1 hour
    const endDateTime = new Date(
      new Date(meeting.date_time).getTime() + meetingDuration
    ).toISOString();
    const endDate = convertDateTimeToUtc(endDateTime, utc);

    // Event details
    const details = encodeURIComponent(meeting.description || "");
    const meetingTitle = encodeURIComponent(meeting.title);
    const meetingLink = encodeURIComponent(meeting.link || "");

    return `https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&startdt=${startDateTime}&enddt=${endDate}&subject=${meetingTitle}&body=${details}%0A${meetingLink}`;
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="flex items-center justify-center gap-2"
        >
          Add to Calendar
          <ChevronDown
            size={"lg"}
            className={`transition-all transform ${
              isDropdownOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-full px-4">
        <DropdownMenuItem>
          <Link
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsDropdownOpen(false)}
          >
            Google Calendar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href={generateOutlookCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsDropdownOpen(false)}
          >
            Outlook Calendar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
