"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useTeamMeeting } from "@/hooks/useTeamMeeting";
import { getUTC } from "@/hooks/useUser";
import { utcTimezones } from "@/lib/types";
import {
  cn,
  convertDateTimeToUtc,
  convertTimeToUtc,
  formatDateFromString,
  formatTimeWithoutSeconds,
} from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarClock, CalendarIcon, Clock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PreviewDateTime } from "./PreviewDateTime";

const formSchema = z.object({
  timezone: z.string().min(1, { message: "Timezone is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  date: z.date({ required_error: "Date is required." }),
  time: z.string().min(1, { message: "Time is required." }),
});

export type MeetingCardProps = {
  meeting: {
    id: string;
    created_at: string;
    date_time: string;
    title: string;
    description: string;
    team_id: string;
  };
  shedule: string[];
  onMeetingDeleted: () => void;
};

export const MeetingCard = (props: MeetingCardProps) => {
  const { id, created_at, date_time, title, description, team_id } =
    props.meeting;
  const { onMeetingDeleted } = props;

  const [meetingShedule, setMeetingShedule] = useState(props.shedule);
  const { updateTeamMeeting, deleteTeamMeeting } = useTeamMeeting();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: getUTC() || "",
      title: title || "",
      description: description || "",
      date: meetingShedule[0] || "",
      time: convertTimeToUtc(meetingShedule[1], getUTC()) || "",
    },
  });

  const convertTimezone = (timezone: string): string => {
    // Extrait le signe (+ ou -) et le décalage horaire
    const match = timezone.match(/utc([+-]\d+)/i);
    if (!match) {
      throw new Error("Invalid timezone format. Expected 'utc+X' or 'utc-X'.");
    }

    // Récupère le décalage horaire
    const offset = parseInt(match[1], 10);

    // Formatage pour correspondre à "+08:00" ou "-03:00"
    const hours = Math.abs(offset).toString().padStart(2, "0");
    const formattedTimezone = `${offset >= 0 ? "+" : "-"}${hours}:00`;

    return formattedTimezone;
  };

  const combineDateTime = (date: Date, time: string, timezone: string) => {
    const dateStr =
      date.getFullYear().toString().padStart(4, "0") +
      "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") +
      "-" +
      date.getDate().toString().padStart(2, "0");
    const timeStr = `${time}:00`;
    const timezoneStr = convertTimezone(timezone); // Convertit la timezone
    return `${dateStr}T${timeStr}${timezoneStr}`;
  };

  const onSubmit = async (values: any) => {
    try {
      const newDateTime = combineDateTime(
        values.date,
        values.time,
        values.timezone
      );

      // Appel à l'API Supabase pour mettre à jour la réunion
      const updatedMeeting = await updateTeamMeeting({
        ...values,
        date_time: newDateTime, // Envoi en UTC
        id: id,
      });

      if (updatedMeeting) {
        // Mettre à jour les champs du formulaire
        form.reset({
          timezone: updatedMeeting.timezone || values.timezone,
          title: updatedMeeting.title || values.title,
          description: updatedMeeting.description || values.description,
          date: values.date, // Extract the date part as a string
          time: values.time,
        });

        // Mettre à jour localement les données
        setMeetingShedule([
          updatedMeeting.date_time.split("T")[0], // Date
          updatedMeeting.date_time.split("T")[1].split("+")[0], // Heure HH:mm
          convertTimezone(values.timezone), // Fuseau horaire
        ]);

        props.meeting.title = updatedMeeting.title;
        props.meeting.description = updatedMeeting.description;
        props.meeting.date_time = updatedMeeting.date_time;
      }
    } catch (err) {
      console.error("Error updating meeting:", err);
    }
  };

  return (
    <Card className="flex flex-col bg-background w-full max-w-sm">
      <CardHeader className="w-full">
        <div className="flex flex-col items-start gap-0">
          <CardTitle className="text-lg pb-0 mb-0">{title}</CardTitle>
          <CardDescription className="text-md">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between w-full gap-8 text-md">
          <div className="flex items-center justify-center gap-2">
            <CalendarClock className="w-4 h-4 opacity-75" />
            <p>
              {convertDateTimeToUtc(formatDateFromString(date_time), getUTC())}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <p>
              {convertTimeToUtc(
                formatTimeWithoutSeconds(meetingShedule[1]),
                getUTC()
              )}
            </p>
            <Clock className="w-4 h-4 opacity-75" />
          </div>
        </div>
        <PreviewDateTime dateTime={date_time} />
      </CardContent>
      <CardFooter className="flex justify-between w-full">
        <Button
          onClick={async () => {
            await deleteTeamMeeting(id);
            onMeetingDeleted();
          }}
          variant="destructive"
        >
          Delete
        </Button>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default">Open</Button>
          </SheetTrigger>
          <SheetContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full h-full flex flex-col items-start justify-start gap-2"
              >
                <SheetHeader>
                  <SheetTitle>Meetings View</SheetTitle>
                  <SheetDescription>
                    Edit the meeting details and save the changes.
                  </SheetDescription>
                </SheetHeader>

                {/* Title Input */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type your title here"
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description Input */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your description here."
                          className="w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Input */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }: { field: any }) => (
                    <FormItem className="w-full">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-center justify-start gap-2 w-full">
                  {/* Time */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }: { field: any }) => (
                      <FormItem className="w-full">
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="text-center"
                            placeholder="Select a time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Timezone Select */}
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }: { field: any }) => (
                      <FormItem className="w-full">
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a timezone" />
                            </SelectTrigger>
                            <SelectContent className="w-full max-h-[300px]">
                              <SelectGroup>
                                <SelectLabel>Negative UTC</SelectLabel>
                                {Object.entries(utcTimezones)
                                  .filter(([_, value]) => value.offset < 0)
                                  .map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                              <SelectGroup>
                                <SelectLabel>Positive UTC</SelectLabel>
                                {Object.entries(utcTimezones)
                                  .filter(([_, value]) => value.offset >= 0)
                                  .map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      {value.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <SheetFooter className="w-full mt-auto">
                  <SheetClose asChild>
                    <Button
                      onClick={() => {
                        form.reset();
                      }}
                      className="w-full"
                      variant={"outline"}
                    >
                      Cancel
                    </Button>
                  </SheetClose>
                </SheetFooter>
                <SheetClose asChild>
                  <Button type="submit" className="w-full">
                    Save
                  </Button>
                </SheetClose>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  );
};
