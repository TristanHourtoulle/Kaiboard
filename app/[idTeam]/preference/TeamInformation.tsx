"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/hooks/useTeam";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  title: z.string().min(3, "Name must be at least 3 characters"),
  // Description field is optional
  description: z.string().optional(),
});

export type TeamInformationProps = {
  team_id: string;
  loadTeam: (team: any) => void;
  user_id: string;
};

export const TeamInformation = (props: TeamInformationProps) => {
  const { toast } = useToast();
  const { team_id, loadTeam, user_id } = props;
  const [team, setTeam] = useState<any>(null);
  const { getTeamById, updateTeam } = useTeam();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (team_id) {
      getTeamById(team_id, user_id).then((team: any) => {
        setTeam(team[0]);
        form.setValue("title", team[0].teams.name);
        form.setValue("description", team[0].teams.description);
      });
    }
  }, [team_id]);

  const onSubmit = async (data: any) => {
    try {
      const updatedTeam = await updateTeam(team_id, {
        name: data.title,
        description: data.description,
      });
      setTeam(updatedTeam);
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      });
      console.error("Error updating team:", error.message);
    }
  };

  if (!team_id || !team) {
    return null;
  }

  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      <h2 className="font-bold text-lg">Team Informations</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 mt-4 w-full"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-lg">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Team's title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-lg">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Team's description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormMessage />
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
