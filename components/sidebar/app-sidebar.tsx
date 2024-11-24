"use client";

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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTeam } from "@/hooks/useTeam";
import { useUser } from "@/hooks/useUser";
import {
  Calendar,
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
    href: "/settings",
    label: "Settings",
    Icon: Cog,
  },
];

const Teams = [
  {
    id: -1,
    name: "Personal Workspace",
    plan: "Hobby",
  },
];

export function AppSidebar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { createTeam, getUserTeams } = useTeam();
  const [teams, setTeams] = useState<any[]>(Teams);
  const [selectedTeam, setSelectedTeam] = useState<any>(Teams[0]);

  function updateLinks() {
    if (!user) return;
    if (selectedTeam && selectedTeam.id === -1) {
      // We are in the personal workspace, so href will be the classic one, ex: /meetings
      PersonnalLinks.forEach((link) => {
        link.href = `/${link.href.replace("/", "")}`;
      });
      console.log("Personal workspace");
      router.push("/");
    } else if (selectedTeam) {
      // We are in a team, so href will be /team_id/meetings
      PersonnalLinks.forEach((link) => {
        link.href = `/${selectedTeam.team_id}/${link.href.replace("/", "")}`;
      });
      console.log("Selected team:", selectedTeam);
      router.push(`/${selectedTeam.team_id}`);
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
    }
  }, [user]);

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
              {PersonnalLinks.map(({ href, label, Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
