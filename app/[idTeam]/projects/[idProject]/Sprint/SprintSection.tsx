"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateSprint } from "./CreateSprint";
import { SprintCard } from "./SprintCard";

export type SprintSectionProps = {
  project: any;
  sprints: any;
  refreshFunction: () => void;
  createFunction: (id_project: string, data: any) => void;
  deleteFunction: (id_sprint: string, id_project: string) => void;
  updateFunction: (id_sprint: string, data: any) => void;
};

export const SprintSection = (props: SprintSectionProps) => {
  const {
    project,
    sprints,
    refreshFunction,
    createFunction,
    deleteFunction,
    updateFunction,
  } = props;
  const [sprintsToShow, setSprintsToShow] = useState<any[]>([]);
  const [filter, setFilter] = useState<
    "all" | "current" | "upcoming" | "passed"
  >("current");

  if (!project) {
    return <div>Loading...</div>;
  }

  const handleSetSprintsToShow = (
    filter: "all" | "current" | "upcoming" | "passed"
  ) => {
    let sprints = project.project_sprints;
    if (filter === "current") {
      sprints = sprints.filter((sprint: any) => {
        const now = new Date();
        return (
          new Date(sprint.start_date) <= now && new Date(sprint.end_date) >= now
        );
      });
    } else if (filter === "upcoming") {
      sprints = sprints.filter(
        (sprint: any) => new Date(sprint.start_date) > new Date()
      );
    } else if (filter === "passed") {
      sprints = sprints.filter(
        (sprint: any) => new Date(sprint.end_date) < new Date()
      );
    }

    setSprintsToShow(sprints);
  };

  useEffect(() => {
    setSprintsToShow(sprints);
  }, [sprints]);

  return (
    <div className="flex flex-col gap-3 items-start w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h3>
          You have {sprints.length} {sprints.length > 1 ? "sprints" : "sprint"}
        </h3>
        <CreateSprint
          project_id={project.id}
          refreshFunction={refreshFunction}
          createFunction={createFunction}
        />
      </div>

      {/* Filter */}
      <div className="flex items-center justify-start gap-2">
        <Select
          value={filter}
          onValueChange={(value: "all" | "current" | "upcoming" | "passed") => {
            setFilter(value);
            handleSetSprintsToShow(value);
          }}
        >
          <SelectTrigger className="flex items-center justify-start gap-3">
            <Filter strokeWidth={1.5} size={24} className="mr-2" />
            <SelectValue className="mr-2" placeholder="Current sprints" />
          </SelectTrigger>

          <SelectContent className="">
            <SelectItem className="" value="all">
              All sprints
            </SelectItem>
            <SelectItem value="current">Current sprints</SelectItem>
            <SelectItem value="upcoming">Upcoming sprints</SelectItem>
            <SelectItem value="passed">Passed sprints</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Sprints Content */}
      <div className="flex items-center justify-start gap-3 w-full">
        {sprintsToShow.map((sprint: any) => (
          <SprintCard
            key={sprint.id}
            sprint={sprint}
            deleteFunction={deleteFunction}
            udpateFunction={updateFunction}
          />
        ))}
      </div>
    </div>
  );
};
