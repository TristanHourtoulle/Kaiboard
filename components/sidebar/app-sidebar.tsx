"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useProfile } from "@/hooks/useProfile";
import { useProject } from "@/hooks/useProject";
import { useTeam } from "@/hooks/useTeam";
import { useUser } from "@/hooks/useUser";
import {
  Calendar,
  ChevronDown,
  ClipboardList,
  Cog,
  Command,
  FolderOpenDot,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ModeToggle } from "../mode-toggle";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

const PersonnalLinks = [
  {
    href: "/",
    label: "Dashboard",
    Icon: Command,
  },
  {
    href: "/meetings",
    label: "Meetings",
    Icon: Calendar,
  },
  {
    href: "/tasks",
    label: "Tasks",
    Icon: ClipboardList,
  },
  {
    href: "/projects",
    label: "Projects",
    Icon: FolderOpenDot,
  },
  {
    href: "/preference",
    label: "Settings",
    Icon: Cog,
  },
];

const Teams = [
  {
    team_id: -1,
    name: "Personal Workspace",
    plan: "Hobby",
  },
];

export function AppSidebar() {
  const { user, loading } = useUser();
  const { profile, getProfile } = useProfile();
  const { projects, fetchProjects } = useProject("-1");
  const router = useRouter();
  const { createTeam, getUserTeams } = useTeam();
  const [teams, setTeams] = useState<any[]>(Teams);
  const [selectedTeam, setSelectedTeam] = useState<any>(Teams[0]);
  const [links, setLinks] = useState(PersonnalLinks);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState<boolean>(false);

  function updateLinks() {
    if (selectedTeam && selectedTeam.team_id === -1) {
      // Espace personnel, met à jour les liens
      setLinks(PersonnalLinks);
    } else if (selectedTeam) {
      // Liens d'équipe avec l'ID de l'équipe
      const TeamLinks = PersonnalLinks.map((link) => ({
        ...link,
        href: `/${selectedTeam.team_id}/${link.href.replace("/", "")}`,
      }));
      setLinks(TeamLinks);
    }
  }

  // Function to fetch user teams at the launch but also when a teams is created or deleted
  function fetchUserTeams() {
    if (user && user.id) {
      getUserTeams(user.id).then((userTeams) => {
        // Map over userTeams to extract the `teams` object
        const formattedTeams = userTeams.map((team) => ({
          ...team.teams, // Extract the `teams` object properties
          team_id: team.team_id, // Optionally include the `team_id`
        }));

        // Merge the default Teams with the fetched teams
        setTeams([...Teams, ...formattedTeams]);
      });
    }
  }

  useEffect(() => {
    updateLinks();
  }, [selectedTeam]);

  // Fetch user teams at the launch
  useEffect(() => {
    if (user && user.id) {
      fetchUserTeams();
      getProfile(user.id);
    }
  }, [user]);

  // When profile is fetched, fetch projects
  useEffect(() => {
    if (selectedTeam && selectedTeam.team_id !== "-1") {
      fetchProjects(selectedTeam.team_id);
    }
  }, [selectedTeam]);

  // When projects are fetched, console.log them
  useEffect(() => {
    console.log("Projects", projects);
  }, [projects]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {user && user.id && (
          <TeamSwitcher
            teams={teams}
            createTeam={createTeam}
            fetchUserTeams={fetchUserTeams}
            setSelectedTeam={setSelectedTeam}
            user_id={user.id}
          />
        )}
      </SidebarHeader>
      <SidebarSeparator className="my-4" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plateform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map(({ href, label, Icon }) => {
                if (label === "Projects") {
                  return (
                    <SidebarMenuItem key="projects-dropdown">
                      <Collapsible
                        defaultOpen={false}
                        onOpenChange={setIsCollapsibleOpen}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full flex items-center">
                            <Icon />
                            <span>{label}</span>
                            <ChevronDown
                              className={`ml-auto transition-all ${
                                isCollapsibleOpen ? "rotate-40" : "-rotate-90"
                              }`}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="transition-all">
                          <SidebarMenuSub className="flex flex-col items-start gap-2">
                            {/* Lien vers tous les projets */}
                            <SidebarMenuSubItem>
                              <Link
                                href={`/${selectedTeam.team_id}/projects`}
                                className="cursor-pointer transition-all opacity-75 hover:opacity-100 font-light"
                              >
                                Tous les projets
                              </Link>
                            </SidebarMenuSubItem>
                            {/* Un lien pour chaque projet */}
                            {projects.map((project: any) => (
                              <SidebarMenuSubItem key={project.id}>
                                <Link
                                  href={`/${selectedTeam.team_id}/projects/${project.id}`}
                                  className="cursor-pointer transition-all opacity-75 hover:opacity-100 font-light"
                                >
                                  {project.title}
                                </Link>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                // Comportement par défaut pour les autres éléments
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton asChild>
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
