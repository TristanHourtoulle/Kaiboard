import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert '2024-11-23T09:16:00+00:00' to ['2024-11-23', '09:16:00', '+00:00']
export function splitDateTime(dateTime: string): [string, string, string] {
  const [date, timeZone] = dateTime.split("T");
  const timeParts = timeZone.match(/^([\d:]+)([\+\-]\d{2}:\d{2})$/);

  if (!timeParts) {
    throw new Error("Invalid dateTime format");
  }

  const [_, time, offset] = timeParts; // Extract time and timezone offset
  return [date, time, offset];
}

// Convert '+00:00' to his corresponding timezone in format "UTC+00:00" (can be negative)
export function formatTimezone(timezone: string): string {
  const match = timezone.match(/^([\+\-])(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid timezone format");
  }
  const [sign, hours, minutes] = match.slice(1);
  return `UTC${sign}${hours}:${minutes}`;
}

// Convert '16:32:00' to '16:32'
export function formatTimeWithoutSeconds(time: string): string {
  return time.slice(0, -3);
}
