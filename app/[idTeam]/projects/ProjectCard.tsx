"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateFromString } from "@/lib/utils";
import Link from "next/link";

export type ProjectCardProps = {
  project: any;
  team_id: string;
  deleteProject: (id: string) => void;
};

export const ProjectCard = (props: ProjectCardProps) => {
  const { id, title, description, created_at } = props.project;
  const { team_id, deleteProject } = props;
  return (
    <Card className="flex flex-col bg-background w-full max-w-sm">
      <CardHeader className="w-full">
        <div className="flex flex-col items-start gap-0">
          <CardTitle className="text-lg pb-0 mb-0">
            <span className="text-xs font-regular text-muted-foreground">
              {formatDateFromString(created_at)}
            </span>
            <br></br>
            {title}
          </CardTitle>
          <CardDescription className="text-md truncate max-w-full">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="flex justify-between w-full">
        <Button
          onClick={async () => {
            try {
              await deleteProject(id);
            } catch (error) {
              console.error("Error deleting project:", error);
            }
          }}
          variant="destructive"
        >
          Delete
        </Button>

        <Link
          href={`/${team_id}/projects/${id}`}
          className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          Open
        </Link>
      </CardFooter>
    </Card>
  );
};
