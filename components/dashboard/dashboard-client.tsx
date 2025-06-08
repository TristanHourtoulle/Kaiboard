"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@prisma/client";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Users, 
  Globe, 
  Plus, 
  LogOut, 
  Clock,
  Video,
  TrendingUp,
  Activity,
  Zap
} from "lucide-react";

interface DashboardClientProps {
  session: Session;
  users: User[];
}

// Skeleton component for the dashboard loading state
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full min-h-screen pb-8" style={{
      background: `linear-gradient(135deg, 
        hsl(var(--background)) 0%, 
        hsl(var(--accent) / 0.05) 25%, 
        hsl(var(--background)) 50%, 
        hsl(var(--accent) / 0.03) 75%, 
        hsl(var(--background)) 100%)`
    }}>
      {/* Hero Section Skeleton */}
      <div className="w-full">
        <Card className="bg-card/70 backdrop-blur-md border border-border/50 shadow-2xl max-w-4xl mx-auto">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-5 w-48 mx-auto" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center flex-wrap">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Stats Dashboard Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-card border border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Section Skeleton */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <Card className="bg-card/70 backdrop-blur-md border border-border/50 shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DashboardClient({ session, users }: DashboardClientProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Simulate initial loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Short loading for better UX

    return () => clearTimeout(timer);
  }, []);

  const handleViewCalendar = () => {
    router.push('/meetings');
  };

  const handleCreateMeeting = () => {
    router.push('/meetings/create');
  };

  const teamMembers = users.map(user => ({
    id: user.id,
    name: user.name || 'Unknown User',
    timezone: 'UTC'
  }));

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-full min-h-screen pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8" style={{
      background: `linear-gradient(135deg, 
        hsl(var(--background)) 0%, 
        hsl(var(--accent) / 0.05) 25%, 
        hsl(var(--background)) 50%, 
        hsl(var(--accent) / 0.03) 75%, 
        hsl(var(--background)) 100%)`
    }}>
      {/* Hero Section */}
      <div className="w-full">
        <Card className="bg-card/70 backdrop-blur-md border border-border/50 shadow-2xl max-w-4xl mx-auto">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ring-2 sm:ring-4 ring-primary/20 ring-offset-2 sm:ring-offset-4 ring-offset-background">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                  <AvatarFallback className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-br from-primary to-chart-2 text-primary-foreground">
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-2 sm:border-4 border-background flex items-center justify-center">
                  <Activity className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-1 sm:mb-2 px-2">
              Welcome back, {session.user?.name}!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground px-2">
              {session.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center flex-wrap">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-primary via-chart-2 to-chart-3 text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 focus-ring group min-h-[44px]"
                onClick={handleCreateMeeting}
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Create Meeting
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto focus-ring hover:bg-accent/50 transition-all duration-300 min-h-[44px]"
                onClick={handleViewCalendar}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Meetings
              </Button>
              <Button 
                variant="ghost" 
                size="lg" 
                className="w-full sm:w-auto focus-ring hover:bg-destructive/10 hover:text-destructive transition-all duration-300 min-h-[44px]"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full max-w-7xl mx-auto">
        <Card className="bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">Team Members</CardTitle>
            <div className="p-1.5 sm:p-2 bg-chart-1/10 rounded-lg group-hover:bg-chart-1/20 transition-colors">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-chart-1" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{users.length}</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              Active members
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">Upcoming Meetings</CardTitle>
            <div className="p-1.5 sm:p-2 bg-chart-2/10 rounded-lg group-hover:bg-chart-2/20 transition-colors">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">0</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <Calendar className="w-3 h-3 mr-1 text-chart-2" />
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">Time Zones</CardTitle>
            <div className="p-1.5 sm:p-2 bg-chart-3/10 rounded-lg group-hover:bg-chart-3/20 transition-colors">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">1</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <Clock className="w-3 h-3 mr-1 text-chart-3" />
              Different zones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 px-4 sm:px-6">
            <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground">Productivity</CardTitle>
            <div className="p-1.5 sm:p-2 bg-chart-4/10 rounded-lg group-hover:bg-chart-4/20 transition-colors">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4" />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">98%</div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              Team efficiency
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Team Members Section */}
      {users.length > 0 && (
        <Card className="w-full max-w-7xl mx-auto bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                  </div>
                  Team Members
                </CardTitle>
                <CardDescription className="mt-1 sm:mt-2 text-sm">
                  Your active team members across different time zones
                </CardDescription>
              </div>
              <Badge variant="secondary" className="px-2 sm:px-3 py-1 self-start sm:self-center">
                {users.length} Members
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="group p-3 sm:p-4 rounded-xl border border-border hover:border-primary/30 bg-gradient-to-br from-card to-accent/5 hover:from-accent/10 hover:to-primary/5 transition-all duration-300 cursor-pointer min-h-[60px] flex items-center"
                >
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 ring-1 sm:ring-2 ring-primary/20 ring-offset-1 sm:ring-offset-2 ring-offset-background group-hover:ring-primary/40 transition-all duration-300">
                        {user.image && <AvatarImage src={user.image} alt={user.name || 'User'} />}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold text-xs sm:text-sm">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-1 sm:border-2 border-background"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                        {user.name || 'Unknown User'}
                      </p>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
                    >
                      UTC
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 