import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Fetches the user from the session
export function useUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading };
}

// Set the UTC received as parameter in a cookie
export function setUTC(utc: string) {
  document.cookie = `utc=${encodeURIComponent(utc)}; path=/`;
}

// Get the UTC from a cookie
export function getUTC() {
  return decodeURIComponent(
    document.cookie.replace(/(?:(?:^|.*;\s*)utc\s*=\s*([^;]*).*$)|^.*$/, "$1")
  );
}

// Remove the UTC cookie
export function removeUTC() {
  document.cookie = "utc=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Set the country received as parameter in a cookie
export function setCountry(country: string) {
  document.cookie = `country=${country}; path=/`;
}

// Get the country from a cookie
export function getCountry() {
  return document.cookie.replace(
    /(?:(?:^|.*;\s*)country\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
}

// Remove the country cookie
export function removeCountry() {
  document.cookie = "country=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export function updateUtcCountry(utc: string, country: string) {
  setUTC(utc);
  setCountry(country);
}

export function clearUtcCountry() {
  removeUTC();
  removeCountry();
}

// Get the user's UTC and country from cookies
export function getUtcCountry() {
  return {
    savedUtc: getUTC(),
    savedCountry: getCountry(),
  };
}

export type zonesSavedType = {
  timezone: string;
  country: string;
};

// Get a list of { timezone, country } from a cookie named savedZones
export function getSavedZones(): zonesSavedType[] {
  const savedZones = document.cookie.replace(
    /(?:(?:^|.*;\s*)savedZones\s*=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
  return savedZones ? JSON.parse(savedZones) : [];
}

// Set a list of { timezone, country } in a cookie named savedZones
export function setSavedZones(zones: zonesSavedType[]) {
  document.cookie = `savedZones=${JSON.stringify(zones)}; path=/`;
}

// Remove the savedZones cookie
export function removeSavedZones() {
  document.cookie =
    "savedZones=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Remove a specific zone from the savedZones cookie
export function removeZone(zone: zonesSavedType) {
  const savedZones = getSavedZones();
  const newZones = savedZones.filter(
    (z: zonesSavedType) => z.timezone !== zone.timezone
  );
  document.cookie = `savedZones=${JSON.stringify(newZones)}; path=/`;
}

// Remove all zones from the savedZones cookie
export function removeAllZones() {
  document.cookie =
    "savedZones=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
