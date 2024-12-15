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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mail: "",
    },
  });

  const fetchTeamMembers = async (team_id: string) => {
    try {
      const members = await getTeamMembers(team_id);
      await setTeamMembers(members);
      // Set teamMembersData for the DataTable
      setTeamMembersData(
        members.map((member: any) => ({
          id: member.user_id,
          Fullname: `${member.profiles.firstname} ${member.profiles.name}`,
          role: member.role,
          email: member.profiles.email,
        }))
      );
    } catch (error: any) {
      console.error("Error fetching team members:", error.message);
    }
  };

  useEffect(() => {
    if (team_id) {
      getTeamById(team_id, user_id).then((team: any) => {
        setTeam(team[0]);
        fetchTeamMembers(team[0].team_id);
      });
    }
  }, [team_id]);

  const onSubmit = async (data: any) => {
    try {
      await addTeamMemberByEmail(team_id, data.mail, "member");
      await fetchTeamMembers(team_id);
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
        <DataTable columns={columns} data={teamMembersData} />
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
