import { supabase } from "@/lib/supabase";

export const useProfile = () => {
  const getProfile = async (userId: string) => {
    console.log("Getting profile for user:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      throw new Error(error.message);
    }

    console.log("Profile data:", data);

    return data;
  };

  const updateProfile = async (userId: string, data: any) => {
    console.log("Updating profile for user:", userId);

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);

    if (error) {
      console.error("Error updating profile:", error.message);
      throw new Error(error.message);
    }
  };

  return {
    getProfile,
    updateProfile,
  };
};
