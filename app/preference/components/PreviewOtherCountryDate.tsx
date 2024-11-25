"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { countryNameRecord, utcTimezones } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form content => timezone & country
const formSchema = z.object({
  utc: z.string().min(1, { message: "Timezone is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

export const PreviewOtherCountryDate = () => {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const { profile, getProfile, updateProfile } = useProfile();
  const [open, setOpen] = useState(false);
  const [zonesSaved, setZonesSaved] = useState<any[]>([]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      utc: "",
      country: "",
    },
  });

  const onSubmit = async (values: any) => {
    const tempsJson = {
      utc: profile?.location.utc,
      country: profile?.location.country,
      savedZones: (profile?.location.savedZones || []).concat(values),
    };
    // In profile.location, we store the saved zones
    updateProfile(user?.id, {
      location: tempsJson,
    });
    setZonesSaved((prev) => [...prev, values]);
    form.reset();
    toast({
      title: "Add country",
      description: `The country ${
        countryNameRecord[values.country as keyof typeof countryNameRecord]
      } was added.`,
    });
  };

  useEffect(() => {
    if (profile) {
      setZonesSaved(profile.location.savedZones);
    }
  }, [profile]);

  useEffect(() => {
    if (!userLoading && user?.id) {
      getProfile(user.id);
    }
  }, [user, userLoading]);

  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      {/* Header */}
      <h2 className="font-bold text-lg">Preview Other Date</h2>
      <p className="text-sm opacity-75 mt-2">
        Choose which country you want to see in the meetings cards.
      </p>
      {/* List of already set */}
      <div className="mt-4 flex items-center gap-2">
        {zonesSaved.length >= 1 &&
          zonesSaved
            .filter((zone) => zone.utc) // Filtrer les zones sans `utc` vide ou inexistant
            .map((zone, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-semibold">
                  {
                    countryNameRecord[
                      zone.country as keyof typeof countryNameRecord
                    ]
                  }
                </span>
                <span className="text-sm opacity-75 flex items-center">
                  ({zone.utc.toUpperCase()})
                  <X
                    className="cursor-pointer transition-all hover:text-destructive hover:scale-105 ml-2"
                    onClick={() => {
                      try {
                        setZonesSaved((prev) =>
                          prev.filter((z) => z.utc !== zone.utc)
                        );
                        updateProfile(user?.id, {
                          location: {
                            ...profile?.location,
                            savedZones: zonesSaved.filter(
                              (z) => z.utc !== zone.utc
                            ),
                          },
                        });
                        toast({
                          title: "Remove country",
                          description: `The country ${
                            countryNameRecord[
                              zone.country as keyof typeof countryNameRecord
                            ]
                          } was removed.`,
                        });
                      } catch (error: any) {
                        console.error(error);
                        toast({
                          title: "Error",
                          description:
                            "An error occured while removing the country.",
                        });
                      }
                    }}
                  />
                  {index !== zonesSaved.length - 1 && <span> ,</span>}
                </span>
              </div>
            ))}

        {zonesSaved.filter((zone) => zone.utc).length === 0 && (
          <span className="text-sm opacity-50">
            No other country added yet.
          </span>
        )}
      </div>

      {/* Form to add new one */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 mt-4 w-full h-full"
        >
          <div className="flex items-end justify-between gap-3 w-full mt-auto">
            <FormField
              control={form.control}
              name="utc"
              render={({ field }: { field: any }) => (
                <FormItem className="flex-1">
                  {" "}
                  {/* Utilisez flex-1 pour prendre plus d'espace */}
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        {" "}
                        {/* Toujours en pleine largeur dans son conteneur */}
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-h-[300px]">
                        <SelectGroup>
                          <SelectLabel>Negative UTC</SelectLabel>
                          {Object.entries(utcTimezones)
                            .filter(([_, value]) => value.offset < 0)
                            .map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Positive UTC</SelectLabel>
                          {Object.entries(utcTimezones)
                            .filter(([_, value]) => value.offset >= 0)
                            .map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }: { field: any }) => (
                <FormItem className="flex-1">
                  {" "}
                  {/* Également flex-1 pour équilibrer */}
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-between"
                        >
                          <span>
                            {field.value
                              ? countryNameRecord[
                                  field.value as keyof typeof countryNameRecord
                                ]
                              : "Select a country"}
                          </span>
                          <ChevronsUpDown className="ml-2 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full max-h-[300px] overflow-hidden">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {Object.entries(countryNameRecord).map(
                                ([code, country]) => (
                                  <CommandItem
                                    key={code}
                                    onSelect={() => {
                                      field.onChange(code);
                                      setOpen(false);
                                    }}
                                  >
                                    {country}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        code === form.getValues("country")
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                )
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-[15%]">
              {" "}
              {/* Taille fixe pour le bouton */}
              Add
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
