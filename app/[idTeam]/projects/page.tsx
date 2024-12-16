"use client";

import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import { RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CreateProject } from "./CreateProject";

export default function Projects() {
  const params = useParams();
  const [idTeam, setIdTeam] = useState<string>(params.idTeam as string);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const {
    projects,
    isProjectLoading,
    error,
    fetchProjects,
    addProject,
    deleteProject,
  } = useProject(idTeam);

  const refreshProjects = async () => {
    setIsFetching(true);
    await fetchProjects(idTeam);
    setIsFetching(false);
  };

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
            {/* Utilise l'icon <RefreshCcw /> comme symbole dans le bouton refresh, quand isFetching est true alors fait que ce comp soit en spinner */}
            <RefreshCcw
              className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          <CreateProject
            team_id={idTeam}
            refreshFunction={refreshProjects}
            addFunction={addProject}
          />
        </div>
      </div>
    </div>
  );
}
