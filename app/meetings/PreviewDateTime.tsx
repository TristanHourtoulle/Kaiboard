"use client";

export type PreviewDateTimeProps = {
  dateTime: string;
  savedZones: any[];
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
  const { dateTime, savedZones } = props;

  // Example of savedZones:
  // [
  //   { country: "fr", utc: "utc+1" },
  //   { country: "us", utc: "utc-8" },
  // ]
  // Sort savedZones by utc offset (from smallest to largest)
  savedZones.sort((a, b) => {
    const matchA = a.utc.match(/^utc([\+\-])(\d{1,2})$/);
    const matchB = b.utc.match(/^utc([\+\-])(\d{1,2})$/);
    if (!matchA || !matchB) {
      return 0;
    }

    const [_, signA, hoursOffsetA] = matchA;
    const [__, signB, hoursOffsetB] = matchB;

    const offsetA =
      signA === "+" ? parseInt(hoursOffsetA, 10) : -parseInt(hoursOffsetA, 10);
    const offsetB =
      signB === "+" ? parseInt(hoursOffsetB, 10) : -parseInt(hoursOffsetB, 10);

    return offsetA - offsetB;
  });

  if (!dateTime || !savedZones) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-3 w-full">
      {savedZones.map((zone, index) => {
        const { date, time } = formatDateTime(
          convertDateTimeToUtc(dateTime, zone.utc)
        );
        return (
          <div key={index} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{zone.country}</span>
              <span className="text-sm text-gray-500">
                {zone.utc.toUpperCase()}
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
