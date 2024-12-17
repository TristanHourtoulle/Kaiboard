"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z
    .string()
    .min(3, "Content must be at least 3 characters")
    .optional(),
  status: z.string().min(1, "Status must be at least 1 characters").optional(),
  sprint: z
    .object({
      id: z.number(),
    })
    .optional(),
  profiles: z.array(z.string().uuid()).optional(), // Tableau d'UUIDs
  roles: z
    .array(
      z.object({
        id: z.number(),
      })
    )
    .optional(),
});

export type CreateTaskProps = {
  project: any;
  project_status: {
    id: number;
    title: string;
    description: string;
    order: number;
  }[];
  roles: any[];
  profiles: any[];
  sprints: any[];
  refreshFunction: () => void;
  createFunction: (id_project: string, data: any) => void;
};

export const CreateTask = (props: CreateTaskProps) => {
  const { refreshFunction, createFunction, project, roles, profiles, sprints } =
    props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "",
      sprint: null,
      profiles: [],
      roles: [],
    },
  });

  const onSubmit = async (data: any) => {
    try {
      setIsAdding(true);
      // Assure une copie sécurisée des profils
      const profilesCopy = data.profiles ? [...data.profiles] : [];
      const profileIds = profilesCopy.map(
        (profile: any) => profile?.id || profile
      );

      const rolesCopy = data.roles ? [...data.roles] : [];
      const roleIds = rolesCopy.map((role: any) => role?.id || role);

      const dataToSend = {
        title: data.title,
        content: data.content,
        status: data.status,
        sprint_id: data.sprint?.id || null,
        profiles: profileIds, // IDs extraits
        roles: roleIds, // IDs extraits
        team_id: project.team_id,
      };

      // Appel API
      await createFunction(project.id, dataToSend);

      setIsDialogOpen(false); // Fermer le dialog après soumission
      refreshFunction();
      setIsAdding(false);
    } catch (error) {
      console.error("Error in onSubmit: ", error);
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="py-2 max-w-sm ml-auto"
          onClick={() => setIsDialogOpen(true)}
        >
          Create a task
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>
            Create your task here. Click on confirm to save.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-6"
          >
            {/* Colonne Gauche */}
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Type your title here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type your content here"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={roles.map((role) => ({
                          label: role.title,
                          value: role.id,
                          color: role.color,
                        }))}
                        onValueChange={(value) =>
                          field.onChange(
                            value.map((id: string) => ({ id: Number(id) }))
                          )
                        }
                        defaultValue={field.value.map((role: any) => role.id)}
                        placeholder="Select role(s)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Colonne Droite */}
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {props.project_status.map((status) => (
                            <SelectItem
                              key={status.id}
                              value={status.id.toString()}
                            >
                              {status.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sprint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sprint</FormLabel>
                    <FormControl>
                      <Select
                        value={
                          (
                            field.value as { id: number } | null
                          )?.id?.toString() || ""
                        }
                        onValueChange={(value) =>
                          field.onChange({ id: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sprint" />
                        </SelectTrigger>
                        <SelectContent>
                          {props.sprints.map((sprint) => (
                            <SelectItem
                              key={sprint.id}
                              value={sprint.id.toString()}
                            >
                              {sprint.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee(s)</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={profiles.map((profile) => ({
                          label: `${profile.profiles.name} ${profile.profiles.firstname}`,
                          value: profile.profiles.id, // Utiliser directement l'UUID
                          color: "#FFFFFF",
                        }))}
                        onValueChange={(value) => {
                          field.onChange(value); // Envoyer directement un tableau d'UUIDs
                        }}
                        defaultValue={field.value || []} // Définit une valeur par défaut vide
                        placeholder="Select assignee(s)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Boutons */}
            <div className="col-span-2 flex justify-end gap-4 mt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isAdding}>
                Confirm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
