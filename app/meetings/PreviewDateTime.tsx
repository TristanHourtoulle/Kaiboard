"use client";

import { getSavedZones, zonesSavedType } from "@/hooks/useUser";

export type PreviewDateTimeProps = {
  dateTime: string;
};

// Params received: ("2024-11-30T12:00:00+00:00", "utc+1")
// Returns: "2024-11-30T13:00"
export const convertDateTimeToUtc = (dateTime: string, utc: string): string => {
  // Validate input
  if (!dateTime || !utc) {
    throw new Error("DateTime or UTC is undefined or invalid");
  }

  // Validate UTC format
  const match = utc
    .toLowerCase()
    .trim()
    .match(/^utc([\+\-])(\d{1,2})$/);
  if (!match) {
    throw new Error("Invalid UTC format. Expected format: utc+X or utc-X");
  }

  const [_, sign, hoursOffset] = match;
  const offset =
    sign === "+" ? parseInt(hoursOffset, 10) : -parseInt(hoursOffset, 10);

  // Convert `dateTime` to a JavaScript Date object
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) {
    throw new Error(
      "Invalid date format. Expected ISO 8601 format (e.g., 2024-11-29T20:00:00+00:00)"
    );
  }

  // Apply the UTC offset
  const adjustedDate = new Date(date.getTime() + offset * 60 * 60 * 1000);

  // Format the adjusted date as "Day Month Year"
  const formattedDate = adjustedDate.toISOString().slice(0, 16);

  return formattedDate;
};

// Params received: ("2024-11-30T13:00")
// returns: {date: "30 November 2024", time: "13:00"}
export const formatDateTime = (
  dateTime: string
): { date: string; time: string } => {
  const date = new Date(dateTime);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date: formattedDate, time: formattedTime };
};

export const PreviewDateTime = (props: PreviewDateTimeProps) => {
  const { dateTime } = props;
  const savedZone: zonesSavedType[] = getSavedZones();

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      {savedZone.map((zone, index) => {
        const { date, time } = formatDateTime(
          convertDateTimeToUtc(dateTime, zone.timezone)
        );
        return (
          <div key={index} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{zone.country}</span>
              <span className="text-sm text-gray-500">
                {zone.timezone.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {date}
                {", "}
                {time}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};