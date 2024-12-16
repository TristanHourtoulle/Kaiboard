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

  /**
   * Delete a list of role from a specific team
   */
  const deleteTeamRole = useCallback(async (roleIds: string[]) => {
    setError(null);
    setIsTeamRoleLoading(true);

    try {
      const { error } = await supabase
        .from("team_roles")
        .delete()
        .in("id", roleIds);

      if (error) throw new Error(error.message);

      setRoles((prev) => prev.filter((role) => !roleIds.includes(role.id)));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsTeamRoleLoading(false);
    }
  }, []);

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
