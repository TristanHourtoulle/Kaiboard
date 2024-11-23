"use client";

// Create a variable for all possibles UTC timezones in Earth with their respective offsets
import { utcTimezones } from "@/lib/types";

import { useCreateMeeting } from "@/hooks/useMeeting";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

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
};

export const CreateMeeting = ({ user }: CreateMeetingProps) => {
  const [date, setDate] = useState<Date | null>(null);
  const { createMeeting, loading, error } = useCreateMeeting();

  const onSubmit = async (data: any) => {
    try {
      // Vérifiez que data.date est une instance de Date ou une chaîne formatée
      if (!(data.date instanceof Date)) {
        throw new Error("Invalid date format");
      }

      // Combiner date et time
      const dateTimeString = `${data.date.toISOString().split("T")[0]}T${
        data.time
      }:00`; // Ajoutez ":00" pour les secondes
      const dateTime = new Date(dateTimeString);

      if (isNaN(dateTime.getTime())) {
        throw new Error("Invalid date-time combination");
      }

      const meetingData = {
        title: data.title,
        description: data.description,
        date_time: dateTime.toISOString(), // Format ISO pour Supabase
        timezone: data.timezone,
        participants: [], // Ajoutez des participants si nécessaire
      };

      const createdMeeting = await createMeeting(user.id, meetingData);

      if (createdMeeting) {
        form.reset();
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
      date: null,
      timezone: "",
      time: "",
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="py-2 max-w-sm ml-auto">Create a meeting</Button>
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
                      <Select onValueChange={field.onChange}>
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
            <DialogFooter className="mt-4 mb-0">
              <DialogClose asChild>
                <Button variant="outline" className="mr-auto">
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
