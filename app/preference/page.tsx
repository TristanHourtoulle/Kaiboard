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
import { getUtcCountry, updateUtcCountry } from "@/hooks/useUser";
import { countryNameRecord, utcTimezones } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Create zod schema for the form
const formSchema = z.object({
  timezone: z.string().min(1, { message: "Timezone is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

export default function Preference() {
  const { savedUtc, savedCountry } = getUtcCountry();
  console.log(savedUtc, savedCountry);
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: savedUtc || "",
      country: savedCountry || "",
    },
  });

  const onSubmit = async (values: any) => {
    // Save the timezone and country in a cookie
    updateUtcCountry(values.timezone, values.country);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
      <h1 className="text-2xl font-semibold">Preference</h1>
      {/* Timezone */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-3 py-4"
        >
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full max-w-sm">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Negative UTC</SelectLabel>
                        {Object.entries(utcTimezones)
                          .filter(([key, value]) => value.offset < 0)
                          .map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Positive UTC</SelectLabel>
                        {Object.entries(utcTimezones)
                          .filter(([key, value]) => value.offset >= 0)
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
              <FormItem className="flex flex-col space-y-3">
                {" "}
                {/* Ajout de classes pour une direction verticale */}
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full max-w-sm flex items-center justify-between"
                      >
                        <span>
                          {field.value
                            ? countryNameRecord[
                                field.value as keyof typeof countryNameRecord
                              ] || field.value
                            : "Select a country"}
                        </span>
                        <ChevronsUpDown className="ml-2 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-lg p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search framework..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {Object.entries(countryNameRecord).map(
                              ([code, country]) => (
                                <CommandItem
                                  key={code} // Utilisez `code` comme clé ici
                                  value={country} // Affichez le nom du pays
                                  onSelect={(currentValue) => {
                                    field.onChange(code); // Stockez le code du pays, pas le nom
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
          <Button className="max-w-sm" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}
