import { supabase } from "@/lib/supabase";

export type TeamMeetingType = {
  id: string;
  team_id: string;
  created_at: string;
  date_time: string;
  title: string;
  description: string;
};

export function useTeamMeeting() {
  const createTeamMeeting = async (data: any) => {
    try {
      const { data: meeting, error } = await supabase
        .from("team_meetings")
        .insert({
          team_id: data.team_id,
          date_time: data.date_time,
          title: data.title,
          description: data.description,
          link: data.link || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return meeting;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const getTeamMeetings = async (teamId: string) => {
    try {
      const { data: meetings, error } = await supabase
        .from("team_meetings")
        .select("*")
        .eq("team_id", teamId);

      if (error) {
        throw new Error(error.message);
      }

      return meetings;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateTeamMeeting = async (data: any) => {
    try {
      const { data: meeting, error } = await supabase
        .from("team_meetings")
        .update({
          date_time: data.date_time,
          title: data.title,
          description: data.description,
          link: data.link || null,
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return meeting;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const deleteTeamMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("team_meetings")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return {
    createTeamMeeting,
    getTeamMeetings,
    updateTeamMeeting,
    deleteTeamMeeting,
  };
}
