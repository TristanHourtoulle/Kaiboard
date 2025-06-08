"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Settings,
  Upload,
  Plus,
  X,
  Palette,
  Tag,
  Trash2,
  Edit,
  Crown,
  Image as ImageIcon,
  Users,
  Star,
  AlertTriangle,
  Sparkles,
  Shield,
  User,
  Save,
} from "lucide-react";

const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

const DEFAULT_ROLE_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

const PRESET_ROLES = [
  { name: "Frontend", color: "#3B82F6" },
  { name: "Backend", color: "#10B981" },
  { name: "DevOps", color: "#F59E0B" },
  { name: "Designer", color: "#EC4899" },
  { name: "Product Manager", color: "#8B5CF6" },
  { name: "QA", color: "#EF4444" },
  { name: "Mobile", color: "#06B6D4" },
  { name: "Data", color: "#84CC16" },
];

interface TeamMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
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
}

interface TeamRole {
  id: string;
  name: string;
  color: string;
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
  _count: {
    members: number;
    meetings: number;
  };
}

interface TeamSettingsClientProps {
  team: Team;
  currentUserId: string;
}

interface Role {
  name: string;
  color: string;
}

export function TeamSettingsClient({ team, currentUserId }: TeamSettingsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(team.image || "");
  
  // Role management state
  const [roles, setRoles] = useState<TeamRole[]>(team.roles);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ROLE_COLORS[0]);
  const [editingRole, setEditingRole] = useState<TeamRole | null>(null);

  const canEditSettings = team.userRole === 'OWNER' || team.userRole === 'ADMIN';
  const isOwner = team.userRole === 'OWNER';

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team.name,
      description: team.description || "",
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTeamImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'team');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const onSubmit = async (data: TeamFormData) => {
    if (!canEditSettings) return;

    setIsLoading(true);
    try {
      let imageUrl = team.image;
      
      if (teamImage) {
        imageUrl = await uploadImage(teamImage);
      }

      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          image: imageUrl,
        }),
      });

      if (response.ok) {
        toast.success("Team updated successfully");
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addRole = async () => {
    if (!newRoleName.trim() || !canEditSettings) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          color: selectedColor,
        }),
      });

      if (response.ok) {
        const newRole = await response.json();
        setRoles([...roles, newRole]);
        setNewRoleName("");
        // Rotate to next color
        const currentIndex = DEFAULT_ROLE_COLORS.indexOf(selectedColor);
        const nextIndex = (currentIndex + 1) % DEFAULT_ROLE_COLORS.length;
        setSelectedColor(DEFAULT_ROLE_COLORS[nextIndex]);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addPresetRole = async (presetRole: Role) => {
    if (roles.find(role => role.name === presetRole.name) || !canEditSettings) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presetRole),
      });

      if (response.ok) {
        const newRole = await response.json();
        setRoles([...roles, newRole]);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (roleId: string, updatedData: { name: string; color: string }) => {
    if (!canEditSettings) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedRole = await response.json();
        setRoles(roles.map(role => role.id === roleId ? updatedRole : role));
        setEditingRole(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!canEditSettings) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRoles(roles.filter(role => role.id !== roleId));
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTeam = async () => {
    if (!isOwner) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/teams');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-6 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/teams/${team.id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Team
            </Button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                {imagePreview && <AvatarImage src={imagePreview} alt={team.name} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                  {team.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 shadow-lg">
                <Settings className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Team Settings</h1>
              <p className="text-lg text-gray-600 mb-4">
                Manage {team.name} configuration and preferences
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{team._count.members} members</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4" />
                  <span className="font-medium">{team.roles.length} custom roles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Team Information */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-100/60 !p-0">
            <div className="p-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Settings className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Team Information
              </span>
            </CardTitle>
                          <CardDescription className="text-gray-600 mt-3 ml-[60px]">
                Update your team's basic information and branding
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Team Image */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-gray-900">Team Image</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-gray-200">
                    {imagePreview && <AvatarImage src={imagePreview} alt={team.name} />}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-2xl">
                      {team.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div>
                      <input
                        type="file"
                        id="team-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={!canEditSettings}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('team-image')?.click()}
                        disabled={!canEditSettings}
                        className="flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Change Image
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Recommended: Square image, at least 200x200px
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-gray-900">
                  Team Name
                </Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  disabled={!canEditSettings}
                  className="text-lg p-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Team Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  disabled={!canEditSettings}
                  placeholder="Describe your team's purpose and goals..."
                  className="min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {canEditSettings && (
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg py-6"
                >
                  {isLoading ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Team Roles */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b border-gray-100/60 !p-0">
            <div className="p-8">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="relative p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Star className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Team Roles
              </span>
            </CardTitle>
                          <CardDescription className="text-gray-600 mt-3 ml-[60px]">
                Create and manage custom roles for your team members
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {/* Create New Role */}
            {canEditSettings && (
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Role
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                    <Input
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Enter role name..."
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {DEFAULT_ROLE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                            selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={addRole}
                  disabled={!newRoleName.trim() || isLoading}
                  className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            )}

            {/* Preset Roles */}
            {canEditSettings && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Add Preset Roles
                </h3>
                <div className="grid gap-2 md:grid-cols-4">
                  {PRESET_ROLES.map((role) => {
                    const alreadyExists = roles.find(r => r.name === role.name);
                    return (
                      <Button
                        key={role.name}
                        variant="outline"
                        onClick={() => addPresetRole(role)}
                        disabled={!!alreadyExists || isLoading}
                        className={`justify-start ${alreadyExists ? 'opacity-50' : 'hover:bg-gray-50'}`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: role.color }}
                        />
                        {role.name}
                        {alreadyExists && <span className="ml-auto text-xs">✓</span>}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Existing Roles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Current Roles ({roles.length})
              </h3>
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No custom roles yet</h4>
                  <p className="text-gray-600">Create custom roles to better organize your team members</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {roles.map((role) => {
                    const membersWithRole = team.members.filter(member => 
                      member.customRoles.some(cr => cr.teamRole.id === role.id)
                    );
                    
                    return (
                      <div key={role.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: role.color }}
                            />
                            <h4 className="font-semibold text-gray-900">{role.name}</h4>
                          </div>
                          {canEditSettings && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRole(role)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRole(role.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {membersWithRole.length} member{membersWithRole.length !== 1 ? 's' : ''} assigned
                        </p>
                        
                        {membersWithRole.length > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {membersWithRole.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                                  {member.user.image && <AvatarImage src={member.user.image} />}
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-gray-400 to-gray-600 text-white">
                                    {member.user.name?.charAt(0) || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {membersWithRole.length > 3 && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">+{membersWithRole.length - 3}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {membersWithRole.slice(0, 2).map(m => m.user.name).join(', ')}
                              {membersWithRole.length > 2 && ` and ${membersWithRole.length - 2} more`}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {isOwner && (
          <Card className="border-0 shadow-xl bg-white border-red-200">
            <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-b border-red-100/60 !p-0">
              <div className="p-8">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="relative p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                </div>
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Danger Zone
                </span>
              </CardTitle>
                              <CardDescription className="text-red-600 mt-3 ml-[60px]">
                  Irreversible and destructive actions
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Team</h3>
                  <p className="text-gray-600 mb-4">
                    Once you delete this team, there is no going back. This will permanently delete 
                    all team data, members, meetings, and associated content.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-0 shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-red-800 flex items-center gap-2">
                          <AlertTriangle className="w-6 h-6" />
                          Delete Team
                        </DialogTitle>
                        <DialogDescription className="text-gray-600">
                          This action cannot be undone. This will permanently delete the team and all associated data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg my-4">
                        <p className="text-red-800 font-medium mb-2">This will delete:</p>
                        <ul className="text-red-700 text-sm space-y-1">
                          <li>• All team members and their roles</li>
                          <li>• All team meetings and records</li>
                          <li>• All team settings and configuration</li>
                          <li>• All associated data permanently</li>
                        </ul>
                      </div>
                      <DialogFooter className="gap-2">
                        <DialogTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogTrigger>
                        <Button
                          variant="destructive"
                          onClick={deleteTeam}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoading ? "Deleting..." : "Yes, Delete Team"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Role Dialog */}
      {editingRole && (
        <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
          <DialogContent className="bg-white border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Edit className="w-5 h-5 text-purple-600" />
                </div>
                Edit Role
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Update the role name and color
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                <Input
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                        editingRole.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingRole({ ...editingRole, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => updateRole(editingRole.id, { name: editingRole.name, color: editingRole.color })}
                disabled={isLoading || !editingRole.name.trim()}
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