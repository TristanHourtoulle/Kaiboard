"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_COUNTRIES, ALL_TIMEZONES, type Country, type Timezone } from "@/lib/countries-timezones";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  timezone: string | null;
  country: string | null;
  role: string | null;
  image: string | null;
}

interface UserSettingsClientProps {
  user: User | null;
}

// Client-only time component to prevent hydration mismatches
function CurrentTime({ timezone }: { timezone: string }) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', { 
        timeZone: timezone === 'UTC' ? 'UTC' : undefined,
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }));
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [timezone]);

  if (!mounted) {
    return <span className="text-sm text-muted-foreground">--:-- --</span>;
  }

  return <span className="text-sm text-muted-foreground">Current time: {currentTime}</span>;
}

export function UserSettingsClient({ user }: UserSettingsClientProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    timezone: user?.timezone || "UTC",
    country: user?.country || "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openTimezone, setOpenTimezone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast("Settings updated successfully!", {
          description: "Your profile information has been saved.",
        });
      } else {
        toast("Failed to update settings", {
          description: "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast("An error occurred", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCountry = ALL_COUNTRIES.find((country) => country.code === formData.country);
  const selectedTimezone = ALL_TIMEZONES.find((tz) => tz.timezone === formData.timezone);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">User not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile Information
            </CardTitle>
            <CardDescription>
              Your basic profile information and role in the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {user.image && (
                  <AvatarImage src={user.image} alt={user.name || 'User'} />
                )}
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium">{user.name || 'Unknown User'}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <RoleBadge role={user.role} size="md" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Timezone Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Location & Timezone
            </CardTitle>
            <CardDescription>
              Set your location and timezone for accurate meeting scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="cursor-pointer">Display Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your display name"
                    className="cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="cursor-pointer">Country</Label>
                  <Popover open={openCountry} onOpenChange={setOpenCountry}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCountry}
                        className="w-full justify-between cursor-pointer"
                      >
                        {selectedCountry ? (
                          <div className="flex items-center gap-2">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.name}</span>
                          </div>
                        ) : (
                          "Select your country..."
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search countries..." />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList className="max-h-[200px] overflow-auto">
                            {ALL_COUNTRIES.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={`${country.name} ${country.code}`}
                                onSelect={() => {
                                  setFormData(prev => ({ ...prev, country: country.code }));
                                  setOpenCountry(false);
                                }}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.country === country.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <span className="mr-2">{country.flag}</span>
                                <span>{country.name}</span>
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="cursor-pointer">Timezone</Label>
                <Popover open={openTimezone} onOpenChange={setOpenTimezone}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openTimezone}
                      className="w-full justify-between cursor-pointer"
                    >
                      {selectedTimezone ? (
                        <span className="truncate">{selectedTimezone.displayName}</span>
                      ) : (
                        "Select your timezone..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
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
                                setFormData(prev => ({ ...prev, timezone: timezone.timezone }));
                                setOpenTimezone(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.timezone === timezone.timezone ? "opacity-100" : "opacity-0"
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
                
                <p>
                  <CurrentTime timezone={formData.timezone} />
                </p>
              </div>

              <Separator />

              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
              </svg>
              Preferences
            </CardTitle>
            <CardDescription>
              Configure your notification and display preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for meeting invites and updates
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Calendar Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync meetings with Google Calendar or Outlook
                  </p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 