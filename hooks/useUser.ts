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
  console.log("Setting UTC:", utc);
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
