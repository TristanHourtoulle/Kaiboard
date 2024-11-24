"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username must contain only letters and numbers.",
    }),
  name: z.string().min(1, { message: "Name is required." }),
  firstname: z.string().min(1, { message: "Firstname is required." }),
});

export const PersonalInformations = () => {
  const { getProfile, updateProfile } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const { user, loading: userLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await getProfile(userId);
      setProfile(profile);
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
    }
  };

  useEffect(() => {
    if (!userLoading && user?.id && !userId) {
      fetchProfile(user.id);
      setUserId(user.id);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
  }, [profile]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || "",
      name: profile?.name || "",
      firstname: profile?.firstname || "",
    },
  });

  const onSubmit = async (data: any) => {
    console.log(data);
    if (profile && userId) {
      try {
        await updateProfile(userId, data);
        console.log("Profile updated successfully.");

        const updatedProfile = {
          ...profile,
          ...data,
        };
        setProfile(updatedProfile);
        toast({
          title: "Updating profile",
          description: "Profile updated successfully.",
        });
      } catch (error: any) {
        console.error("Error updating profile:", error.message);
      }
    }
  };

  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      <h2 className="font-bold text-lg">Personal Informations</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex items-center justify-between gap-2 flex-wrap"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="w-lg">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="guest#1234" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-lg">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormDescription>This is your last name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem className="w-lg">
                <FormLabel>Firstname</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormDescription>This is your first name.</FormDescription>
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
