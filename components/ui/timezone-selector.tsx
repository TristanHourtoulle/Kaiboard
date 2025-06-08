import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_TIMEZONES } from "@/lib/countries-timezones";

interface TimezoneSelectorProps {
  value: string;
  onValueChange: (timezone: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function TimezoneSelector({ 
  value, 
  onValueChange, 
  label = "Timezone",
  placeholder = "Select your timezone...",
  className 
}: TimezoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedTimezone = ALL_TIMEZONES.find((tz) => tz.timezone === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full h-12 justify-between text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {selectedTimezone ? (
              <span className="truncate">{selectedTimezone.displayName}</span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 border-2 border-border/20 shadow-xl bg-card/95 backdrop-blur-sm">
          <Command>
            <CommandInput placeholder="Search timezones..." />
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              <CommandList className="max-h-[200px] overflow-auto">
                {ALL_TIMEZONES.map((timezone) => (
                  <CommandItem
                    key={timezone.timezone}
                    value={`${timezone.displayName} ${timezone.timezone}`}
                    onSelect={() => {
                      onValueChange(timezone.timezone);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === timezone.timezone ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="text-sm">{timezone.displayName}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 