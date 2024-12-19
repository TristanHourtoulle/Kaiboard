"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  color: z.string().min(7, {
    message: "Color is required in Hexa format. For example: '#FFFFFF'",
  }),
});

export type CreateRoleProps = {
  team_id: string;
  user_id: string;
  addTeamRole: (role: any) => void;
};

export const CreateRole = (props: CreateRoleProps) => {
  const { team_id, user_id, addTeamRole } = props;
  const [isAddingRole, setIsAddingRole] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAddRole = async (data: any) => {
    try {
      setIsAddingRole(true);

      const roleData = {
        team_id: team_id,
        title: data.title,
        color: data.color,
      };

      // Add role to the team
      await addTeamRole(roleData);

      // Reset the form
      form.reset();
      toast({
        title: "Success",
        description: "Role added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add role",
      });
    } finally {
      setIsAddingRole(false);
      // Fetch team again to update the roles
      // getTeamById(team_id, user_id).then((team: any) => {
      //   setTeam(team[0]);
      // });
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      color: "",
    },
  });

  return (
    <div className="w-full">
      {/*
        Form to add a new role with title and color
      */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleAddRole)}
          className="w-full flex items-end justify-between gap-3"
        >
          {/* Title Input */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }: { field: any }) => (
              <FormItem className="w-full">
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Frontend Developer"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Input */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }: { field: any }) => (
              <FormItem className="w-full">
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="#FFFFFF" className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            disabled={isAddingRole}
            className="inline-flex px-6"
            type="submit"
          >
            Add
          </Button>
        </form>
      </Form>
    </div>
  );
};
