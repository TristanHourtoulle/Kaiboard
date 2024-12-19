"use client";

import { RoleBadge } from "@/components/Teams/Role";
import { SprintBadge } from "@/components/Teams/SprintBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { IterationCcw, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export type TaskCardProps = {
  project: any;
  task: any;
  roles: any[];
  project_status: any[];
  sprints: any[];
  updateTask: (id_task: string, data: any) => void;
};

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

export const TaskCard = (props: TaskCardProps) => {
  const { project, task, roles, project_status, sprints, updateTask } = props;
  const { profilesList, getListProfiles } = useProfile();
  const [taskRoles, setTaskRoles] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      content: task.content,
      status: task.status.id.toString(),
      sprint: task.sprint.id.toString(),
      profiles: task.profiles.map((profile: any) => profile.profile_id),
      roles: task.roles.map((role: any) => role.role_id),
    },
  });

  const fetchTaskRoles = async () => {
    if (task.roles && task.roles.length > 0) {
      // Extraire les role_id depuis task.roles
      const roleIds = task.roles.map((role: any) => role.role_id);

      // Filtrer les rôles correspondants
      const taskRoles = roles.filter((role: any) => roleIds.includes(role.id));

      setTaskRoles(taskRoles);
    } else {
    }
  };

  const onSubmit = async (data: any) => {
    setIsAdding(true);
    console.log(data);
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
    await updateTask(task.id, dataToSend);
    setIsDialogOpen(false);
    setIsAdding(false);
  };

  useEffect(() => {
    if (task.profiles.length > 0) {
      const profileIds = task.profiles.map(
        (profile: any) => profile.profile_id
      );
      getListProfiles(profileIds);
    }
  }, [task.profiles]);

  useEffect(() => {
    if (roles && task.roles) {
      fetchTaskRoles();
    }
  }, [roles, task.roles]);

  console.log("Tasks", task);
  console.log("ProfilesList", profilesList);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <div
          key={task.id}
          className="cursour-pointer hover:scale-105 transition-all flex flex-col gap-3 w-full bg-sidebar border border-border rounded-sm p-2"
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            {/* Name + Content */}
            <div className="flex flex-col items-start gap-1 truncate">
              <h5 className="text-sm font-medium">{task.title}</h5>
              <p className="text-xs text-gray-400">{task.content}</p>
            </div>

            {/* Assigned profiles */}
            <div className="flex -space-x-6">
              {task.profiles.length > 0 &&
                profilesList.map((profile: any) => (
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="rounded-full">
                      {profile.firstname[0]}
                      {profile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-1 items-start">
            {/* Roles */}
            <div className="flex flex-wrap items-center gap-1">
              {taskRoles.map((role) => (
                <RoleBadge
                  key={role.id}
                  title={role.title}
                  color={role.color}
                />
              ))}
            </div>
            <div>
              <SprintBadge
                title={task.sprint.title}
                color={"#A7A7A7"}
                icon={<IterationCcw className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="w-[80%]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>
            Here you can see, update and delete the task
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
                          value: role.id.toString(), // Utiliser une chaîne pour correspondre aux IDs
                          color: role.color,
                        }))}
                        onValueChange={(value) =>
                          field.onChange(
                            value.map((id: string) => ({ id: Number(id) })) // Convertir les IDs en nombres
                          )
                        }
                        defaultValue={task.roles.map((role: any) =>
                          role.role_id.toString()
                        )} // S'assurer que les IDs correspondent
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
                          {project_status &&
                            project_status.length > 0 &&
                            project_status.map((status: any) => (
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
                          {sprints.map((sprint: any) => (
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
                        options={profilesList.map((profile) => ({
                          label: `${profile.name} ${profile.firstname}`,
                          value: profile.id, // Utiliser directement l'UUID
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
              <Button className="mr-auto" variant={"destructive"}>
                Delete
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-3"
              >
                <span hidden={!isAdding}>
                  <LoaderCircle className="animate-spin w-6 h-6" />
                </span>
                Confirm
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
