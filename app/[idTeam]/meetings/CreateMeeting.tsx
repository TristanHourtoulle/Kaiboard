"use client";

// Create a variable for all possibles UTC timezones in Earth with their respective offsets
import { utcTimezones } from "@/lib/types";

import { useToast } from "@/hooks/use-toast";
import { useTeamMeeting } from "@/hooks/useTeamMeeting";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { getUTC } from "@/hooks/useUser";
import { cn, combineDateTime } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { PreviewDateTime } from "./PreviewDateTime";

// Validation schema for all form inputs
const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  date: z.date({ required_error: "Date is required." }),
  timezone: z.string().min(1, { message: "Timezone is required." }),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format." }),
});

export type CreateMeetingProps = {
  user: any;
  onMeetingCreated: () => void;
  teamId: string;
};

export const CreateMeeting = ({
  user,
  onMeetingCreated,
  teamId,
}: CreateMeetingProps) => {
  const [date, setDate] = useState<Date | null>(null);
  const { profile, getProfile } = useProfile();
  const { createTeamMeeting } = useTeamMeeting();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const combineDateAndTime = (
    date: Date | null,
    time: string,
    timezone: string
  ): string => {
    if (!date) return new Date().toISOString(); // Par défaut, la date actuelle

    // Extraire les composantes de la date locale
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Les mois sont indexés à partir de 0
    const day = date.getDate().toString().padStart(2, "0");

    // Formater la date
    const dateStr = `${year}-${month}-${day}`;

    // Ajoutez les heures et minutes définies par l'utilisateur
    const timeStr = time || "00:00"; // Défaut : "00:00" si le champ est vide

    // Combinez date, heure et fuseau horaire pour retourner une chaîne ISO correcte
    const result = `${dateStr}T${timeStr}:00${formatTimezone(timezone)}`;

    return result;
  };

  const formatTimezone = (utc: string): string => {
    if (!utc) return "+00:00";
    // Correspond au format "utc+8" ou "utc-3"
    const match = utc.match(/utc([+-])(\d+)/i);
    if (!match) {
      console.error(`Invalid timezone format: "${utc}"`);
      return "+00:00"; // Retour par défaut si le format est invalide
    }

    const [, sign, hours] = match;

    // Vérifiez que hours est défini et ajoutez un zéro devant si nécessaire
    const paddedHours = hours.padStart(2, "0");

    return `${sign}${paddedHours}:00`;
  };

  const onSubmit = async (data: any) => {
    try {
      // Vérifiez que data.date est une instance de Date ou une chaîne formatée
      if (!(data.date instanceof Date)) {
        throw new Error("Invalid date format");
      }

      const meetingData = {
        title: data.title,
        description: data.description,
        date_time: combineDateTime(data.date, data.time, data.timezone), // Format ISO pour Supabase
        team_id: teamId,
      };

      const createdMeeting = await createTeamMeeting(meetingData);

      if (createdMeeting) {
        form.reset();
        onMeetingCreated();
        setIsDialogOpen(false);
        toast({
          title: "Meeting created",
          description: "Your meeting has been created successfully.",
        });
      } else {
        console.error("Failed to create meeting.");
      }
    } catch (error: any) {
      console.error("Error while creating meeting:", error.message);
    }
  };

  // Initialize the form using react-hook-form and zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString(),
      timezone: getUTC() || "",
      time: new Date().toLocaleTimeString().slice(0, 5),
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      ...form.getValues(),
      timezone: profile.location.utc,
    });
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      if (user?.id) {
        await getProfile(user.id);
      }
    };
    fetchProfile(user?.id);
  }, [user]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="py-2 max-w-sm ml-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          Create a meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a meeting</DialogTitle>
          <DialogDescription>
            Create your meetings here. Click on confirm to save.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3 py-4"
          >
            {/* Title Input */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem>
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
                <FormItem>
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
                <FormItem>
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
            {/* Timezone and Time */}
            <div className="grid grid-cols-2 gap-4">
              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Negative UTC</SelectLabel>
                            {Object.entries(utcTimezones)
                              .filter(([key, value]) => value.offset < 0)
                              .map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Positive UTC</SelectLabel>
                            {Object.entries(utcTimezones)
                              .filter(([key, value]) => value.offset >= 0)
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
              {/* Time */}
              <FormField
                control={form.control}
                name="time"
                render={({ field }: { field: any }) => (
                  <FormItem>
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
            </div>
            <div className="w-full">
              <PreviewDateTime
                dateTime={
                  combineDateAndTime(
                    new Date(form.watch("date")),
                    form.watch("time"),
                    form.watch("timezone")
                  ) || new Date().toISOString()
                }
              />
            </div>

            <DialogFooter className="mt-4 mb-0">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="mr-auto"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Confirm</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
