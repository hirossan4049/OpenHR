"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X, Plus } from "lucide-react";

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  level: z.number().min(1).max(5),
  yearsOfExp: z.number().min(0).max(50).optional(),
});

type SkillData = z.infer<typeof skillSchema>;

interface UserSkill extends SkillData {
  id: string;
  skillId: string;
}

interface SkillManagementProps {
  initialSkills?: UserSkill[];
  onSkillsChange?: (skills: UserSkill[]) => void;
}

export function SkillManagement({ initialSkills = [], onSkillsChange }: SkillManagementProps) {
  const [skills, setSkills] = useState<UserSkill[]>(initialSkills);
  const [newSkill, setNewSkill] = useState<SkillData>({
    name: "",
    level: 1,
    yearsOfExp: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SkillData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    onSkillsChange?.(skills);
  }, [skills, onSkillsChange]);

  const handleAddSkill = async () => {
    setErrors({});
    setSaveStatus("idle");

    try {
      const validatedSkill = skillSchema.parse(newSkill);
      
      // Check if skill already exists
      if (skills.some(skill => skill.name.toLowerCase() === validatedSkill.name.toLowerCase())) {
        setErrors({ name: "Skill already exists" });
        return;
      }

      setIsLoading(true);

      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedSkill),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add skill");
      }

      const newUserSkill = await response.json();
      setSkills(prev => [...prev, newUserSkill]);
      setNewSkill({ name: "", level: 1, yearsOfExp: 0 });
      setSaveStatus("success");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SkillData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof SkillData] = err.message;
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

  const handleUpdateSkill = async (skillId: string, updates: Partial<SkillData>) => {
    try {
      const skill = skills.find(s => s.id === skillId);
      if (!skill) return;

      const updatedSkill = { ...skill, ...updates };
      const validatedSkill = skillSchema.parse(updatedSkill);

      const response = await fetch(`/api/skills/${skillId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedSkill),
      });

      if (!response.ok) {
        throw new Error("Failed to update skill");
      }

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, ...updates } : s));
    } catch (error) {
      console.error("Error updating skill:", error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove skill");
      }

      setSkills(prev => prev.filter(s => s.id !== skillId));
    } catch (error) {
      console.error("Error removing skill:", error);
    }
  };

  const handleNewSkillChange = (field: keyof SkillData, value: string | number) => {
    setNewSkill(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setSaveStatus("idle");
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
    return labels[level] || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">Skills</h3>
        
        {/* Existing Skills */}
        <div className="mb-6 space-y-3">
          {skills.length === 0 ? (
            <p className="text-gray-500">No skills added yet. Add your first skill below!</p>
          ) : (
            skills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">{skill.name}</span>
                    <span className="text-sm text-gray-600">
                      Level {skill.level} ({getLevelLabel(skill.level)})
                    </span>
                    {skill.yearsOfExp !== undefined && skill.yearsOfExp > 0 && (
                      <span className="text-sm text-gray-600">
                        {skill.yearsOfExp} year{skill.yearsOfExp !== 1 ? 's' : ''} experience
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={skill.level}
                      onChange={(e) => handleUpdateSkill(skill.id, { level: Number(e.target.value) })}
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map(level => (
                        <option key={level} value={level}>
                          {level} - {getLevelLabel(level)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={skill.yearsOfExp || 0}
                      onChange={(e) => handleUpdateSkill(skill.id, { yearsOfExp: Number(e.target.value) })}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                      placeholder="Years"
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Skill */}
        <div className="border-t pt-4">
          <h4 className="mb-3 font-medium text-gray-900">Add New Skill</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <Label htmlFor="skillName" className="text-gray-700">Skill Name</Label>
              <Input
                id="skillName"
                value={newSkill.name}
                onChange={(e) => handleNewSkillChange("name", e.target.value)}
                placeholder="e.g., React, Python, Design..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <Label htmlFor="skillLevel" className="text-gray-700">Level</Label>
              <select
                id="skillLevel"
                value={newSkill.level}
                onChange={(e) => handleNewSkillChange("level", Number(e.target.value))}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map(level => (
                  <option key={level} value={level}>
                    {level} - {getLevelLabel(level)}
                  </option>
                ))}
              </select>
              {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
            </div>
            
            <div>
              <Label htmlFor="skillYears" className="text-gray-700">Years</Label>
              <Input
                id="skillYears"
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsOfExp || 0}
                onChange={(e) => handleNewSkillChange("yearsOfExp", Number(e.target.value))}
                placeholder="0"
              />
              {errors.yearsOfExp && <p className="mt-1 text-sm text-red-600">{errors.yearsOfExp}</p>}
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.name.trim()}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Adding..." : "Add Skill"}
            </Button>
          </div>

          {saveStatus === "success" && (
            <div className="mt-3 rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">Skill added successfully!</p>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="mt-3 rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">Failed to add skill. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}