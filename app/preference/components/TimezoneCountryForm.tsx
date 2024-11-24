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
import { getUtcCountry, updateUtcCountry } from "@/hooks/useUser";
import { countryNameRecord, utcTimezones } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Schema de validation pour le formulaire
const formSchema = z.object({
  timezone: z.string().min(1, { message: "Timezone is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

export const TimezoneCountryForm = () => {
  const { savedUtc, savedCountry } = getUtcCountry();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: savedUtc || "",
      country: savedCountry || "",
    },
  });

  const onSubmit = async (values: any) => {
    updateUtcCountry(values.timezone, values.country);
    toast({
      title: "Updating your timezone and country",
      description: "Your timezone and country have been saved.",
    });
  };

  return (
    <div className="flex flex-col px-6 py-4 rounded-lg border border-border w-full h-full">
      <h2 className="font-bold text-lg">Your Location</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 mt-4 w-full"
        >
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
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
              <FormItem>
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
                    <PopoverContent className="w-full">
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
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
};
