"use client";

import { convertDateTimeToUtc, formatDateTime } from "@/lib/utils";

export type PreviewDateTimeProps = {
  dateTime: string;
  savedZones: any[];
};

export const PreviewDateTime = (props: PreviewDateTimeProps) => {
  const { dateTime, savedZones } = props;

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
