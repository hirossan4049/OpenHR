"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProfileEditForm } from "~/components/profile/profile-edit-form";
import { SkillManagement } from "~/components/profile/skill-management";
import { Button } from "~/components/ui/button";

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
        fetch("/api/skills")
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <ProfileEditForm
            initialData={profile || undefined}
            onSave={handleProfileSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Profile Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="h-16 w-16 rounded-full"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile?.name || session?.user?.name || "Your Profile"}
                  </h1>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  {profile?.grade && (
                    <p className="text-sm text-gray-500">{profile.grade}</p>
                  )}
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </div>
            
            {profile?.bio && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">About</h3>
                <p className="mt-1 text-gray-700">{profile.bio}</p>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile?.contact && (
                <div>
                  <h4 className="font-medium text-gray-900">Contact</h4>
                  <p className="text-gray-700">{profile.contact}</p>
                </div>
              )}
              {profile?.githubUrl && (
                <div>
                  <h4 className="font-medium text-gray-900">GitHub</h4>
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {profile.githubUrl}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <SkillManagement
            initialSkills={skills}
            onSkillsChange={setSkills}
          />
        </div>
      </div>
    </div>
  );
}