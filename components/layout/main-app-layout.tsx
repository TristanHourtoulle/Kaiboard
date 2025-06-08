"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';

import Image from 'next/image';
import Link from 'next/link';
import { 
  Home, 
  Video, 
  Calendar, 
  Users, 
  Settings, 
  Clock, 
  LogOut, 
  Sparkles,
  ChevronUp,
  User,
  CreditCard,
  Shield,
  Database
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainAppLayoutProps {
  children: React.ReactNode;
  session: Session | null;
  userRole?: string | null;
}

const navigation = [
  {
    title: "Dashboard",
    url: "/",
    icon: <Home className="w-4 h-4" />,
    color: "text-chart-1",
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: <Video className="w-4 h-4" />,
    color: "text-chart-2",
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: <Calendar className="w-4 h-4" />,
    color: "text-chart-3",
  },
  {
    title: "Teams",
    url: "/teams",
    icon: <Users className="w-4 h-4" />,
    color: "text-chart-4",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings className="w-4 h-4" />,
    color: "text-chart-5",
  },
];

// Client-only time component to prevent hydration mismatches
function LocalTime() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    
    updateTime(); // Set initial time
    const interval = setInterval(updateTime, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <span className="text-xs text-muted-foreground font-mono">--:--</span>;
  }

  return <span className="text-xs text-muted-foreground font-mono">{currentTime}</span>;
}

// Navigation item component that can use useSidebar hook
function NavigationItem({ item, isActive }: { item: typeof navigation[0], isActive: boolean }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton 
            asChild 
            isActive={isActive}
            className={`
              hover:bg-accent/50 transition-all duration-300 rounded-xl group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:mx-auto
              ${isActive ? 'bg-gradient-to-r from-primary/10 to-accent/20 border border-primary/20 shadow-sm' : ''}
            `}
          >
            <Link href={item.url} className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-muted/50'} group-data-[collapsible=icon]:p-2`}>
                <span className={isActive ? 'text-primary' : item.color}>
                  {item.icon}
                </span>
              </div>
              <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'} group-data-[collapsible=icon]:hidden`}>
                {item.title}
              </span>
              {isActive && (
                <div className="ml-auto group-data-[collapsible=icon]:hidden">
                  <Sparkles className="w-3 h-3 text-primary/60" />
                </div>
              )}
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg px-3 py-2 text-sm animate-in slide-in-from-left-2 duration-200"
          sideOffset={8}
        >
          <div className="flex items-center gap-2">
            <span className={`${item.color} opacity-70`}>
              {item.icon}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{item.title}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <SidebarMenuButton 
      asChild 
      isActive={isActive}
      className={`
        hover:bg-accent/50 transition-all duration-300 rounded-xl group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:mx-auto
        ${isActive ? 'bg-gradient-to-r from-primary/10 to-accent/20 border border-primary/20 shadow-sm' : ''}
      `}
    >
      <Link href={item.url} className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-primary/10' : 'bg-muted/50'} group-data-[collapsible=icon]:p-2`}>
          <span className={isActive ? 'text-primary' : item.color}>
            {item.icon}
          </span>
        </div>
        <span className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'} group-data-[collapsible=icon]:hidden`}>
          {item.title}
        </span>
        {isActive && (
          <div className="ml-auto group-data-[collapsible=icon]:hidden">
            <Sparkles className="w-3 h-3 text-primary/60" />
          </div>
        )}
      </Link>
    </SidebarMenuButton>
  );
}

// Nav user component following official shadcn/ui pattern
function NavUser({ session }: { session: Session }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold">
                    {session.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{session.user?.name || 'User'}</span>
                <span className="truncate text-xs text-muted-foreground">{session.user?.email}</span>
              </div>
              <ChevronUp className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Logo component that can use useSidebar hook
function LogoSection({ session }: { session: Session }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton size="lg" asChild className="hover:bg-accent/30 transition-all duration-300">
            <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <div className="relative group-data-[collapsible=icon]:mx-auto">
                <Image 
                  src="/kaiboard-logo/Logo Kaiboard Transparent.svg" 
                  alt="Kaiboard Logo" 
                  width={32} 
                  height={32}
                  className="w-8 h-8 drop-shadow-sm"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-sm -z-10"></div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent text-base">Kaiboard</span>
                <span className="truncate text-xs text-muted-foreground font-medium">
                  Project Management
                </span>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-1 group-data-[collapsible=icon]:hidden">
                Beta
              </Badge>
            </Link>
          </SidebarMenuButton>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg px-3 py-2 text-sm animate-in slide-in-from-left-2 duration-200"
          sideOffset={8}
        >
          <div className="flex items-center gap-2">
            <Image 
              src="/kaiboard-logo/Logo Kaiboard Transparent.svg" 
              alt="Kaiboard Logo" 
              width={16} 
              height={16}
              className="w-4 h-4"
            />
            <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">Kaiboard</span>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <SidebarMenuButton size="lg" asChild className="hover:bg-accent/30 transition-all duration-300">
      <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
        <div className="relative group-data-[collapsible=icon]:mx-auto">
          <Image 
            src="/kaiboard-logo/Logo Kaiboard Transparent.svg" 
            alt="Kaiboard Logo" 
            width={32} 
            height={32}
            className="w-8 h-8 drop-shadow-sm"
          />
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-sm -z-10"></div>
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent text-base">Kaiboard</span>
          <span className="truncate text-xs text-muted-foreground font-medium">
            Project Management
          </span>
        </div>
        <Badge variant="secondary" className="text-xs px-2 py-1 group-data-[collapsible=icon]:hidden">
          Beta
        </Badge>
      </Link>
    </SidebarMenuButton>
  );
}

export function MainAppLayout({ children, session, userRole }: MainAppLayoutProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-state');
    if (savedState !== null) {
      setOpen(savedState === 'true');
    } else {
      setOpen(true); // Default to open
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    localStorage.setItem('sidebar-state', newOpen.toString());
  };

  // If no session, render children without sidebar (for home page)
  if (!session?.user) {
    return <div className="min-h-screen">{children}</div>;
  }

  // Don't render until we've loaded the saved state
  if (open === undefined) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <TooltipProvider>
      <SidebarProvider open={open} onOpenChange={handleOpenChange}>
        <Sidebar variant="inset" collapsible="icon" className="bg-card/70 backdrop-blur-lg border-r border-border/50 shadow-lg">
        <SidebarHeader className="border-b border-border/50 bg-gradient-to-r from-background/80 to-accent/20">
          <SidebarMenu>
            <SidebarMenuItem>
              <LogoSection session={session} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        
        <SidebarContent className="bg-gradient-to-b from-background/50 to-background/80">
          <SidebarMenu className="gap-2 p-2 group-data-[collapsible=icon]:px-1">
            {navigation.map((item) => {
              const isActive = pathname === item.url;
              return (
                <SidebarMenuItem key={item.title}>
                  <NavigationItem item={item} isActive={isActive} />
                </SidebarMenuItem>
              );
            })}
            
            {/* Super Admin Only Section */}
            {userRole === 'SUPER_ADMIN' && (
              <>
                <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                    <Shield className="w-3 h-3" />
                    Admin
                  </div>
                </div>
                <SidebarMenuItem>
                  <NavigationItem 
                    item={{
                      title: "Users Management",
                      url: "/admin/users",
                      icon: <Users className="w-4 h-4" />,
                      color: "text-purple-500",
                    }} 
                    isActive={pathname.startsWith('/admin/users')} 
                  />
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <NavigationItem 
                    item={{
                      title: "Request Logs",
                      url: "/admin/logs",
                      icon: <Database className="w-4 h-4" />,
                      color: "text-purple-500",
                    }} 
                    isActive={pathname === '/admin/logs'} 
                  />
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>

          {/* Quick Stats in Sidebar - Hide in icon mode */}
          <div className="px-4 py-6 mt-6 border-t border-border/50 group-data-[collapsible=icon]:hidden">
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Quick Stats
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-chart-3" />
                  <span className="text-xs font-medium">Local Time</span>
                </div>
                <LocalTime />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3 text-chart-4" />
                  <span className="text-xs font-medium">Online</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  1 member
                </span>
              </div>
            </div>
          </div>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-border/50 bg-gradient-to-r from-background/80 to-accent/20">
          <NavUser session={session} />
        </SidebarFooter>
        
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset className="bg-gradient-to-br from-background to-accent/5">
        <header className="flex h-16 shrink-0 items-center gap-4 px-6 border-b border-border/50 bg-gradient-to-r from-background/80 to-accent/10 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 hover:bg-accent/50 transition-colors rounded-lg" />
          <Separator orientation="vertical" className="mr-2 h-6 bg-border/50" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {navigation.find(item => item.url === pathname)?.icon || <Home className="w-4 h-4" />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {navigation.find(item => item.url === pathname)?.title || 'Dashboard'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Welcome to your workspace
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-3 py-1 bg-primary/5 border-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="System Online"></div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
} 