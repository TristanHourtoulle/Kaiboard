import { supabase } from "@/lib/supabase";

export const useTeam = () => {
  // Gestion des équipes
  const createTeam = async (
    name: string,
    description: string,
    userId: string
  ) => {
    const { data, error } = await supabase
      .from("teams")
      .insert({
        name,
        description,
        created_by: userId,
      })
      .select();

    if (error) throw new Error(error.message);
    return data;
  };

  const updateTeam = async (
    teamId: string,
    updatedFields: { name?: string; description?: string }
  ) => {
    const { data, error } = await supabase
      .from("teams")
      .update(updatedFields)
      .eq("id", teamId)
      .select();

    if (error) throw new Error(error.message);
    return data;
  };

  const deleteTeam = async (teamId: string) => {
    const { error } = await supabase.from("teams").delete().eq("id", teamId);

    if (error) throw new Error(error.message);
  };

  const getUserTeams = async (userId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, teams(name, description)")
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return data;
  };

  // Gestion des membres d'une équipe
  const addTeamMember = async (
    teamId: string,
    userId: string,
    role: "owner" | "admin" | "member" = "member"
  ) => {
    const { data, error } = await supabase
      .from("team_members")
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
      })
      .select();

    if (error) throw new Error(error.message);
    return data;
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("team_id", teamId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  };

  const getTeamMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("user_id, role, users(username, email)")
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
    return data;
  };

  return {
    createTeam,
    updateTeam,
    deleteTeam,
    getUserTeams,
    addTeamMember,
    removeTeamMember,
    getTeamMembers,
  };
};
