"use client";

import { useState } from 'react';
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Link as LinkIcon, 
  FileText, 
  Sparkles, 
  Globe,
  CheckCircle,
  Video,
  Plus,
  X,
  Building,
  Monitor
} from "lucide-react";
import { COMMON_TIMEZONES, generateMeetingPreviews, MeetingTimePreview } from '@/lib/timezone-utils';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers?: { id: string; name: string; timezone: string }[];
  onCreateMeeting: (meetingData: MeetingFormData) => void;
}

export interface MeetingFormData {
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
}

export function CreateMeetingModal({ isOpen, onClose, teamMembers = [], onCreateMeeting }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    date: undefined,
    startTime: '',
    endTime: '',
    timezone: 'UTC',
    meetingLink: '',
    location: 'Online',
    agenda: '',
    participantIds: teamMembers.map(m => m.id),
  });

  const [showTimezonePreviews, setShowTimezonePreviews] = useState(false);

  // Generate timezone previews
  const timezonePreviewsData: MeetingTimePreview[] = formData.date && formData.startTime
    ? generateMeetingPreviews(
        new Date(`${format(formData.date, 'yyyy-MM-dd')}T${formData.startTime}`), 
        teamMembers
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateMeeting(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: undefined,
      startTime: '',
      endTime: '',
      timezone: 'UTC',
      meetingLink: '',
      location: 'Online',
      agenda: '',
      participantIds: teamMembers.map(m => m.id),
    });
  };

  const toggleParticipant = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(userId)
        ? prev.participantIds.filter(id => id !== userId)
        : [...prev.participantIds, userId]
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[90vw] max-h-[95vh] p-0 gap-0 overflow-hidden bg-card border shadow-2xl rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl">
              <Video className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Create New Meeting</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Schedule a meeting with your distributed team across different time zones.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content with Sidebar Layout */}
        <div className="flex h-full min-h-[600px]">
          {/* Sidebar Navigation */}
          <div className="w-80 bg-muted/20 border-r p-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                <FileText className="w-4 h-4" />
                <span>Basic Info</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50">
                <Clock className="w-4 h-4" />
                <span>Schedule</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50">
                <LinkIcon className="w-4 h-4" />
                <span>Details</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted/50">
                <Users className="w-4 h-4" />
                <span>Participants</span>
              </div>
            </div>
            
            {/* Preview Card */}
            <div className="mt-6 p-4 bg-card rounded-lg border shadow-sm">
              <h4 className="font-semibold mb-2 text-sm">Meeting Preview</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formData.date ? format(formData.date, "MMM dd, yyyy") : "No date"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{formData.startTime || "No time"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  <span>{formData.participantIds.length} participants</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-8">
              <div className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Meeting Information
                  </h3>
                
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Meeting Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Weekly Team Sync"
                        className="h-10"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-medium">
                        Location
                      </Label>
                      <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger className="h-10">
                          <div className="flex items-center gap-2">
                            {getLocationIcon(formData.location)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Online">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-blue-500" />
                              Online
                            </div>
                          </SelectItem>
                          <SelectItem value="Office">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-green-500" />
                              Office
                            </div>
                          </SelectItem>
                          <SelectItem value="Conference Room A">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4 text-purple-500" />
                              Conference Room A
                            </div>
                          </SelectItem>
                          <SelectItem value="Other">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-orange-500" />
                              Other
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Discuss project progress and upcoming milestones..."
                        className="min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Schedule
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Meeting Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full h-11 justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "EEEE, MMMM do, yyyy") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, date }));
                              if (date && formData.startTime) {
                                setShowTimezonePreviews(true);
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-sm font-medium">
                          Start Time *
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, startTime: e.target.value }));
                            if (formData.date && e.target.value) {
                              setShowTimezonePreviews(true);
                            }
                          }}
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-sm font-medium">
                          End Time *
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-sm font-medium">
                          Timezone *
                        </Label>
                        <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COMMON_TIMEZONES.map(tz => (
                              <SelectItem key={tz.timezone} value={tz.timezone}>
                                {tz.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timezone Previews */}
                {showTimezonePreviews && formData.date && formData.startTime && timezonePreviewsData.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold">Time Zone Preview</h3>
                        <Badge variant="secondary" className="ml-auto">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {timezonePreviewsData.map(preview => (
                          <Card key={preview.userId} className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="text-xs font-semibold bg-primary/10">
                                  {preview.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{preview.userName}</p>
                                <p className="text-sm text-primary font-mono">{preview.localTime}</p>
                                {(preview.isNextDay || preview.isPreviousDay) && (
                                  <Badge variant="outline" className="text-xs mt-1">
                                    {preview.isNextDay ? "Next day" : "Previous day"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Additional Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Additional Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink" className="text-sm font-medium">
                        Meeting Link
                      </Label>
                      <Input
                        id="meetingLink"
                        type="url"
                        value={formData.meetingLink}
                        onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://zoom.us/j/..."
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agenda" className="text-sm font-medium">
                        Agenda
                      </Label>
                      <Input
                        id="agenda"
                        value={formData.agenda}
                        onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                        placeholder="1. Progress update 2. Next steps..."
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Participants */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Participants</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {formData.participantIds.length} selected
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map(member => (
                      <Card 
                        key={member.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                          formData.participantIds.includes(member.id) 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-accent/50"
                        )}
                        onClick={() => toggleParticipant(member.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="font-semibold">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {formData.participantIds.includes(member.id) && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <CheckCircle className="w-3 h-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{member.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{member.timezone}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="mt-auto p-8 border-t bg-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formData.participantIds.length} participants will be invited
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Meeting
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}