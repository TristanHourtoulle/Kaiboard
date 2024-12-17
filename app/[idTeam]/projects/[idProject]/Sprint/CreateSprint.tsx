"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sprint } from "@/hooks/useProject";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  start_date: z.date({ required_error: "Date is required." }),
  end_date: z.date({ required_error: "Date is required." }),
});

export type CreateSprintProps = {
  project_id: string;
  refreshFunction: () => void;
  createFunction: (id_project: string, data: any) => void;
};

export const CreateSprint = (props: CreateSprintProps) => {
  const { refreshFunction, createFunction, project_id } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
    },
  });

  const combineDateTime = (date: Date, time: string, timezone: string) => {
    const convertTimezone = (timezone: string): string => {
      // Extrait le signe (+ ou -) et le décalage horaire
      const match = timezone.match(/utc([+-]\d+)/i);
      if (!match) {
        throw new Error(
          "Invalid timezone format. Expected 'utc+X' or 'utc-X'."
        );
      }

      // Récupère le décalage horaire
      const offset = parseInt(match[1], 10);

      // Formatage pour correspondre à "+08:00" ou "-03:00"
      const hours = Math.abs(offset).toString().padStart(2, "0");
      const formattedTimezone = `${offset >= 0 ? "+" : "-"}${hours}:00`;

      return formattedTimezone;
    };

    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = time; // HH:MM:SS
    const timezoneStr = convertTimezone(timezone); // Convertit la timezone

    return `${dateStr} ${timeStr}${timezoneStr}`; // Retourne le bon format
  };

  const onSubmit = async (data: any) => {
    // prepare data to send to API
    const dataToSend: Sprint = {
      id: 0,
      title: data.title,
      created_at: new Date().toISOString(),
      start_date: combineDateTime(data.start_date, "00:00:00", "utc+0"), // Exemple : fuseau horaire de Malaisie
      end_date: combineDateTime(data.end_date, "00:00:00", "utc+0"),
      project_id: parseInt(project_id),
    };

    // Call API to create sprint
    await createFunction(project_id, dataToSend);
    setIsDialogOpen(false);
    refreshFunction();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="py-2 max-w-sm ml-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          Create a sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a sprint</DialogTitle>
          <DialogDescription>
            Create your sprint here. Click on confirm to save.
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
            {/* Start Date Input */}
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
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

            {/* End  Date Input */}
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
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
