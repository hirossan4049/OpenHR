"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  grade: z.string().optional(),
  contact: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  initialData?: Partial<ProfileFormData>;
  onSave?: (data: ProfileFormData) => void;
  onCancel?: () => void;
}

export function ProfileEditForm({ initialData, onSave, onCancel }: ProfileEditFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || session?.user?.name || "",
    bio: initialData?.bio || "",
    grade: initialData?.grade || "",
    contact: initialData?.contact || "",
    githubUrl: initialData?.githubUrl || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSaveStatus("idle");

    try {
      const validatedData = profileSchema.parse(formData);
      
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setSaveStatus("success");
      onSave?.(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ProfileFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setSaveStatus("error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof ProfileFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSaveStatus("idle");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-700">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="bio" className="text-gray-700">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.bio.length}/500 characters
            </p>
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
          </div>

          <div>
            <Label htmlFor="grade" className="text-gray-700">Grade/Year</Label>
            <Input
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              placeholder="e.g., Sophomore, 2nd Year, etc."
            />
            {errors.grade && <p className="mt-1 text-sm text-red-600">{errors.grade}</p>}
          </div>

          <div>
            <Label htmlFor="contact" className="text-gray-700">Contact Information</Label>
            <Input
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone, Discord, etc."
            />
            {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
          </div>

          <div>
            <Label htmlFor="githubUrl" className="text-gray-700">GitHub Profile URL</Label>
            <Input
              id="githubUrl"
              name="githubUrl"
              type="url"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
            />
            {errors.githubUrl && <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>}
          </div>

          {saveStatus === "success" && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">Profile updated successfully!</p>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">Failed to update profile. Please try again.</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}