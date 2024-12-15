"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTeamRole } from "@/hooks/useTeamRole";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { CreateRole } from "./CreateRole";
import { columns } from "./RoleTable/Columns";
import { DataTable } from "./RoleTable/RoleTable";

export type RolesProps = {
  team_id: string;
  user_id: string;
};

export const Roles = (props: RolesProps) => {
  const { team_id, user_id } = props;
  const { roles, error, isTeamRoleLoading, addTeamRole, deleteTeamRole } =
    useTeamRole(team_id);
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Retour principal
  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-lg">Roles</h2>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronDown
            className={`transition-all ${
              isCollapsed ? "rotate-0" : "rotate-180"
            }`}
          />
        </Button>
      </div>

      <div
        className={`mt-4 w-full ${
          isCollapsed ? "hidden" : "flex flex-col items-start gap-4"
        }`}
      >
        <CreateRole
          team_id={team_id}
          user_id={user_id}
          addTeamRole={addTeamRole}
        />
        <DataTable
          columns={columns(deleteTeamRole)}
          data={roles}
          deleteTeamRoles={deleteTeamRole}
        />
      </div>
    </div>
  );
};
