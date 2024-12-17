"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const formSchema = z.object({
  title: z.string().min(3, "Name must be at least 3 characters"),
  // Description field is optional
  description: z.string().optional(),
});

export function TeamSwitcher({
  teams,
  createTeam,
  fetchUserTeams,
  user_id,
  setSelectedTeam,
}: {
  teams: any[];
  createTeam: (name: string, description: string, user_id: string) => void;
  fetchUserTeams: () => void;
  setSelectedTeam: (team: any) => void;
  user_id: string;
}) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = useState(teams[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog
  const params = useParams();
  const [idTeam, setIdTeam] = useState<string>(params.idTeam as string);

  const setNewActiveTeam = (teams: any[], idTeam: string) => {
    if (idTeam !== undefined && idTeam === "-1") {
      setActiveTeam(teams[0]);
      setSelectedTeam(teams[0]);
      return;
    }
    if (idTeam) {
      const teamFromPath = teams.find(
        (team) => team.team_id === parseInt(idTeam)
      );

      if (teamFromPath) {
        setActiveTeam(teamFromPath);
        setSelectedTeam(teamFromPath);
      } else {
        setActiveTeam(teams[0]);
        setSelectedTeam(teams[0]);
      }
    }
  };

  useEffect(() => {
    setNewActiveTeam(teams, idTeam);
  }, [idTeam, teams]);

  // Initialize the form using react-hook-form and zod
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: { title: string; description: string }) => {
    try {
      // Call the createTeam function with the form data
      createTeam(data.title, data.description, user_id);
      fetchUserTeams();
      setIsDialogOpen(false); // Close the dialog
      form.reset(); // Reset the form
    } catch (error) {
      console.error(error); // Log any errors
    }
  };

  useEffect(() => {
    setSelectedTeam(activeTeam);
  }, [activeTeam]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {/* <GalleryVerticalEnd className="size-4" /> */}
                <Image
                  src={"/logo/Logo - Kaiboard - Transparent.svg"}
                  alt="Kaiboard Logo"
                  width={30}
                  height={30}
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeTeam.name}
                </span>
                <span className="truncate text-xs">Hobby</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                  setNewActiveTeam(teams, team.team_id.toString());
                  if (team.team_id !== -1) {
                    router.push(`/${team.team_id}`);
                  } else {
                    router.push("/");
                  }
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <GalleryVerticalEnd className="size-4 shrink-0" />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={(e) => {
                e.preventDefault(); // Prevent DropdownMenu default behavior
                setIsDialogOpen(true); // Open the dialog
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add team
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Dialog outside DropdownMenu to prevent auto-closing */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full">
            <DialogHeader>
              <DialogTitle>Create a new team</DialogTitle>
              <DialogDescription>
                Enter the name and description of your new team.
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
                  name="title" // Corrected name to match the schema
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type your team name here"
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
                <DialogFooter className="w-full flex items-center justify-between mt-4">
                  <DialogClose asChild className="w-full">
                    <Button
                      variant="secondary"
                      onClick={() => setIsDialogOpen(false)}
                      className="max-w-[30%] mr-auto"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" className="max-w-[30%]">
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
