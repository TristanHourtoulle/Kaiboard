"use client";

import { RoleBadge } from "@/components/Teams/Role";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";

export type UserType = {
  id: string;
  Fullname: string;
  roles: { id: number; title: string; color?: string }[]; // Liste des rôles attribués
  email: string;
};

export const columns = (
  addRole: (userId: string, roleId: number) => void,
  removeRole: (userId: string, roleId: number) => void,
  availableRoles: { id: number; title: string }[]
): ColumnDef<UserType>[] => [
  {
    accessorKey: "Fullname",
    header: "Fullname",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "displayRoles",
    header: "Roles",
    cell: ({ row }) => {
      const { roles, id } = row.original; // Récupère les rôles et l'ID du membre
      return (
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-2">
              <RoleBadge
                title={role.title}
                color={role.color || "#FFFFFF"}
                ctaDelete={removeRole}
                team_member_id={id}
                team_role_id={role.id}
              />
              {/* <button
                onClick={() => removeRole(id, role.id)} // Supprime le rôle sélectionné
                className="text-red-500 hover:text-red-700"
              >
                ✖
              </button> */}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "roles",
    header: "Add Role",
    cell: ({ row }) => {
      const { id, roles } = row.original;

      return (
        <div className="flex flex-wrap gap-2 items-center">
          {/* Ajouter un rôle */}
          <Select onValueChange={(roleId) => addRole(id, parseInt(roleId))}>
            <SelectTrigger>
              <SelectValue placeholder="Add role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles
                .filter((role) => !roles.some((r) => r.id === role.id)) // Exclure les rôles déjà attribués
                .map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      );
    },
  },
];
