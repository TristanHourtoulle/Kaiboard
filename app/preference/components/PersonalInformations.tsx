"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import du composant Avatar
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
import { avatarsData } from "./AvatarData";

// Schéma Zod avec ajout du champ avatar
const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .regex(/^[a-zA-Z0-9]+$/, {
      message: "Username must contain only letters and numbers.",
    }),
  name: z.string().min(1, { message: "Name is required." }),
  firstname: z.string().min(1, { message: "Firstname is required." }),
  avatar_url: z.string().min(1, { message: "Avatar is required." }), // Champ pour l'avatar
});

export const PersonalInformations = () => {
  const { getProfile, updateProfile } = useProfile();
  const [profile, setProfile] = useState<any>(null);
  const { user, loading: userLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const [avatars, setAvatars] = useState<any[]>(avatarsData);

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
      avatar_url: profile?.avatar || avatars[0], // Valeur par défaut pour l'avatar
    },
  });

  const onSubmit = async (data: any) => {
    if (profile && userId) {
      try {
        await updateProfile(userId, data);

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

          {/* Section pour choisir un avatar */}
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Avatar</FormLabel>
                <div className="flex items-center gap-4 flex-wrap rounded-md p-4 border border-border">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.name}
                      onClick={() => form.setValue("avatar_url", avatar.href)} // Mettre à jour la valeur sélectionnée
                      className={`cursor-pointer rounded-full ${
                        field.value === avatar.href ? "ring-2 ring-primary" : ""
                      }`} // Ajouter une bordure si sélectionné
                    >
                      <Avatar className="w-16 h-16 hover:scale-110 transition-transform">
                        <AvatarImage src={avatar.href} alt={avatar.name} />
                        <AvatarFallback>
                          {/* Afficher un fallback si l'image ne charge pas */}
                          {avatar.name}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
                <FormDescription>Select your avatar.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bouton de soumission */}
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
