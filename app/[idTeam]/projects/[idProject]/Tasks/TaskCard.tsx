"use client";

import { RoleBadge } from "@/components/Teams/Role";
import { SprintBadge } from "@/components/Teams/SprintBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { IterationCcw } from "lucide-react";
import { useEffect, useState } from "react";

export type TaskCardProps = {
  project: any;
  task: any;
  roles: any[];
};

export const TaskCard = (props: TaskCardProps) => {
  const { project, task, roles } = props;
  const { profilesList, getListProfiles } = useProfile();
  const [taskRoles, setTaskRoles] = useState<any[]>([]);

  const fetchTaskRoles = async () => {
    if (task.roles && task.roles.length > 0) {
      // Extraire les role_id depuis task.roles
      const roleIds = task.roles.map((role: any) => role.role_id);

      // Filtrer les rôles correspondants
      const taskRoles = roles.filter((role: any) => roleIds.includes(role.id));

      setTaskRoles(taskRoles);
    } else {
    }
  };

  useEffect(() => {
    if (task.profiles.length > 0) {
      const profileIds = task.profiles.map(
        (profile: any) => profile.profile_id
      );
      getListProfiles(profileIds);
    }
  }, [task.profiles]);

  useEffect(() => {
    if (roles && task.roles) {
      fetchTaskRoles();
    }
  }, [roles, task.roles]);

  return (
    <div
      key={task.id}
      className="cursour-pointer hover:scale-105 transition-all flex flex-col gap-3 w-full bg-sidebar border border-border rounded-sm p-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        {/* Name + Content */}
        <div className="flex flex-col items-start gap-1 truncate">
          <h5 className="text-sm font-medium">{task.title}</h5>
          <p className="text-xs text-gray-400">{task.content}</p>
        </div>

        {/* Assigned profiles */}
        <div className="flex -space-x-6">
          {task.profiles.length > 0 &&
            profilesList.map((profile: any) => (
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="rounded-full">
                  {profile.firstname[0]}
                  {profile.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-1 items-start">
        {/* Roles */}
        <div className="flex flex-wrap items-center gap-1">
          {taskRoles.map((role) => (
            <RoleBadge key={role.id} title={role.title} color={role.color} />
          ))}
        </div>
        <div>
          <SprintBadge
            title={task.sprint.title}
            color={"#A7A7A7"}
            icon={<IterationCcw className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};
