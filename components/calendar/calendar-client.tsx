"use client";

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Users, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  meetingLink: string | null;
  location: string | null;
  agenda: string | null;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  participants: Array<{
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE';
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  team: {
    id: string;
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  timezone: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateMeeting = () => {
    router.push('/meetings/create');
  };

  const startDate = startOfWeek(startOfMonth(currentDate));
  const endDate = endOfWeek(endOfMonth(currentDate));
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = parseISO(meeting.startTime);
      return isSameDay(meetingDate, date);
    });
  };

  const getSelectedDateMeetings = () => {
    if (!selectedDate) return [];
    return getMeetingsForDate(selectedDate);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCreateMeetingForDate = (date: Date) => {
    // Pass the selected date as a URL parameter
    const formattedDate = format(date, 'yyyy-MM-dd');
    router.push(`/meetings/create?date=${formattedDate}`);
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-500';
      case 'DECLINED': return 'bg-red-500';
      case 'MAYBE': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            Calendar
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your meetings and schedule across time zones
          </p>
        </div>
        <Button 
          onClick={handleCreateMeeting}
          className="w-full sm:w-auto bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 min-h-[44px]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Meeting
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border shadow-md">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="px-2 sm:px-3 text-xs sm:text-sm"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map(day => (
                  <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground border-r border-border last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const dayMeetings = getMeetingsForDate(day);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`
                        h-16 sm:h-20 lg:h-24 p-1 sm:p-2 border-r border-b border-border last:border-r-0 cursor-pointer transition-all duration-200 group relative
                        ${isCurrentMonth ? 'bg-background hover:bg-accent/50' : 'bg-muted/30 text-muted-foreground'}
                        ${isTodayDate ? 'bg-primary/5 border-primary/20' : ''}
                        ${isSelected ? 'bg-primary/10 border-primary/30' : ''}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs sm:text-sm font-medium ${isTodayDate ? 'text-primary font-semibold' : ''}`}>
                            {format(day, 'd')}
                          </span>
                          {isCurrentMonth && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 sm:h-5 sm:w-5 opacity-0 group-hover:opacity-100 hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateMeetingForDate(day);
                              }}
                            >
                              <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Meeting indicators */}
                        <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-hidden">
                          {dayMeetings.slice(0, 2).map(meeting => (
                            <div
                              key={meeting.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMeeting(meeting);
                              }}
                              className="text-xs p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors truncate cursor-pointer"
                              title={meeting.title}
                            >
                              <span className="hidden sm:inline">{format(parseISO(meeting.startTime), 'HH:mm')} </span>
                              {meeting.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayMeetings.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="bg-card border border-border shadow-md">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {getSelectedDateMeetings().length} meeting(s) scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                {getSelectedDateMeetings().length > 0 ? (
                  getSelectedDateMeetings().map(meeting => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className="p-2 sm:p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-1 sm:mb-2">
                        <h4 className="font-medium text-sm">{meeting.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {meeting.team.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(parseISO(meeting.startTime), 'HH:mm')} - {format(parseISO(meeting.endTime), 'HH:mm')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Users className="w-3 h-3" />
                        {meeting.participants.length} participant(s)
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 sm:py-4">
                    <p className="text-sm text-muted-foreground mb-2 sm:mb-3">No meetings scheduled</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateMeetingForDate(selectedDate)}
                      className="hover:bg-accent/50 transition-colors w-full sm:w-auto"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-card border border-border shadow-md">
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
              <CardTitle className="text-base sm:text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Meetings</span>
                <Badge variant="secondary" className="text-xs">{meetings.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Members</span>
                <Badge variant="secondary" className="text-xs">{users.length}</Badge>
              </div>
              <Separator />
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm font-medium">Upcoming This Week</p>
                {meetings
                  .filter(meeting => {
                    const meetingDate = parseISO(meeting.startTime);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return meetingDate >= weekStart && meetingDate <= weekEnd && meetingDate > new Date();
                  })
                  .slice(0, 3)
                  .map(meeting => (
                    <div key={meeting.id} className="text-xs text-muted-foreground truncate">
                      {format(parseISO(meeting.startTime), 'EEE, MMM d')} - {meeting.title}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Meeting Detail Modal */}
      {selectedMeeting && (
        <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
          <DialogContent className="max-w-2xl mx-4 sm:mx-auto bg-background border border-border shadow-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {selectedMeeting.title}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedMeeting.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    {format(parseISO(selectedMeeting.startTime), 'MMM d, yyyy HH:mm')} - {format(parseISO(selectedMeeting.endTime), 'HH:mm')}
                  </div>
                </div>
                
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-sm font-medium">Location</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                    {selectedMeeting.location || 'Online'}
                  </div>
                </div>
              </div>

              {selectedMeeting.meetingLink && (
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-sm font-medium">Meeting Link</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedMeeting.meetingLink!, '_blank')}
                      className="hover:bg-accent/50 transition-colors w-full sm:w-auto"
                    >
                      <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Join Meeting
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1 sm:space-y-2">
                <Label className="text-sm font-medium">Participants ({selectedMeeting.participants.length})</Label>
                <div className="space-y-1 sm:space-y-2 max-h-32 overflow-y-auto">
                  {selectedMeeting.participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded border border-border">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{participant.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{participant.user.email}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getMeetingStatusColor(participant.status)}`} />
                    </div>
                  ))}
                </div>
              </div>

              {selectedMeeting.agenda && (
                <div className="space-y-1 sm:space-y-2">
                  <Label className="text-sm font-medium">Agenda</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedMeeting.agenda}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
} 