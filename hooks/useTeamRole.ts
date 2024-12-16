import { supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function useTeamRole(team_id: string) {
  const [roles, setRoles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTeamRoleLoading, setIsTeamRoleLoading] = useState<boolean>(false);

  /**
   * Fetch all roles for a specific team
   */
  const fetchTeamRoles = useCallback(async (teamId: string) => {
    setError(null);
    setIsTeamRoleLoading(true);

    try {
      const { data: rolesData, error } = await supabase
        .from("team_roles")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw new Error(error.message);

      setRoles(rolesData || []);
      return rolesData || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsTeamRoleLoading(false);
    }
  }, []);

  /**
   * Add a role to a specific team
   */
  const addTeamRole = useCallback(
    async (data: { team_id: string; title: string; color: string }) => {
      setError(null);
      setIsTeamRoleLoading(true);

      try {
        const { data: roleData, error } = await supabase
          .from("team_roles")
          .insert([
            {
              team_id: data.team_id,
              title: data.title, // Assure-toi que c'est bien 'title'
              color: data.color,
            },
          ])
          .select()
          .single();

        if (error) throw new Error(error.message);

        setRoles((prev) => [...prev, roleData]);
        return roleData;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsTeamRoleLoading(false);
      }
    },
    []
  );

  /**
   * Update a role from a specific team
   */
  const updateTeamRole = async (id: string, updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from("team_roles")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === id ? { ...role, ...updates } : role
        )
      );
    } catch (err: any) {
      console.error("Error updating team role:", err.message);
    }
  };

  // Supprimer plusieurs rôles et leurs relations associées dans team_member_roles
  const deleteTeamRole = async (role_ids: (string | number)[]) => {
    try {
      setIsTeamRoleLoading(true);
      setError(null);

      if (role_ids.length === 0) return;

      // Normaliser les IDs en `number` (si possible)
      const normalizedRoleIds = role_ids.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );

      if (normalizedRoleIds.some(isNaN)) {
        throw new Error(
          "Invalid role IDs provided. Ensure all IDs are numbers or strings convertible to numbers."
        );
      }

      // Étape 1 : Supprimer toutes les entrées dans team_member_roles pour les role_ids spécifiés
      const { error: deleteRelationsError } = await supabase
        .from("team_member_roles")
        .delete()
        .in("team_role_id", normalizedRoleIds);

      if (deleteRelationsError) {
        throw deleteRelationsError;
      }

      // Étape 2 : Supprimer les rôles dans team_roles
      const { error: deleteRolesError } = await supabase
        .from("team_roles")
        .delete()
        .in("id", normalizedRoleIds);

      if (deleteRolesError) {
        throw deleteRolesError;
      }

      // Mettre à jour l'état local en filtrant les rôles supprimés
      setRoles((prevRoles) =>
        prevRoles.filter((role) => !normalizedRoleIds.includes(role.id))
      );
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur lors de la suppression des rôles :", err.message);
    } finally {
      setIsTeamRoleLoading(false);
    }
  };

  /**
   * Load roles when component mounts or team_id changes
   */
  useEffect(() => {
    if (team_id) {
      fetchTeamRoles(team_id);
    }
  }, [team_id, fetchTeamRoles]);

  return {
    roles,
    error,
    isTeamRoleLoading,
    addTeamRole,
    fetchTeamRoles,
    deleteTeamRole,
    updateTeamRole,
  };
}
