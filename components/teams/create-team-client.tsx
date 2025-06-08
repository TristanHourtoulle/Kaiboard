"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ArrowLeft, 
  Plus, 
  X, 
  Upload, 
  Users, 
  Tag,
  Palette
} from "lucide-react";

const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
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

interface Role {
  name: string;
  color: string;
}

export function CreateTeamClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [teamImage, setTeamImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ROLE_COLORS[0]);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
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

  const addRole = () => {
    if (newRoleName.trim() && !roles.find(role => role.name === newRoleName.trim())) {
      setRoles([...roles, { name: newRoleName.trim(), color: selectedColor }]);
      setNewRoleName("");
      // Rotate to next color
      const currentIndex = DEFAULT_ROLE_COLORS.indexOf(selectedColor);
      const nextIndex = (currentIndex + 1) % DEFAULT_ROLE_COLORS.length;
      setSelectedColor(DEFAULT_ROLE_COLORS[nextIndex]);
    }
  };

  const addPresetRole = (presetRole: Role) => {
    if (!roles.find(role => role.name === presetRole.name)) {
      setRoles([...roles, presetRole]);
    }
  };

  const removeRole = (roleName: string) => {
    setRoles(roles.filter(role => role.name !== roleName));
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
    setIsLoading(true);
    try {
      let imageUrl = "";
      
      if (teamImage) {
        imageUrl = await uploadImage(teamImage);
      }

      const teamData = {
        ...data,
        image: imageUrl,
        roles: roles,
      };

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        const team = await response.json();
        toast.success("Team created successfully!");
        router.push(`/teams/${team.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Team</h1>
          <p className="text-muted-foreground">
            Set up your team with members, roles, and permissions
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Team Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Information
              </CardTitle>
              <CardDescription>
                Basic information about your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Team Image */}
              <div className="space-y-4">
                <Label>Team Image</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    {imagePreview && <AvatarImage src={imagePreview} alt="Team" />}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xl">
                      {form.watch("name")?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="team-image" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </div>
                    </Label>
                    <Input
                      id="team-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter team name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Choose a name that represents your team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What does your team do?"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description of your team's purpose and goals
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Team Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Team Roles
              </CardTitle>
              <CardDescription>
                Define custom roles for your team members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preset Roles */}
              <div className="space-y-3">
                <Label>Quick Add Preset Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ROLES.map((role) => (
                    <Button
                      key={role.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPresetRole(role)}
                      disabled={roles.some(r => r.name === role.name)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {role.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Role Creation */}
              <div className="space-y-4">
                <Label>Create Custom Role</Label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Role name (e.g., Frontend Developer)"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRole();
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      {DEFAULT_ROLE_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            selectedColor === color ? 'border-primary scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addRole}
                    disabled={!newRoleName.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Current Roles */}
              {roles.length > 0 && (
                <div className="space-y-3">
                  <Label>Team Roles ({roles.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Badge
                        key={role.name}
                        variant="outline"
                        className="text-sm py-1 px-3 flex items-center gap-2"
                        style={{
                          backgroundColor: `${role.color}20`,
                          borderColor: role.color,
                          color: role.color,
                        }}
                      >
                        {role.name}
                        <button
                          type="button"
                          onClick={() => removeRole(role.name)}
                          className="hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.watch("name")}
              className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70"
            >
              {isLoading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 