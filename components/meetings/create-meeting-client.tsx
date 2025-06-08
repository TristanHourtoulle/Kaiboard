"use client";

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Link as LinkIcon, 
  FileText, 
  Globe,
  CheckCircle,
  Video,
  Plus,
  Building,
  Monitor,
  ArrowLeft,
  Save,
  Check
} from "lucide-react";
import { generateMeetingPreviews, MeetingTimePreview, normalizeTimezone } from '@/lib/timezone-utils';
import { ALL_TIMEZONES } from '@/lib/countries-timezones';
import { TimezoneSelector } from '@/components/ui/timezone-selector';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
  members: { id: string; name: string; timezone: string; image?: string | null; role?: string | null }[];
}

interface CreateMeetingClientProps {
  teams: Team[];
  currentUserId: string;
  currentUserTimezone: string;
}

interface MeetingFormData {
  title: string;
  description: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingLink: string;
  location: string;
  agenda: string;
  participantIds: string[];
  emailParticipants: string[];
  teamId: string;
}

export function CreateMeetingClient({ teams, currentUserId, currentUserTimezone }: CreateMeetingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get date from URL parameters if provided
  const getInitialDate = (): Date | undefined => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        const parsedDate = parseISO(dateParam);
        if (isValid(parsedDate)) {
          return parsedDate;
        }
      } catch (error) {
        console.warn('Invalid date parameter:', dateParam);
      }
    }
    return undefined;
  };
  
  // Debug logging
  console.log('=== CREATE MEETING CLIENT DEBUG ===');
  console.log('Teams received:', teams.length);
  console.log('Teams:', teams);
  console.log('Current user ID:', currentUserId);
  console.log('Current user timezone:', currentUserTimezone);
  console.log('Date from URL:', searchParams.get('date'));
  
  const [formData, setFormData] = useState<MeetingFormData>(() => {
    // Default to personal meeting, or first team if available
    const initialTeamId = 'personal';  // Start with personal meeting as default
    const initialTeam = teams.find(team => team.id === initialTeamId);
    
    return {
    title: '',
    description: '',
    date: undefined, // Will be set by useEffect if date parameter exists
    startTime: '',
    endTime: '',
      timezone: currentUserTimezone, // Use the user's timezone directly from the database
    meetingLink: '',
    location: 'Online',
    agenda: '',
      participantIds: initialTeam?.members.map(m => m.id) || [],
    emailParticipants: [],
      teamId: initialTeamId,
    };
  });

  // Set date from URL parameters on mount
  useEffect(() => {
    const initialDate = getInitialDate();
    if (initialDate) {
      setFormData(prev => ({
        ...prev,
        date: initialDate
      }));
    }
  }, [searchParams]);

  const [newEmailParticipant, setNewEmailParticipant] = useState('');

  const [showTimezonePreviews, setShowTimezonePreviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current team and its members
  const selectedTeam = formData.teamId === 'personal' ? null : teams.find(team => team.id === formData.teamId);
  const teamMembers = selectedTeam?.members || [];

  // Generate timezone previews - only for selected participants
  const selectedTeamMembers = teamMembers.filter(member => 
    formData.participantIds.includes(member.id)
  );

  // Auto-select all team members when team changes
  const handleTeamChange = (teamId: string) => {
    const newTeam = teamId === 'personal' ? null : teams.find(team => team.id === teamId);
    setFormData(prev => ({
      ...prev,
      teamId,
      participantIds: newTeam?.members.map(m => m.id) || []
    }));
  };
  
  const timezonePreviewsData: MeetingTimePreview[] = formData.date && formData.startTime
    ? generateMeetingPreviews(
        new Date(`${format(formData.date, 'yyyy-MM-dd')}T${formData.startTime}`), 
        selectedTeamMembers,
        formData.timezone
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      toast.error("Please select date and time for the meeting");
      return;
    }

    // No need to validate teamId - personal meetings are allowed

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date.toISOString(),
          emailParticipants: formData.emailParticipants,
          teamId: formData.teamId === 'personal' ? null : formData.teamId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      toast.success("Meeting created successfully!");
      router.push('/meetings');
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error("Failed to create meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId]
    }));
  };

  const addEmailParticipant = () => {
    const email = newEmailParticipant.trim();
    if (email && email.includes('@') && !formData.emailParticipants.includes(email)) {
      setFormData(prev => ({
        ...prev,
        emailParticipants: [...prev.emailParticipants, email]
      }));
      setNewEmailParticipant('');
    }
  };

  const removeEmailParticipant = (email: string) => {
    setFormData(prev => ({
      ...prev,
      emailParticipants: prev.emailParticipants.filter(e => e !== email)
    }));
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'Online': return <Video className="w-4 h-4 text-blue-500" />;
      case 'Office': return <Building className="w-4 h-4 text-green-500" />;
      case 'Conference Room A': return <Monitor className="w-4 h-4 text-purple-500" />;
      default: return <MapPin className="w-4 h-4 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Modern Header with Glassmorphism */}
      <div className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1 sm:gap-2 hover:bg-muted/50 transition-colors shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="space-y-1 min-w-0">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                  Create New Meeting
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground hidden sm:block">
                  Schedule a meeting with your distributed team across different time zones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Button
                variant="outline"
                onClick={() => router.push('/meetings')}
                className="h-10 sm:h-11 px-3 sm:px-6 border-2 hover:bg-muted/50 transition-all duration-200 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 sm:h-11 px-4 sm:px-8 gap-1 sm:gap-2 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Creating...' : 'Create Meeting'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
          {/* Modern Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-32">
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card/95 to-muted/20 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
                <CardHeader className="relative pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                      <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Meeting Preview
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                        Live preview of your meeting
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4 sm:space-y-6 px-4 sm:px-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/20">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formData.date ? format(formData.date, "MMM dd, yyyy") : "No date"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/20">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formData.startTime || "No time"} - {formData.endTime || "No end time"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/20">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Participants</p>
                        <p className="font-semibold text-sm sm:text-base">
                          {selectedTeam ? formData.participantIds.length + formData.emailParticipants.length : 1 + formData.emailParticipants.length} participants
                          {!selectedTeam && <span className="text-xs text-muted-foreground ml-1">(personal)</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 backdrop-blur-sm border border-border/20">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                        {getLocationIcon(formData.location)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                        <p className="font-semibold text-sm sm:text-base truncate">{formData.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  {formData.title && (
                    <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                      <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent line-clamp-2">
                        {formData.title}
                      </h4>
                      {formData.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {formData.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick timezone preview */}
                  {formData.date && formData.startTime && timezonePreviewsData.length > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                      <h5 className="text-xs sm:text-sm font-semibold text-foreground/90 uppercase tracking-wide">Quick Preview</h5>
                      <div className="space-y-1 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                        {timezonePreviewsData.slice(0, 3).map(preview => (
                          <div key={preview.userId} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/10">
                            <span className="text-xs font-medium truncate">{preview.userName}</span>
                            <span className="text-xs font-mono text-primary">{preview.localTime}</span>
                          </div>
                        ))}
                        {timezonePreviewsData.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">+{timezonePreviewsData.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
              {/* Team Selection - Compact Design */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-muted/5 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Label and Icon */}
                    <div className="flex items-center gap-3 sm:min-w-0 sm:w-auto">
                      <div className="p-2 bg-chart-1/10 rounded-lg">
                        <Users className="w-4 h-4 text-chart-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                          Team *
                        </Label>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          Choose which team this meeting is for
                        </p>
                      </div>
                    </div>
                    
                    {/* Team Selection */}
                    <div className="flex-1 min-w-0">
                      <Select value={formData.teamId} onValueChange={handleTeamChange}>
                        <SelectTrigger className="h-10 text-sm border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/20 shadow-xl bg-card/95 backdrop-blur-sm">
                          <SelectItem key="personal" value="personal" className="text-sm py-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-primary" />
                              <span>Personal Meeting</span>
                              <Badge variant="outline" className="ml-auto text-xs">
                                Self reminder
                              </Badge>
                            </div>
                          </SelectItem>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id} className="text-sm py-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-chart-1" />
                                <span>{team.name}</span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                                         {/* Team Info */}
                     <div className="sm:w-auto">
                       <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border border-border/20">
                         <Users className="w-3 h-3" />
                         {selectedTeam ? (
                           <span className="font-medium">{teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}</span>
                         ) : (
                           <span className="font-medium text-primary">Personal</span>
                         )}
                       </div>
                     </div>
                  </div>
                  
                  {teams.length === 0 && (
                    <div className="mt-4 p-3 text-center text-muted-foreground bg-muted/20 rounded-lg border border-border/10">
                      <p className="text-sm">No teams available. You can still create personal meetings or join a team to create team meetings.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Information */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-muted/10 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative pb-4 sm:pb-6 border-b border-border/10 px-4 sm:px-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-lg">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Meeting Information
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 hidden sm:block">Basic details about your meeting</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6 sm:pt-8 space-y-6 sm:space-y-8 px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="title" className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                        Meeting Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Weekly Team Sync"
                        required
                        className="h-10 sm:h-12 text-sm sm:text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <Label htmlFor="location" className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                        Location
                      </Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/20 shadow-xl bg-card/95 backdrop-blur-sm">
                          <SelectItem key="Online" value="Online" className="text-sm sm:text-base py-2 sm:py-3">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500" />
                              Online
                            </div>
                          </SelectItem>
                          <SelectItem key="Office" value="Office" className="text-sm sm:text-base py-2 sm:py-3">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-green-500" />
                              Office
                            </div>
                          </SelectItem>
                          <SelectItem key="Custom" value="Custom" className="text-sm sm:text-base py-2 sm:py-3">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-purple-500" />
                              Custom
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the meeting purpose and objectives..."
                      rows={3}
                      className="text-sm sm:text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Date & Time Section - Compact Design */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-muted/5 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-2/10 rounded-lg">
                        <Clock className="w-4 h-4 text-chart-2" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Date & Time</h3>
                        <p className="text-xs text-muted-foreground">Schedule your meeting across time zones</p>
                      </div>
                    </div>

                    {/* Date and Time Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      {/* Date */}
                      <div className="lg:col-span-2">
                        <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                          Date *
                        </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                                "w-full h-11 justify-start text-left font-normal border-2 border-border/20 focus:border-primary/50 bg-background/50 hover:bg-background/70 transition-all duration-200",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                              <CalendarIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                              {formData.date ? format(formData.date, "EEEE, MMMM d, yyyy") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-2 border-border/20 shadow-xl bg-card/95 backdrop-blur-sm" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                              onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                      {/* Start Time */}
                      <div>
                        <Label htmlFor="startTime" className="text-sm font-medium text-foreground/90 mb-2 block">
                          Start Time *
                        </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                          className="h-11 text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 hover:bg-background/70 transition-all duration-200"
                      />
                    </div>

                      {/* End Time */}
                      <div>
                        <Label htmlFor="endTime" className="text-sm font-medium text-foreground/90 mb-2 block">
                          End Time *
                        </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                          className="h-11 text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 hover:bg-background/70 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Timezone */}
                    <div>
                      <Label className="text-sm font-medium text-foreground/90 mb-2 block">
                        Time Zone
                      </Label>
                      <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger className="h-11 text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 hover:bg-background/70 transition-all duration-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-border/20 shadow-xl bg-card/95 backdrop-blur-sm max-h-60">
                          {ALL_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.timezone} value={tz.timezone} className="text-sm py-2">
                              {tz.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants Section */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/98 to-muted/10 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-3/3 via-transparent to-chart-4/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative pb-4 sm:pb-6 border-b border-border/10 px-4 sm:px-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-xl shadow-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-chart-3" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        Participants
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 hidden sm:block">Select team members and add external participants</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-6 sm:pt-8 space-y-6 sm:space-y-8 px-4 sm:px-6">
                  {/* Team Members */}
                  {selectedTeam && teamMembers.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                        Team Members ({formData.participantIds.length} selected)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {teamMembers.map((member) => (
                          <div
                            key={member.id}
                            onClick={() => toggleParticipant(member.id)}
                            className={cn(
                              "p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                              formData.participantIds.includes(member.id)
                                ? "border-primary/50 bg-primary/5 shadow-sm"
                                : "border-border/20 hover:border-border/40 bg-background/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                                  {member.image ? (
                                    <AvatarImage src={member.image} alt={member.name} />
                                  ) : null}
                                  <AvatarFallback className="font-semibold text-sm">
                                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {formData.participantIds.includes(member.id) && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm sm:text-base truncate">{member.name}</p>
                                  {member.role && (
                                    <RoleBadge role={member.role} size="sm" showTitle={false} />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.timezone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                                      )}

                  {/* Personal Meeting Note */}
                  {!selectedTeam && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary">Personal Meeting</h4>
                          <p className="text-sm text-muted-foreground">
                            This is a personal meeting/reminder. You can still invite external participants via email below.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External Email Participants */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold text-foreground/90 uppercase tracking-wide">
                      External Participants
                    </Label>
                    
                    {/* Add Email Input */}
                    <div className="flex gap-2 sm:gap-3">
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={newEmailParticipant}
                        onChange={(e) => setNewEmailParticipant(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addEmailParticipant();
                          }
                        }}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-base border-2 border-border/20 focus:border-primary/50 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
                      />
                      <Button
                        type="button"
                        onClick={addEmailParticipant}
                        disabled={!newEmailParticipant.trim() || !newEmailParticipant.includes('@')}
                        className="px-4 sm:px-6 h-10 sm:h-12 gap-1 sm:gap-2 bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </Button>
                    </div>
                    
                    {/* Email Participants List */}
                    {formData.emailParticipants.length > 0 && (
                      <div className="space-y-2">
                        {formData.emailParticipants.map((email) => (
                          <div
                              key={email}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-accent/10 rounded-lg">
                                <LinkIcon className="w-4 h-4 text-accent-foreground" />
                              </div>
                              <span className="text-sm sm:text-base font-medium truncate">{email}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmailParticipant(email)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.emailParticipants.length === 0 && (
                      <p className="text-sm text-muted-foreground italic text-center py-4">
                        No external participants added yet
                      </p>
                    )}
                  </div>

                  {/* Total Count */}
                  <div className="pt-4 border-t border-border/20">
                    <p className="text-sm font-medium text-center">
                      Total Participants: {selectedTeam ? formData.participantIds.length + formData.emailParticipants.length : 1 + formData.emailParticipants.length}
                      {!selectedTeam && <span className="text-xs text-muted-foreground ml-1">(including you)</span>}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 