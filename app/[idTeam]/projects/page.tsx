"use client";

import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import { RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateProject } from "./CreateProject";
import { ProjectCard } from "./ProjectCard";

export default function Projects() {
  const params = useParams();
  const idTeam = Array.isArray(params?.idTeam)
    ? params.idTeam[0]
    : params?.idTeam || ""; // Sécurisation de idTeam
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const {
    projects,
    isProjectLoading,
    error,
    fetchProjects,
    addProject,
    deleteProject,
  } = useProject(idTeam || "");

  const addProjectProcess = async (data: any) => {
    await addProject(data);
    await refreshProjects();
  };

  const refreshProjects = async () => {
    if (!idTeam) return; // Empêche l'appel si idTeam est vide
    setIsFetching(true);
    await fetchProjects(idTeam);
    setIsFetching(false);
  };

  useEffect(() => {
    refreshProjects();
  }, [idTeam]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex flex-col gap-1 items-start">
          <h1 className="text-2xl font-semibold">This is the projects page</h1>
          <p className="text-white text-opacity-75 text-md">
            Here, you can create some meetings and invite some collaborators.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            onClick={refreshProjects}
            disabled={isFetching}
            className="py-2 max-w-sm"
          >
            <RefreshCcw
              className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <CreateProject
            team_id={idTeam}
            refreshFunction={refreshProjects}
            addFunction={addProjectProcess}
          />
        </div>
      </div>

      {/* Project Cards */}
      <div className="flex flex-wrap gap-4 items-center justify-start w-full">
        {projects.length > 0 ? (
          projects.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={project}
              team_id={idTeam}
              deleteProject={deleteProject}
            />
          ))
        ) : (
          <p>No projects found</p>
        )}
      </div>
    </div>
  );
}
