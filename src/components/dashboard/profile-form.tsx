"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, User, Loader2, CheckCircle2, Shield } from "lucide-react";

import { profileSchema, type ProfileInput } from "@/lib/validations";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: "USER" | "ADMIN";
    _count?: {
      comments: number;
      favoriteTeams: number;
      articles: number;
    };
  };
}

export function ProfileForm() {
  const { data: session, update } = useSession();
  const userId = session?.user?.id;
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real database profile
  const { data: profileData, mutate } = useSWR<UserProfileResponse>(
    userId ? `/api/users/${userId}` : null,
    fetcher
  );

  const dbUser = profileData?.data;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      image: session?.user?.image || "",
    },
  });

  // Sync form when real database profile loads
  useEffect(() => {
    if (dbUser) {
      reset({
        name: dbUser.name || "",
        email: dbUser.email || "",
        image: dbUser.image || "",
      });
    }
  }, [dbUser, reset]);

  const previewImage = watch("image");
  const currentName = watch("name");

  // Profile completion calculation
  const hasName = Boolean(currentName?.trim());
  const hasAvatar = Boolean(previewImage?.trim());
  const hasTeams = Boolean((dbUser?._count?.favoriteTeams ?? 0) > 0);
  const completionPercentage = [true, hasName, hasAvatar, hasTeams].filter(Boolean).length * 25;

  const onSubmit = async (data: ProfileInput) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      // 1. Update SQLite database via API
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          image: data.image?.trim() || null,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile in database");
      }

      // 2. NextAuth session immediate update without logout
      if (update) {
        await update({
          name: data.name.trim(),
          image: data.image?.trim() || null,
        });
      }

      // 3. Mutate local SWR cache
      mutate();

      toast({
        title: "Profile Saved!",
        description: "Your display name and avatar were updated across your active session.",
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Completion Meter (Senior Product Engineer Enhancement) */}
      <Card className="border bg-card/60 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Profile Completeness</span>
                <Badge variant="outline" className="text-xs font-semibold text-primary">
                  {completionPercentage}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete your sports fan profile to unlock personalized feed badges.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasAvatar ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                Avatar
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className={`h-3.5 w-3.5 ${hasTeams ? "text-emerald-500" : "text-muted-foreground/40"}`} />
                Clubs
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Form */}
      <Card className="border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fan Profile Details</CardTitle>
              <CardDescription>
                Personalize your public sports identity and avatar.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1 font-mono text-xs">
              <Shield className="h-3 w-3 text-primary" />
              Role: {dbUser?.role || session?.user?.role || "USER"}
            </Badge>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Live Avatar Preview */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-inner">
                <AvatarImage src={previewImage || session?.user?.image || undefined} />
                <AvatarFallback className="text-lg font-bold bg-muted">
                  {getInitials(currentName || session?.user?.name || "Fan")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Avatar Image Preview</p>
                <p className="text-xs text-muted-foreground">
                  Paste a direct image link below. Updates will reflect across your comments.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Alex Morgan"
                  {...register("name")}
                  disabled={isSaving}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  readOnly
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                  {...register("email")}
                />
                <p className="text-[11px] text-muted-foreground">
                  Email address is linked to your authentication credentials and cannot be changed here.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://images.unsplash.com/photo-..."
                  {...register("image")}
                  disabled={isSaving}
                />
                {errors.image && (
                  <p className="text-xs text-destructive">{errors.image.message}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSaving || !isDirty} className="gap-2 font-semibold">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
