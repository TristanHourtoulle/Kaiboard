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
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import {
  AudioWaveform,
  Calendar,
  ChevronDown,
  ClipboardList,
  Command,
  GalleryVerticalEnd,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "../mode-toggle";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

const Links = [
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
];

const Teams = [
  {
    name: "Personal Workspace",
    logo: GalleryVerticalEnd,
    plan: "Hobby",
  },
  {
    name: "Edukai",
    logo: AudioWaveform,
    plan: "Startup",
  },
];

export function AppSidebar() {
  const { user, loading } = useUser();
  const router = useRouter();

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={Teams} />
      </SidebarHeader>
      <SidebarSeparator className="my-4" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plateform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Links.map(({ href, label, Icon }) => (
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

        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Projects
                <ChevronDown className="ml-auto -rotate-90 transition-transform transform group-data-[state=open]/collapsible:-rotate-[90]" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>Project 1</SidebarMenuButton>
                  </SidebarMenuItem>
                  {/* Create a project */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="#" className="hover-bg-opacity">
                        <PlusCircle />
                        Create a project
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
