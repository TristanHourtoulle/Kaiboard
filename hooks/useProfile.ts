import { supabase } from "@/lib/supabase";
import { set } from "date-fns";
import { useState } from "react";

export const useProfile = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [profilesList, setProfilesList] = useState<any[]>([]);

  const getListProfiles = async (profileIds: string[]) => {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .in("id", profileIds);

    if (error) {
      console.error("Error fetching profiles:", error.message);
      throw new Error(error.message);
    }

    setProfilesList(data);
  };

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      throw new Error(error.message);
    }

    setProfile(data);
    return data;
  };

  const updateProfile = async (userId: string, data: any) => {
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error.message);
      throw new Error(error.message);
    }
    setProfile(data);
  };

  return {
    profile,
    profilesList,
    getProfile,
    updateProfile,
    getListProfiles,
  };
};
