import { supabase } from "@/lib/supabase";
import { useCallback, useState } from "react";

export function useProject(team_id: string) {
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState<boolean>(false);

  /**
   * Fetch all projects for a specific team
   */
  const fetchProjects = useCallback(async (teamId: string) => {
    setError(null);
    setIsProjectLoading(true);

    try {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw new Error(error.message);

      setProjects(projectsData || []);
      return projectsData || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsProjectLoading(false);
    }
  }, []);

  /**
   * Add a project to a specific team
   */
  const addProject = useCallback(
    async (data: { team_id: string; title: string; description: string }) => {
      setError(null);
      setIsProjectLoading(true);

      try {
        const { data: projectData, error } = await supabase
          .from("projects")
          .insert([
            {
              team_id: data.team_id,
              title: data.title,
              description: data.description,
            },
          ])
          .select()
          .single();

        if (error) throw new Error(error.message);

        setProjects((prev) => [...prev, projectData]);
        return projectData;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setIsProjectLoading(false);
      }
    },
    []
  );

  /**
   * Delete a project to a specific team
   */
  const deleteProject = useCallback(async (projectId: string) => {
    setError(null);
    setIsProjectLoading(true);

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw new Error(error.message);

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return projectId;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsProjectLoading(false);
    }
  }, []);

  return {
    projects,
    error,
    isProjectLoading,
    fetchProjects,
    addProject,
    deleteProject,
  };
}
