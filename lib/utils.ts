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

// Convert ['2024-11-23', '09:16:00', '+00:00'] to '2024-11-23T09:16:00+00:00'
export function joinDateTime(
  date: string,
  time: string,
  offset: string
): string {
  return `${date}T${time}${offset}`;
}

// Convert '+02:00' to 'UTC+2'
export function formatTimezone(timezone: string): string {
  const match = timezone.match(/^([\+\-])(\d{2}):(\d{2})$/);
  if (!match) {
    throw new Error("Invalid timezone format");
  }
  const [_, sign, hours, minutes] = match;

  if (!sign || !hours || !minutes) {
    throw new Error("Invalid timezone format");
  }

  const offset = `${sign}${hours}`;
  const formattedOffset = offset.replace(/^([\+\-])0/, "$1"); // Remove leading zero

  return `UTC${formattedOffset}`.toLowerCase();
}

// Convert '16:32:00' to '16:32'
export function formatTimeWithoutSeconds(time: string): string {
  return time.slice(0, -3);
}

// Convert '2024-11-23' to '23 November 2024'
export function formatDateFromString(dateString: string) {
  const date = new Date(dateString);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  // Retourner la chaîne formatée
  return `${day} ${month} ${year}`;
}

// Convert time in utc+0 to the utc received as parameter
export function convertTimeToUtc(time: string, utc: string): string {
  // Vérifier que `time` et `utc` sont définis
  if (!time || !utc) {
    throw new Error("Time or UTC is undefined or invalid");
  }

  // Décomposer l'heure et les minutes
  const [hours, minutes] = time.split(":").map(Number);

  // Valider que `hours` et `minutes` sont des nombres
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error("Invalid time format. Expected format: HH:mm");
  }

  // Valider le format de timezone (ex: utc+8 ou utc-3)
  const match = utc.match(/^utc([\+\-])(\d{1,2})$/);
  if (!match) {
    throw new Error("Invalid UTC format. Expected format: utc+8 or utc-3");
  }

  const [_, sign, hoursOffset] = match;
  const offset = sign === "+" ? parseInt(hoursOffset) : -parseInt(hoursOffset);

  // Créer une date de référence avec les heures et minutes
  const date = new Date(Date.UTC(1970, 0, 1, hours, minutes)); // Heure en UTC
  date.setUTCHours(date.getUTCHours() + offset); // Ajuster avec le décalage

  // Obtenir les heures et minutes ajustées
  const adjustedHours = String(date.getUTCHours()).padStart(2, "0");
  const adjustedMinutes = String(date.getUTCMinutes()).padStart(2, "0");

  // Retourner l'heure formatée sans les secondes
  return `${adjustedHours}:${adjustedMinutes}`;
}

// Example Params received: ("2024-11-30T12:00:00+00:00", "utc+1")
// Returns for this example: "2024-11-30T13:00"
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

export function updateDateTimeWithUtc(dateTime: string, utc: string): string {
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

  // Format the adjusted date as ISO 8601 with the local UTC offset applied
  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(adjustedDate.getDate()).padStart(2, "0");
  const hours = String(adjustedDate.getHours()).padStart(2, "0");
  const minutes = String(adjustedDate.getMinutes()).padStart(2, "0");
  const seconds = String(adjustedDate.getSeconds()).padStart(2, "0");

  // Return the updated date-time in the UTC+x timezone
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const convertTimezone = (timezone: string): string => {
  // Extrait le signe (+ ou -) et le décalage horaire
  const match = timezone.match(/utc([+-]\d+)/i);
  if (!match) {
    throw new Error("Invalid timezone format. Expected 'utc+X' or 'utc-X'.");
  }

  // Récupère le décalage horaire
  const offset = parseInt(match[1], 10);

  // Formatage pour correspondre à "+08:00" ou "-03:00"
  const hours = Math.abs(offset).toString().padStart(2, "0");
  const formattedTimezone = `${offset >= 0 ? "+" : "-"}${hours}:00`;

  return formattedTimezone;
};

export const combineDateTime = (date: Date, time: string, timezone: string) => {
  const dateStr =
    date.getFullYear().toString().padStart(4, "0") +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0");
  const timeStr = `${time}:00`;
  const timezoneStr = convertTimezone(timezone); // Convertit la timezone
  return `${dateStr}T${timeStr}${timezoneStr}`;
};

export const getDaysLeft = (
  storedStartDate: string,
  storedEndDate: string
): string => {
  const startDate = new Date(storedStartDate);
  const endDate = new Date(storedEndDate);
  const today = new Date();

  // Calculer la différence en millisecondes entre aujourd'hui et la date de fin
  const timeDifference = endDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));

  // Vérifier si la date de fin est passée
  return daysLeft > 0 ? `${daysLeft} day(s)` : "Ended";
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
