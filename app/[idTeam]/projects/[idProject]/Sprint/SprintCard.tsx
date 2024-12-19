import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, getDaysLeft } from "@/lib/utils";

export type SprintCardProps = {
  sprint: any;
  deleteFunction: (id_sprint: string, id_project: string) => void;
  udpateFunction: (id_sprint: string, data: any) => void;
};

export const SprintCard = (props: SprintCardProps) => {
  const { sprint, deleteFunction, udpateFunction } = props;

  return (
    <Card className="flex flex-col bg-background w-full max-w-sm">
      <CardHeader className="w-full">
        <p className="text-muted-foreground text-sm">
          Days left:{" " + getDaysLeft(sprint.start_date, sprint.end_date)}
        </p>
        <CardTitle className="text-lg pb-0 mb-0">{sprint.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-1 text-muted-foreground">
        <p>From: {formatDateTime(sprint.start_date).date}</p>
        <p>To: {formatDateTime(sprint.end_date).date}</p>
      </CardContent>

      <CardFooter>
        <Button
          variant={"destructive"}
          onClick={() => deleteFunction(sprint.id, sprint.project_id)}
        >
          Delete
        </Button>
        <Button variant={"outline"} className="ml-auto">
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};
