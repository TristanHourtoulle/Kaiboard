"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Task } from "@/hooks/useProject";
import { useEffect } from "react";
import { CreateTask } from "./CreateTask";
import { TaskCard } from "./TaskCard";

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
  updateTask: (id_task: string, data: any) => void;
  deleteTask: (id_task: string) => void;
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
    updateTask,
    deleteTask,
  } = props;

  useEffect(() => {
    if (project_status.length > 0) {
      project_status.sort((a, b) => a.order - b.order);
    }
  }, [project_status]);

  useEffect(() => {
    if (project_status.length > 0) {
      project_status.sort((a, b) => a.order - b.order);
    }
  }, []);

  return (
    <div className="flex flex-col gap-3 items-start w-full max-w-[calc(100vw-330px)] mx-auto">
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

      {/* Status Tables Section */}
      <ScrollArea className="w-full max-w-full flex-grow overflow-y-auto rounded-md">
        <div className="flex items-start justify-start gap-2 w-max overflow-visible">
          {project_status.map((status) => (
            <div
              key={status.id}
              className="flex-shrink-0 flex flex-col gap-2 bg-background border border-border rounded-md px-4 py-2 h-full w-[250px] sm:w-[300px]"
            >
              <div className="flex items-center justify-between w-full">
                <h4 className="font-semibold">{status.title}</h4>
                <p className="text-muted-foreground text-sm">
                  {tasks.filter((task) => task.status.id === status.id).length}{" "}
                  {tasks.filter((task) => task.status.id === status.id).length >
                  1
                    ? "items"
                    : "item"}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full overflow-visible h-[calc(100vh-335px)]">
                {tasks.length > 0 &&
                  tasks
                    .filter((task) => task.status.id === status.id)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        project={project}
                        task={task}
                        roles={roles}
                        project_status={project_status}
                        sprints={sprints}
                        updateTask={updateTask}
                        deleteTask={deleteTask}
                      />
                    ))}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
