"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Users, 
  Calendar, 
  Settings, 
  Crown, 
  Shield, 
  User,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: Array<{
    id: string;
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
    customRoles: {
      id: string;
      teamRole: {
        id: string;
        name: string;
        color: string;
      };
    }[];
  }>;
  roles: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  _count: {
    members: number;
    meetings: number;
  };
}

interface TeamsClientProps {
  teams: Team[];
  currentUserId: string;
}

export function TeamsClient({ teams, currentUserId }: TeamsClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState<{id: string, name: string} | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    setIsDeleting(teamId);
    toast.loading("Deleting team...", { id: 'delete-team' });

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Team deleted successfully", { id: 'delete-team' });
        // Refresh the page
        window.location.reload();
      } else {
        toast.error('Failed to delete team', { id: 'delete-team' });
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team. Please try again.', { id: 'delete-team' });
    } finally {
      setIsDeleting(null);
      setDeleteConfirmTeam(null);
    }
  };

  const ownedTeams = teams.filter(team => team.userRole === 'OWNER');
  const memberTeams = teams.filter(team => team.userRole !== 'OWNER');

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your teams and collaborate with your colleagues
          </p>
        </div>
        <Button 
          onClick={() => router.push('/teams/create')}
          className="w-full sm:w-auto bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="py-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{ownedTeams.length}</p>
                <p className="text-sm text-muted-foreground">Teams Owned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{memberTeams.length}</p>
                <p className="text-sm text-muted-foreground">Teams Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="py-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {teams.reduce((acc, team) => acc + team._count.meetings, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Meetings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Owned Teams */}
      {ownedTeams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Your Teams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {ownedTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-all duration-200 group py-0">
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        {team.image && <AvatarImage src={team.image} alt={team.name} />}
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                          {team.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">{team.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleIcon(team.userRole)}
                          <Badge variant="outline" className={getRoleColor(team.userRole)}>
                            {team.userRole}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}`)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/teams/${team.id}/edit`)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Team
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setDeleteConfirmTeam({id: team.id, name: team.name})}
                          className="text-red-600"
                          disabled={isDeleting === team.id}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting === team.id ? 'Deleting...' : 'Delete Team'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {team.description && (
                    <CardDescription className="mt-3">
                      {team.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{team._count.members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{team._count.meetings} meetings</span>
                    </div>
                  </div>
                  
                  {/* Team Roles */}
                  {team.roles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Team Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.roles.slice(0, 3).map((role) => (
                          <Badge 
                            key={role.id} 
                            variant="outline" 
                            style={{ 
                              backgroundColor: `${role.color}20`, 
                              borderColor: role.color,
                              color: role.color 
                            }}
                          >
                            {role.name}
                          </Badge>
                        ))}
                        {team.roles.length > 3 && (
                          <Badge variant="outline">
                            +{team.roles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Members */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Members:</p>
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 5).map((member) => (
                        <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                          {member.user.image && <AvatarImage src={member.user.image} />}
                          <AvatarFallback className="text-xs">
                            {member.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{team.members.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => router.push(`/teams/${team.id}`)}
                    className="w-full"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Team
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Member Teams */}
      {memberTeams.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Teams You're In
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {memberTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-all duration-200 py-0">
                <CardHeader className="pb-4 pt-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      {team.image && <AvatarImage src={team.image} alt={team.name} />}
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 font-bold">
                        {team.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(team.userRole)}
                        <Badge variant="outline" className={getRoleColor(team.userRole)}>
                          {team.userRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {team.description && (
                    <CardDescription className="mt-3">
                      {team.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{team._count.members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{team._count.meetings} meetings</span>
                    </div>
                  </div>
                  
                  {/* User's custom roles */}
                  {(team.members.find(m => m.user.id === currentUserId)?.customRoles?.length || 0) > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Your Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {team.members.find(m => m.user.id === currentUserId)?.customRoles?.map((customRole) => (
                          <Badge 
                            key={customRole.id}
                            variant="outline" 
                            style={{ 
                              backgroundColor: `${customRole.teamRole.color}20`, 
                              borderColor: customRole.teamRole.color,
                              color: customRole.teamRole.color 
                            }}
                          >
                            {customRole.teamRole.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => router.push(`/teams/${team.id}`)}
                    className="w-full"
                    variant="outline"
                  >
                    View Team
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {teams.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first team to start collaborating with your colleagues
            </p>
            <Button onClick={() => router.push('/teams/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Team Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmTeam} onOpenChange={() => setDeleteConfirmTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Team
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteConfirmTeam?.name}</strong>"? 
              This action cannot be undone and will permanently delete the team, all its data, 
              meetings, and remove all members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmTeam && handleDeleteTeam(deleteConfirmTeam.id)}
              disabled={!!isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 