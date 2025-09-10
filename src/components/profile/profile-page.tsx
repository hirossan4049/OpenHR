"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ProfileEditForm } from "~/components/profile/profile-edit-form";
import { SkillManagement } from "~/components/profile/skill-management";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Github, Mail, User } from "lucide-react";

interface UserProfile {
  name: string;
  bio?: string;
  grade?: string;
  contact?: string;
  githubUrl?: string;
}

interface UserSkill {
  id: string;
  skillId: string;
  name: string;
  level: number;
  yearsOfExp?: number;
}

export function ProfilePage() {
  const t = useTranslations("ProfilePage");
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    }
  }, [status]);

  const fetchProfileData = async () => {
    try {
      const [profileResponse, skillsResponse] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/skills"),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = (data: UserProfile) => {
    setProfile(data);
    setIsEditing(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container py-8">
        <ProfileEditForm
          initialData={profile || undefined}
          onSave={handleProfileSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="mb-4 h-24 w-24">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0) ?? session?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile?.name ?? session?.user?.name}</h1>
                <p className="text-muted-foreground">{profile?.grade}</p>
                <p className="mt-2 text-sm text-muted-foreground text-center">{profile?.bio}</p>
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session?.user?.email}</span>
                </div>
                {profile?.contact && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.contact}</span>
                  </div>
                )}
                {profile?.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>
              <Button className="mt-6 w-full" onClick={() => setIsEditing(true)}>
                {t("editProfile")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <Tabs defaultValue="skills">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
              <TabsTrigger value="projects">{t("projects")}</TabsTrigger>
              <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
            </TabsList>
            <TabsContent value="skills">
                <SkillManagement
                  initialSkills={skills}
                  onSkillsChange={setSkills}
                />
            </TabsContent>
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>{t("projects")}</CardTitle>
                  <CardDescription>Projects you have participated in.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No projects to display yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>{t("activity")}</CardTitle>
                  <CardDescription>Your recent activity in the community.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}