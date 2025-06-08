"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { normalizeTimezone } from "@/lib/timezone-utils";

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
    name: string | null;
    email: string | null;
  };
  participants: Array<{
    id: string;
    status: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  }>;
  team: {
    id: string;
    name: string;
  };
}

export function MeetingsClient() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch meetings
  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const { meetings } = await response.json();
        setMeetings(meetings);
      } else {
        console.error('Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'MAYBE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateTime: string, timezone: string) => {
    try {
      const normalizedTimezone = normalizeTimezone(timezone);
      return new Date(dateTime).toLocaleString('en-US', {
        timeZone: normalizedTimezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date for timezone:', timezone, error);
      // Fallback to simple date formatting without timezone
      return new Date(dateTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const isPastMeeting = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const upcomingMeetings = meetings.filter(m => !isPastMeeting(m.endTime));
  const pastMeetings = meetings.filter(m => isPastMeeting(m.endTime));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meetings</h1>
            <p className="text-muted-foreground">Loading your meetings...</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Meetings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your meetings and view participant status
          </p>
        </div>
        <Button 
          onClick={() => router.push('/meetings/create')}
          className="w-full sm:w-auto bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer min-h-[44px]"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{upcomingMeetings.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-green-600">{pastMeetings.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{meetings.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Upcoming Meetings
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {upcomingMeetings.map((meeting) => (
              <Card key={meeting.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg">{meeting.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {meeting.description && (
                          <span className="block mb-1">{meeting.description}</span>
                        )}
                        <span className="text-xs sm:text-sm font-medium block">
                          {formatDateTime(meeting.startTime, meeting.timezone)} - {formatDateTime(meeting.endTime, meeting.timezone)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="self-start text-xs px-2 py-1">{meeting.location || 'Online'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">Created by {meeting.creator.name || meeting.creator.email}</span>
                  </div>
                  
                  {meeting.participants.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Participants ({meeting.participants.length})</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {meeting.participants.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-1 sm:gap-2">
                            <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                              {participant.user.image && (
                                <AvatarImage 
                                  src={participant.user.image} 
                                  alt={participant.user.name || participant.user.email || 'User'} 
                                />
                              )}
                              <AvatarFallback className="text-xs">
                                {participant.user.name?.charAt(0) || participant.user.email?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[150px]">
                                {participant.user.name || participant.user.email || 'Unknown'}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-1 py-0 ${getStatusColor(participant.status)}`}
                              >
                                {participant.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {meeting.agenda && (
                    <div className="space-y-1 sm:space-y-2">
                      <p className="text-xs sm:text-sm font-medium">Agenda</p>
                      <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
                        {meeting.agenda}
                      </p>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {meeting.meetingLink && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => window.open(meeting.meetingLink!, '_blank')}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Join Meeting
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Past Meetings
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="opacity-75 hover:opacity-100 hover:shadow-md transition-all">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg">{meeting.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {meeting.description && (
                          <span className="block mb-1">{meeting.description}</span>
                        )}
                        <span className="text-xs sm:text-sm font-medium block">
                          {formatDateTime(meeting.startTime, meeting.timezone)} - {formatDateTime(meeting.endTime, meeting.timezone)}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs px-2 py-1">Completed</Badge>
                      <Badge variant="secondary" className="text-xs px-2 py-1">{meeting.location || 'Online'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">Created by {meeting.creator.name || meeting.creator.email}</span>
                    <span className="text-xs">• {meeting.participants.length} participant(s)</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No meetings state */}
      {meetings.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold mb-2">No meetings yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md mx-auto">
            Create your first meeting to start collaborating with your distributed team.
          </p>
          <Button 
            onClick={() => router.push('/meetings/create')}
            className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Meeting
          </Button>
        </div>
      )}
    </div>
  );
} 