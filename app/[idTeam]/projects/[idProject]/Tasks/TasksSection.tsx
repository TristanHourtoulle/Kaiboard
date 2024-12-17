import { Task } from "@/hooks/useProject";
import { useEffect, useState } from "react";
import { CreateTask } from "./CreateTask";

export type TasksSectionProps = {
  project: any;
  tasks: Task[];
  project_status: {
    id: number;
    title: string;
    description: string;
    order: number;
  }[];
  roles: any[];
  sprints: any[];
  profiles: any[];
  fetchTasks: (id_project: string) => void;
  createTask: (id_project: string, data: any) => void;
};

export const TasksSection = (props: TasksSectionProps) => {
  const {
    project,
    project_status,
    roles,
    sprints,
    profiles,
    tasks,
    fetchTasks,
    createTask,
  } = props;

  return (
    <div className="flex flex-col gap-3 items-start w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h3>
          You have {tasks.length} {tasks.length > 1 ? "tasks" : "task"}
        </h3>
        <CreateTask
          project={project}
          project_status={project_status}
          roles={roles}
          sprints={sprints}
          profiles={profiles}
          refreshFunction={() => fetchTasks(project.id)}
          createFunction={createTask}
        />
      </div>
    </div>
  );
};
