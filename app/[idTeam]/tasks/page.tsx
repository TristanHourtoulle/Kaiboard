"use client";

import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/useProject";
import { RefreshCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
          <h1 className="text-2xl font-semibold">
            This is all the tasks from your team
          </h1>
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
        </div>
      </div>

      {/* Content */}
      <div className="">
        <p className="text-muted-foreground">Not implemented yet, stay tuned</p>
      </div>
    </div>
  );
}
