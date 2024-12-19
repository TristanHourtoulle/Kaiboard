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

export interface Task {
  id: number;
  created_at: string;
  title: string;
  content: string;
  status: {
    id: number;
    title: string;
    description: string;
    order: number;
  };
  sprint?: {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
  };
  profiles: [
    {
      id: number;
      name: string;
      firstname: string;
      email: string;
    }
  ];
  project_id: number;
  team_id: number;
}

export function useProject(idTeam: string) {
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<Record<number, Sprint[]>>({}); // Sprints par projet ID
  const [tasks, setTasks] = useState<Task[]>([]);
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

      console.log("Response from supabase", projectsData, error);

      if (error) throw error;

      setProjects(projectsData || []);

      // Structurer les sprints dans un objet par projet_id
      const sprintMap: Record<number, Sprint[]> = {};
      projectsData?.forEach((project: any) => {
        sprintMap[project.id] = project.project_sprints || [];
      });
      setSprints(sprintMap);
      return projectsData;
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

  const fetchProjectStatus = async (project_id: string) => {
    try {
      const parsedProjectId = parseInt(project_id, 10); // Conversion explicite

      const { data, error } = await supabase
        .from("project_status")
        .select("*")
        .eq("project_id", parsedProjectId)
        .order("order", { ascending: true }); // Tri par la colonne 'order' en ordre croissant

      if (error) throw error;

      return data;
    } catch (err: any) {
      console.error(err.message);
      setError(err.message); // Assurez-vous que setError est défini dans votre composant ou contexte
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const { data: tasks, error } = await supabase
        .from("project_tasks")
        .select(
          `*, 
          project_sprints(*), 
          project_task_users!project_task_users_task_id_fkey(*), 
          project_task_roles!project_task_roles_task_id_fkey(*),
          project_status(*)
          `
        )
        .eq("project_id", projectId);

      if (error) throw error;

      const formattedTasks: Task[] = tasks.map((task: any) => ({
        id: task.id,
        created_at: task.created_at,
        title: task.title,
        content: task.content,
        status: task.project_status,
        sprint: task.project_sprints,
        profiles: task.project_task_users, // Relation désambiguïsée
        roles: task.project_task_roles, // Relation désambiguïsée
        project_id: task.project_id,
        team_id: task.team_id,
      }));

      setTasks(formattedTasks);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 9. Créer une tâche avec relations vers d'autres tables
  const createTask = async (projectId: string, taskData: any) => {
    try {
      // Étape 1 : Préparation des données
      const { title, content, status, sprint_id, profiles, roles } = taskData;

      // Étape 2 : Insérer la tâche principale dans la table project_tasks
      const { data: task, error: taskError } = await supabase
        .from("project_tasks")
        .insert([
          {
            title,
            content,
            status_id: status, // Assurez-vous que 'status' contient un id correct
            sprint_id: sprint_id || null, // Optionnel
            project_id: projectId,
          },
        ])
        .select()
        .single();

      if (taskError) throw taskError;

      // Étape 3 : Insérer les relations avec les assignees (profiles)
      if (profiles && profiles.length > 0) {
        const profileRelations = profiles.map((profileId: string) => ({
          task_id: task.id,
          profile_id: profileId,
        }));

        const { error: profileError } = await supabase
          .from("project_task_users")
          .insert(profileRelations);

        if (profileError) throw profileError;
      }

      // Étape 4 : Insérer les relations avec les rôles
      if (roles && roles.length > 0) {
        const roleRelations = roles.map((roleId: number) => ({
          task_id: task.id,
          role_id: roleId,
        }));

        const { error: roleError } = await supabase
          .from("project_task_roles")
          .insert(roleRelations);

        if (roleError) throw roleError;
      }
    } catch (error: any) {
      console.error("Error creating task:", error.message);
      throw error;
    }
  };

  // Get all tasks from all projects from a team that are assigned to a specific profileId (uuid)
  const fetchTasksByProfileId = async (profileId: string) => {
    try {
      const { data: tasks, error } = await supabase
        .from("project_task_users")
        .select(
          `
          project_tasks!project_task_users_task_id_fkey(
            *,
            project_sprints(*),
            project_task_roles!project_task_roles_task_id_fkey(*),
            project_status(*),
            project_task_users!project_task_users_task_id_fkey(
              profiles(*)
            )
          )
          `
        )
        .eq("profile_id", profileId);

      if (error) throw error;

      // Formatter les tâches pour correspondre à l'interface Task
      const formattedTasks: Task[] = tasks.map((taskRelation: any) => {
        const task = taskRelation.project_tasks;
        const profiles = task.project_task_users.map(
          (relation: any) => relation.profiles
        ); // Extraire tous les profils liés à la tâche

        return {
          id: task.id,
          created_at: task.created_at,
          title: task.title,
          content: task.content,
          status: task.project_status,
          sprint: task.project_sprints,
          profiles: profiles, // Inclure tous les profils liés
          roles: task.project_task_roles,
          project_id: task.project_id,
          team_id: task.team_id,
        };
      });

      setTasks(formattedTasks);
      return formattedTasks; // Retourner les tâches formatées
    } catch (err: any) {
      console.error("Error fetching tasks by profileId:", err.message);
      setError(err.message);
      return []; // Retourner un tableau vide en cas d'erreur
    }
  };

  return {
    // Variables
    projects,
    sprints,
    tasks,
    isProjectLoading,
    error,
    // Projects
    fetchProjects,
    fetchProjectById,
    addProject,
    deleteProject,
    // Sprints
    addSprint,
    deleteSprint,
    updateSprint,
    // Tasks
    fetchTasksByProfileId,
    fetchTasks,
    createTask,
    // Status
    fetchProjectStatus,
  };
}
