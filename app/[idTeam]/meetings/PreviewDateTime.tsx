"use client";

import { convertDateTimeToUtc, formatDateTime } from "@/lib/utils";

export type PreviewDateTimeProps = {
  dateTime: string;
  savedZones: any[];
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
