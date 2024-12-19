"use client";

import { Button } from "@/components/ui/button";
import { useTeamRole } from "@/hooks/useTeamRole";
import { RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TaskCard } from "./TaskCard";

export type TasksProps = {
  project: any;
  tasks: any[];
  team_id: string;
  refreshFunction: () => void;
};

export const Tasks = (props: TasksProps) => {
  const { project, tasks, team_id, refreshFunction } = props;
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const { roles } = useTeamRole(team_id);

  const localRefreshFunction = async () => {
    setIsFetching(true);
    await refreshFunction();
    // set timeout to prevent multiple clicks
    setTimeout(() => {
      setIsFetching(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-3 items-start rounded-md h-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        <Button
          onClick={localRefreshFunction}
          variant={"outline"}
          disabled={isFetching}
        >
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-start gap-3 flex-wrap w-full">
        {/* Tasks */}
        {tasks && tasks.length > 0 ? (
          tasks.slice(0, 2).map(
            (
              task: any // Limiter à 2 tâches
            ) => (
              <TaskCard
                key={task.id}
                task={task}
                roles={roles}
                team_id={team_id}
              />
            )
          )
        ) : (
          <p>No tasks available</p>
        )}
      </div>

      {/* Footer with CTA to see all tasks so redirect to '/[idTeam]/tasks'  */}
      <Link
        href={`/${team_id}/tasks`}
        className="border border-border px-4 py-2 hover:bg-gray-100 hover:bg-opacity-10 transition-all rounded-md ml-auto mr-auto mt-auto"
      >
        See all tasks
      </Link>
    </div>
  );
};
