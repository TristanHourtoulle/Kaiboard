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
import { useToast } from "@/hooks/use-toast";
import { useTeam } from "@/hooks/useTeam";
import { useTeamMemberRoles } from "@/hooks/useTeamMemberRoles";
import { useTeamRole } from "@/hooks/useTeamRole";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { UserType, columns } from "./UserTable/Columns";
import { DataTable } from "./UserTable/UserTable";

const formSchema = z.object({
  mail: z.string().email("Invalid email address"),
});

export type TeamMembersProps = {
  team_id: string;
  user_id: string;
};

export const TeamMembers = (props: TeamMembersProps) => {
  const { team_id, user_id } = props;
  const { toast } = useToast();
  const [team, setTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const { getTeamMembers, addTeamMemberByEmail } = useTeam();
  const { getTeamById } = useTeam();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [teamMembersData, setTeamMembersData] = useState<UserType[]>([]);
  const { roles, fetchTeamRoles } = useTeamRole(team_id);
  const {
    teamMemberRoles,
    addTeamMemberRole,
    deleteTeamMemberRole,
    fetchTeamMemberRoles,
  } = useTeamMemberRoles(team_id);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mail: "",
    },
  });

  const fetchTeamMembers = async () => {
    try {
      // Étape 1 : Récupère les membres
      const members = await getTeamMembers(team_id); // Table team_members
      console.log("Membres :", members);

      // Étape 2 : Récupère les relations membres-rôles
      const { data: teamMemberRoles, error: roleRelationError } = await supabase
        .from("team_member_roles")
        .select("*")
        .in(
          "team_member_id",
          members.map((m: any) => m.id)
        );

      if (roleRelationError) throw roleRelationError;
      console.log("Relations membres-rôles :", teamMemberRoles);

      // Étape 3 : Récupère les rôles
      const { data: roles, error: rolesError } = await supabase
        .from("team_roles")
        .select("id, title, color") // Récupère la couleur en plus du titre et de l'id
        .eq("team_id", team_id);

      if (rolesError) throw rolesError;
      console.log("Rôles :", roles);

      // Étape 4 : Associe les rôles aux membres avec la couleur
      const membersWithRoles = members.map((member: any) => ({
        id: member.id,
        Fullname: `${member.profiles.firstname} ${member.profiles.name}`,
        email: member.profiles.email,
        roles: teamMemberRoles
          .filter((rel) => rel.team_member_id === member.id)
          .map((rel) => {
            const role = roles.find((r) => r.id === rel.team_role_id);
            return {
              id: rel.team_role_id,
              title: role?.title || "Unknown",
              color: role?.color || "#ccc", // Utilise une couleur par défaut si non définie
            };
          }),
      }));

      console.log("Membres avec rôles :", membersWithRoles);
      setTeamMembersData(membersWithRoles);
    } catch (error: any) {
      console.error("Error fetching team members:", error.message);
    }
  };

  // Ajouter un rôle à un utilisateur
  const addRole = async (member_id: string, roleId: number) => {
    try {
      await addTeamMemberRole(Number(member_id), roleId);
      fetchTeamMembers(); // Rafraîchir les données
      toast({ title: "Success", description: "Role added successfully" });
      return;
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
      return;
    }
  };

  // Supprimer un rôle d'un utilisateur
  const removeRole = async (userId: string, roleId: number) => {
    try {
      await deleteTeamMemberRole(userId, roleId);
      fetchTeamMembers(); // Rafraîchir les données
      toast({ title: "Success", description: "Role removed successfully" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
    }
  };

  useEffect(() => {
    if (team_id) {
      getTeamById(team_id, user_id).then((team: any) => {
        setTeam(team[0]);
        fetchTeamMembers();
      });
    }
  }, [team_id]);

  const onSubmit = async (data: any) => {
    try {
      await addTeamMemberByEmail(team_id, data.mail, "member");
      await fetchTeamMembers();
      form.reset();
      toast({
        title: "Success",
        description: "Team member added",
      });
    } catch (error: any) {
      console.error("Error adding team member:", error.message);
      toast({
        title: "Error",
        description: error.message,
      });
    }
  };

  if (!team_id || !team || !teamMembers) return <></>;

  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      <div className="w-full flex items-center justify-between">
        <h2 className="font-bold text-lg">Team Members</h2>
        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronDown
            className={`transition-all ${
              isCollapsed ? "rotate-0" : "rotate-180"
            }`}
          />
        </Button>
      </div>
      <div
        className={`flex flex-col gap-2 items-center justify-center mt-4 ${
          isCollapsed ? "hidden" : ""
        }`}
      >
        <DataTable
          columns={columns(addRole, removeRole, roles)}
          data={teamMembersData}
        />
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex items-end justify-between mt-auto w-full gap-3 ${
            isCollapsed ? "hidden" : ""
          }`}
        >
          <FormField
            control={form.control}
            name="mail"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Mail</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@mail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormMessage />
          <Button type="submit" className="w-md">
            Add
          </Button>
        </form>
      </Form>
    </div>
  );
};
