import { supabase } from "@/lib/supabase";

export const useTeam = () => {
  // Gestion des équipes
  const createTeam = async (
    name: string,
    description: string,
    userId: string
  ) => {
    // Créer une transaction pour garantir la cohérence des données
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .insert({
        name,
        description,
        created_by: userId,
      })
      .select()
      .single(); // Récupérer uniquement la première équipe créée

    if (teamError) {
      throw new Error(`Error creating team: ${teamError.message}`);
    }

    // Ajouter le créateur en tant que owner dans team_members
    const { error: memberError } = await supabase.from("team_members").insert({
      team_id: teamData.id, // Utiliser l'id de l'équipe nouvellement créée
      user_id: userId,
      role: "owner",
    });

    if (memberError) {
      throw new Error(
        `Error adding owner to team_members: ${memberError.message}`
      );
    }

    return teamData; // Retourne les données de l'équipe créée
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

  const getTeamById = async (teamId: string, userId: string) => {
    const { data, error } = await supabase
      .from("team_members")
      .select("team_id, role, join_at, teams(name, description)")
      .eq("team_id", teamId)
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
      .select(
        `
        user_id,
        role,
        profiles (
          name,
          firstname,
          email,
          id
        )
      `
      )
      .eq("team_id", teamId);

    if (error) {
      console.error("Error fetching team members:", error.message);
      throw new Error(error.message);
    }

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
    getTeamById,
  };
};
