import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTimeWithoutSeconds } from "@/lib/utils";
import { CalendarClock, Clock } from "lucide-react";

export type MeetingCardProps = {
  meeting: {
    id: string;
    created_at: string;
    date_time: string;
    title: string;
    description: string;
    participants: string[];
    user_id: string;
  };
  shedule: string[];
};

export const MeetingCard = (props: MeetingCardProps) => {
  const {
    id,
    created_at,
    date_time,
    title,
    description,
    participants,
    user_id,
  } = props.meeting;
  const [date, time, timezone] = props.shedule;

  return (
    <Card className="flex flex-col bg-background w-full max-w-[350px]">
      <CardHeader className="flex items-center justify-between w-full">
        <CardTitle className="text-lg pb-0 mb-0">{title}</CardTitle>
        <CardDescription className="text-md">{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-cenet justify-center gap-8">
          <div className="flex items-center justify-center gap-2">
            <CalendarClock className="w-6 h-6" />
            <p>{date}</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-6 h-6" />
            <p>{formatTimeWithoutSeconds(time)}</p>
          </div>
        </div>
        {/* <div className="flex items-center justify-center gap-4">
          <WholeWord className="w-4 h-4" />
          <p>{formatTimezone(timezone)}</p>
        </div> */}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Edit</Button>
        <Button variant="default">View</Button>
      </CardFooter>
    </Card>
  );
};
