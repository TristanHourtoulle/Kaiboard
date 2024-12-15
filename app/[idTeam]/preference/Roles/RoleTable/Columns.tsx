import { RoleBadge } from "@/components/Teams/Role";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";

export type RoleType = {
  id: string;
  title: string;
  color: string;
};

export const columns = (
  deleteTeamRole: (ids: string[]) => void
): ColumnDef<RoleType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "preview",
    header: "Preview",
    cell: ({ row }) => {
      const { title, color } = row.original;
      return <RoleBadge title={title} color={color} />;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteTeamRole([id])} // Appel de la fonction deleteTeamRole
        >
          Delete
        </Button>
      );
    },
  },
];
