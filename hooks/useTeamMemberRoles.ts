import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export type TeamMemberRole = {
  id: number;
  team_member_id: number;
  team_role_id: number;
  created_at?: string;
};

export function useTeamMemberRoles(team_id: string) {
  const [teamMemberRoles, setTeamMemberRoles] = useState<TeamMemberRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMemberRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("team_member_roles")
        .select(
          `
          id,
          team_member_id,
          team_role_id,
          team_roles (title, color)
          created_at,
          team_members (id, team_id)
        `
        )
        .eq("team_members.team_id", team_id); // Filtre par team_id

      console.log("Réponse Supabase de fetchTeamMemberRoles :", {
        data,
        error,
      });

      if (error) throw error;

      // Formate les données si besoin
      const formattedData = data.map((item: any) => ({
        id: item.id,
        team_member_id: item.team_member_id,
        team_role_id: item.team_role_id,
        created_at: item.created_at,
      }));

      setTeamMemberRoles(formattedData);
      return formattedData; // <-- Retourne les données
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Ajouter une relation team_member_roles
  const addTeamMemberRole = async (
    team_member_id: number, // <-- Changement ici : string -> number
    team_role_id: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "Paramètres dans addTeamrole HOOKS:",
        team_member_id,
        typeof team_member_id,
        team_role_id,
        typeof team_role_id
      ); // Console log les paramètres avec leur type

      // Console log les paramètres avec leur type

      if (isNaN(team_member_id) || isNaN(team_role_id)) {
        throw new Error(
          "Invalid team_member_id or team_role_id. Must be a number."
        );
      }

      const { data, error } = await supabase
        .from("team_member_roles")
        .insert([{ team_member_id, team_role_id }]) // team_member_id doit être un nombre
        .select()
        .single();

      console.log("Réponse Supabase :", { data, error });

      if (error) throw error;

      setTeamMemberRoles((prev) => [...prev, data]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Supprimer une relation team_member_roles
  const deleteTeamMemberRole = async (
    team_member_id: string,
    team_role_id: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase
        .from("team_member_roles")
        .delete()
        .eq("team_member_id", team_member_id)
        .eq("team_role_id", team_role_id);

      if (error) throw error;

      setTeamMemberRoles((prev) =>
        prev.filter((role: any) => role.team_member_id !== team_member_id)
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Mettre à jour une relation
  const updateTeamMemberRole = async (
    team_member_role_id: number,
    updates: Partial<TeamMemberRole>
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("team_member_roles")
        .update(updates)
        .eq("id", team_member_role_id)
        .single();

      if (error) throw error;

      setTeamMemberRoles((prev) =>
        prev.map((role: any) => (role.id === team_member_role_id ? data : role))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Charge automatiquement les relations pour le team_id
  useEffect(() => {
    if (team_id) fetchTeamMemberRoles();
  }, [team_id]);

  return {
    teamMemberRoles,
    isLoading,
    error,
    fetchTeamMemberRoles,
    addTeamMemberRole,
    deleteTeamMemberRole,
    updateTeamMemberRole,
  };
}
