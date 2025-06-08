"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Users,
  Calendar,
  Settings,
  Crown,
  Shield,
  User,
  Plus,
  Mail,
  MoreVertical,
  UserMinus,
  UserCheck,
  Edit,
  Trash2,
  Tag,
  Clock,
  Edit3,
  UserPlus,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TeamMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    timezone: string | null;
  };
  customRoles: {
    id: string;
    teamRole: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

interface TeamRole {
  id: string;
  name: string;
  color: string;
}

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  creator: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    participants: number;
  };
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  createdAt: string;
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  members: TeamMember[];
  roles: TeamRole[];
  meetings: Meeting[];
  _count: {
    members: number;
    meetings: number;
  };
}

interface TeamManagementClientProps {
  team: Team;
  currentUserId: string;
}

export function TeamManagementClient({ team, currentUserId }: TeamManagementClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [selectedCustomRoles, setSelectedCustomRoles] = useState<string[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editMemberRole, setEditMemberRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER'>('MEMBER');
  const [editMemberCustomRoles, setEditMemberCustomRoles] = useState<string[]>([]);

  const canManageMembers = team.userRole === 'OWNER' || team.userRole === 'ADMIN';
  const canManageSettings = team.userRole === 'OWNER' || team.userRole === 'ADMIN';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0';
      case 'ADMIN':
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !canManageMembers) return;

    console.log('🚀 Starting invite member process', {
      teamId: team.id,
      teamName: team.name,
      inviteEmail,
      inviteRole,
      customRoleIds: selectedCustomRoles,
      invitedBy: {
        id: currentUserId,
        role: team.userRole
      }
    });

    setIsLoading(true);
    toast.loading("Sending invitation...", { id: 'invite-member' });

    try {
      const response = await fetch(`/api/teams/${team.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          customRoleIds: selectedCustomRoles,
        }),
      });

      if (response.ok) {
        const newMember = await response.json();
        console.log('✅ Member invited successfully', {
          teamId: team.id,
          newMember: {
            id: newMember.id,
            email: inviteEmail,
            role: inviteRole,
            customRoles: selectedCustomRoles.length
          }
        });

        toast.success(`Successfully invited ${inviteEmail} to the team!`, { id: 'invite-member' });
        setInviteEmail("");
        setSelectedCustomRoles([]);
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('❌ Failed to invite member - API error', {
          teamId: team.id,
          email: inviteEmail,
          status: response.status,
          error: error.message
        });
        toast.error(error.message || 'Failed to invite member', { id: 'invite-member' });
      }
    } catch (error) {
      console.error('❌ Failed to invite member - Network/Unexpected error', {
        teamId: team.id,
        email: inviteEmail,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to invite member. Please try again.', { id: 'invite-member' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'ADMIN' | 'MEMBER') => {
    if (!canManageMembers) return;

    console.log('🔄 Updating member role', {
      teamId: team.id,
      memberId,
      newRole,
      updatedBy: currentUserId
    });

    setIsLoading(true);
    toast.loading("Updating member role...", { id: 'update-role' });

    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        console.log('✅ Member role updated successfully', {
          teamId: team.id,
          memberId,
          newRole
        });
        toast.success(`Member role updated to ${newRole}`, { id: 'update-role' });
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('❌ Failed to update member role - API error', {
          teamId: team.id,
          memberId,
          newRole,
          status: response.status,
          error: error.message
        });
        toast.error(error.message || 'Failed to update member role', { id: 'update-role' });
      }
    } catch (error) {
      console.error('❌ Failed to update member role - Network/Unexpected error', {
        teamId: team.id,
        memberId,
        newRole,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to update member role. Please try again.', { id: 'update-role' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!canManageMembers) return;
    
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    console.log('🗑️ Removing member from team', {
      teamId: team.id,
      memberId,
      removedBy: currentUserId
    });

    setIsLoading(true);
    toast.loading("Removing member...", { id: 'remove-member' });

    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ Member removed successfully', {
          teamId: team.id,
          memberId
        });
        toast.success("Member removed from team", { id: 'remove-member' });
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('❌ Failed to remove member - API error', {
          teamId: team.id,
          memberId,
          status: response.status,
          error: error.message
        });
        toast.error(error.message || 'Failed to remove member', { id: 'remove-member' });
      }
    } catch (error) {
      console.error('❌ Failed to remove member - Network/Unexpected error', {
        teamId: team.id,
        memberId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to remove member. Please try again.', { id: 'remove-member' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = async () => {
    if (!editingMember || !canManageMembers) return;

    console.log('✏️ Editing member details', {
      teamId: team.id,
      memberId: editingMember.id,
      memberEmail: editingMember.user.email,
      currentRole: editingMember.role,
      newRole: editMemberRole,
      customRoles: editMemberCustomRoles,
      editedBy: currentUserId
    });

    setIsLoading(true);
    toast.loading("Updating member...", { id: 'edit-member' });

    try {
      // For owners, only update custom roles, don't change the main role
      const requestBody: { role?: string; customRoleIds: string[] } = {
        customRoleIds: editMemberCustomRoles,
      };

      // Only include role in the request if the member is not an owner
      if (editingMember.role !== 'OWNER') {
        requestBody.role = editMemberRole;
      }

      const response = await fetch(`/api/teams/${team.id}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        console.log('✅ Member updated successfully', {
          teamId: team.id,
          memberId: editingMember.id,
          updatedRole: editingMember.role !== 'OWNER' ? editMemberRole : 'OWNER',
          customRolesCount: editMemberCustomRoles.length
        });
        toast.success("Member updated successfully", { id: 'edit-member' });
        setEditingMember(null);
        setEditMemberRole('MEMBER');
        setEditMemberCustomRoles([]);
        window.location.reload();
      } else {
        const error = await response.json();
        console.error('❌ Failed to update member - API error', {
          teamId: team.id,
          memberId: editingMember.id,
          status: response.status,
          error: error.message
        });
        toast.error(error.message || 'Failed to update member', { id: 'edit-member' });
      }
    } catch (error) {
      console.error('❌ Failed to update member - Network/Unexpected error', {
        teamId: team.id,
        memberId: editingMember?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Failed to update member. Please try again.', { id: 'edit-member' });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setEditMemberRole(member.role); // Keep the actual role, including OWNER
    setEditMemberCustomRoles(member.customRoles.map(cr => cr.teamRole.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          <div className="flex items-center gap-4 lg:gap-6 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/teams')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Teams</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white shadow-lg">
                  {team.image && <AvatarImage src={team.image} alt={team.name} />}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl sm:text-2xl">
                    {team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                </div>
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 truncate">{team.name}</h1>
                {team.description && (
                  <p className="text-base sm:text-lg text-gray-600 mb-4 max-w-2xl line-clamp-2">{team.description}</p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(team.userRole)}
                    <Badge className={getRoleColor(team.userRole)}>
                      {team.userRole}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm sm:text-base">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{team._count.members} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{team._count.meetings} meetings</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {canManageSettings && (
              <Button 
                onClick={() => router.push(`/teams/${team.id}/edit`)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <Tabs defaultValue="members" className="space-y-6 lg:space-y-8">
          <TabsList className="bg-white border border-gray-200 shadow-sm w-full justify-start overflow-x-auto">
            <TabsTrigger value="members" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 whitespace-nowrap">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Members</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 whitespace-nowrap">
              <Star className="w-4 h-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger value="meetings" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 whitespace-nowrap">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Recent Meetings</span>
              <span className="sm:hidden">Meetings</span>
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100/60 !pt-0 !pr-0 !pb-0 !pl-0">
                <div className="flex items-center justify-between p-8">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                        <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      </div>
                      <div>
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Team Members
                        </span>
                        <span className="ml-2 text-lg font-medium text-gray-500">({team.members.length})</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-3 ml-[60px]">
                      Manage your team members and their permissions
                    </CardDescription>
                  </div>
                  
                  {canManageMembers && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white border-0 shadow-2xl max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <UserPlus className="w-5 h-5 text-green-600" />
                            </div>
                            Invite Team Member
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Send an invitation to join your team
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-sm font-medium text-gray-700">Permission Level</Label>
                            <Select value={inviteRole} onValueChange={(value: 'ADMIN' | 'MEMBER') => setInviteRole(value)}>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select permission level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MEMBER">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Member
                                  </div>
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                  <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {team.roles.length > 0 && (
                            <div className="space-y-3">
                              <Label className="text-sm font-medium text-gray-700">Team Roles (Optional)</Label>
                              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                                {team.roles.map((role) => (
                                  <div key={role.id} className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      id={`role-${role.id}`}
                                      checked={selectedCustomRoles.includes(role.id)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCustomRoles([...selectedCustomRoles, role.id]);
                                        } else {
                                          setSelectedCustomRoles(selectedCustomRoles.filter(id => id !== role.id));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                      htmlFor={`role-${role.id}`}
                                      className="flex items-center gap-2 cursor-pointer flex-1"
                                    >
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: role.color }}
                                      />
                                      <span className="text-sm font-medium text-gray-700">{role.name}</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            onClick={handleInviteMember} 
                            disabled={!inviteEmail || isLoading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                          >
                            {isLoading ? "Sending..." : "Send Invitation"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {team.members.map((member, index) => (
                    <div key={member.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                              {member.user.image && <AvatarImage src={member.user.image} />}
                              <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white font-semibold">
                                {member.user.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            {member.role === 'OWNER' && (
                              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">{member.user.name || 'Unknown User'}</h4>
                              <Badge className={getRoleColor(member.role)}>
                                <div className="flex items-center gap-1">
                                  {getRoleIcon(member.role)}
                                  {member.role}
                                </div>
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-1 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{member.user.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {member.customRoles.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {member.customRoles.map((customRole) => (
                                  <Badge 
                                    key={customRole.id}
                                    variant="outline"
                                    className="border-2"
                                    style={{
                                      borderColor: customRole.teamRole.color,
                                      color: customRole.teamRole.color,
                                      backgroundColor: `${customRole.teamRole.color}10`
                                    }}
                                  >
                                    <div className="flex items-center gap-1">
                                      <div 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: customRole.teamRole.color }}
                                      />
                                      {customRole.teamRole.name}
                                    </div>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {canManageMembers && member.user.id !== currentUserId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => openEditMember(member)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              {member.role !== 'OWNER' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}>
                                    <Zap className="w-4 h-4 mr-2" />
                                    {member.role === 'ADMIN' ? 'Make Member' : 'Make Admin'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {canManageMembers && member.user.id === currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditMember(member)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit My Roles
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b border-gray-100/60 !p-0">
                <div className="p-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="relative p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Team Roles
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500">({team.roles.length})</span>
                  </div>
                </CardTitle>
                                  <CardDescription className="text-gray-600 mt-3 ml-[60px]">
                    Manage custom roles for your team members
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {team.roles.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No custom roles yet</h3>
                    <p className="text-gray-600 mb-4">Create custom roles to better organize your team</p>
                    {canManageSettings && (
                      <Button onClick={() => router.push(`/teams/${team.id}/edit`)}>
                        Create First Role
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {team.roles.map((role) => {
                      const membersWithRole = team.members.filter(member => 
                        member.customRoles.some(cr => cr.teamRole.id === role.id)
                      );
                      
                      return (
                        <div key={role.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: role.color }}
                            />
                            <h4 className="font-semibold text-gray-900">{role.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {membersWithRole.length} member{membersWithRole.length !== 1 ? 's' : ''}
                          </p>
                          {membersWithRole.length > 0 && (
                            <div className="flex -space-x-2 mt-2">
                              {membersWithRole.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="w-6 h-6 border border-white">
                                  {member.user.image && <AvatarImage src={member.user.image} />}
                                  <AvatarFallback className="text-xs">
                                    {member.user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {membersWithRole.length > 3 && (
                                <div className="w-6 h-6 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">+{membersWithRole.length - 3}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-gray-100/60 !p-0">
                <div className="p-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="relative p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Recent Meetings
                    </span>
                    <span className="ml-2 text-lg font-medium text-gray-500">({team.meetings.length})</span>
                  </div>
                </CardTitle>
                                  <CardDescription className="text-gray-600 mt-3 ml-[60px]">
                    Latest team meetings and activities
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {team.meetings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings yet</h3>
                    <p className="text-gray-600">Team meetings will appear here once scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {team.meetings.map((meeting) => (
                      <div key={meeting.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                {new Date(meeting.startTime).toLocaleDateString()} at{' '}
                                {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span>{meeting._count.participants} participants</span>
                            </div>
                          </div>
                          <Avatar className="w-8 h-8">
                            {meeting.creator.image && <AvatarImage src={meeting.creator.image} />}
                            <AvatarFallback className="text-xs">
                              {meeting.creator.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="bg-white border-0 shadow-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900 flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {editingMember.user.image && <AvatarImage src={editingMember.user.image} />}
                  <AvatarFallback>
                    {editingMember.user.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                Edit {editingMember.user.name}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Update member roles and permissions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {editingMember.role !== 'OWNER' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Permission Level</Label>
                  <Select value={editMemberRole} onValueChange={(value: 'ADMIN' | 'MEMBER') => setEditMemberRole(value)}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select permission level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Member
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingMember.role === 'OWNER' && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <Crown className="w-5 h-5" />
                    <span className="font-semibold">Team Owner</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Owner permissions cannot be changed. You can only update custom team roles.
                  </p>
                </div>
              )}

              {team.roles.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Team Roles (Optional)</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                    {team.roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`edit-role-${role.id}`}
                          checked={editMemberCustomRoles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditMemberCustomRoles([...editMemberCustomRoles, role.id]);
                            } else {
                              setEditMemberCustomRoles(editMemberCustomRoles.filter(id => id !== role.id));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`edit-role-${role.id}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color }}
                          />
                          <span className="text-sm font-medium text-gray-700">{role.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleEditMember}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 