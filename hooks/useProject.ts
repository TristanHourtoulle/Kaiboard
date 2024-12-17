import { supabase } from "@/lib/supabase";
import { useState } from "react";

export interface Sprint {
  id: number;
  created_at: string;
  title: string;
  start_date: string;
  end_date: string;
  project_id: number;
}

export function useProject(idTeam: string) {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<Record<number, Sprint[]>>({}); // Sprints par projet ID
  const [isProjectLoading, setIsProjectLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // **1. Récupérer tous les projets et leurs sprints associés**
  const fetchProjects = async (teamId: string) => {
    setIsProjectLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from("projects")
        .select("*, project_sprints(*)") // Récupération des projets et leurs sprints associés
        .eq("team_id", teamId);

      if (error) throw error;

      setProjects(projectsData || []);

      // Structurer les sprints dans un objet par projet_id
      const sprintMap: Record<number, Sprint[]> = {};
      projectsData?.forEach((project: any) => {
        sprintMap[project.id] = project.project_sprints || [];
      });
      setSprints(sprintMap);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProjectLoading(false);
    }
  };

  // **2. Récupérer un projet en particulier et ses sprints**
  const fetchProjectById = async (projectId: string) => {
    setIsProjectLoading(true);
    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("*, project_sprints(*)") // Récupération du projet et de ses sprints
        .eq("id", projectId)
        .single();

      if (error) throw error;

      // Mettre à jour les projets et sprints
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? projectData : project
        )
      );

      // Mettre à jour les sprints uniquement pour le projet concerné
      setSprints((prev: any) => {
        const updated = { ...prev };
        updated[projectId] = projectData.project_sprints || [];
        return updated;
      });
      // Return the project data like { project, sprints }
      return projectData;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProjectLoading(false);
    }
  };

  // **3. Ajouter un projet**
  const addProject = async (project: Partial<any>) => {
    try {
      const { data, error } = await supabase.from("projects").insert([project]);
      if (error) throw error;
      fetchProjects(idTeam); // Met à jour la liste des projets
    } catch (err: any) {
      setError(err.message);
    }
  };

  // **4. Supprimer un projet**
  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      if (error) throw error;

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      setSprints((prev: any) => {
        const updated = { ...prev };
        delete updated[projectId];
        return updated;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // **5. Ajouter un sprint à un projet**
  const addSprint = async (projectId: string, sprint: Partial<Sprint>) => {
    try {
      const dataToSend = {
        title: sprint.title,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        project_id: sprint.project_id,
      };
      const { data, error } = await supabase
        .from("project_sprints")
        .insert([{ ...dataToSend, project_id: projectId }]);

      if (error) throw error;
      fetchProjectById(projectId); // Met à jour les sprints du projet
    } catch (err: any) {
      setError(err.message);
    }
  };

  // **6. Supprimer un sprint d'un projet**
  const deleteSprint = async (sprintId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from("project_sprints")
        .delete()
        .eq("id", sprintId);
      if (error) throw error;

      setSprints((prev: any) => {
        const updated = { ...prev };
        updated[projectId] = prev[projectId].filter(
          (sprint: Sprint) => sprint.id !== Number(sprintId)
        );
        return updated;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // **7. Mettre à jour un sprint d'un projet**
  const updateSprint = async (sprintId: string, sprint: Partial<Sprint>) => {
    try {
      const { data, error } = await supabase
        .from("project_sprints")
        .update(sprint)
        .eq("id", sprintId);
      if (error) throw error;

      setSprints((prev: any) => {
        const updated = { ...prev };
        if (sprint.project_id !== undefined) {
          updated[sprint.project_id] = prev[sprint.project_id].map(
            (sprint: Sprint) => (sprint.id === Number(sprintId) ? data : sprint)
          );
        }
        return updated;
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    projects,
    sprints,
    isProjectLoading,
    error,
    fetchProjects,
    fetchProjectById,
    addProject,
    deleteProject,
    addSprint,
    deleteSprint,
    updateSprint,
  };
}
