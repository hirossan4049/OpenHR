"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { X, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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

const levelOptions = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Basic" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
];

export function SkillManagement({ initialSkills = [], onSkillsChange }: SkillManagementProps) {
  const [skills, setSkills] = useState<UserSkill[]>(initialSkills);
  const [newSkill, setNewSkill] = useState<SkillData>({
    name: "",
    level: 3, // Default to Intermediate
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
      
      if (skills.some(skill => skill.name.toLowerCase() === validatedSkill.name.toLowerCase())) {
        setErrors({ name: "Skill already exists" });
        return;
      }

      setIsLoading(true);

      const response = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedSkill),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add skill");
      }

      const newUserSkill = await response.json();
      setSkills(prev => [...prev, newUserSkill]);
      setNewSkill({ name: "", level: 3, yearsOfExp: 0 });
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedSkill),
      });

      if (!response.ok) throw new Error("Failed to update skill");

      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, ...updates } : s));
    } catch (error) {
      console.error("Error updating skill:", error);
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      const response = await fetch(`/api/skills/${skillId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove skill");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Manage your technical and soft skills.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Skill</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Years</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>
                      <Select
                        value={String(skill.level)}
                        onValueChange={(value) => handleUpdateSkill(skill.id, { level: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map(opt => (
                            <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.yearsOfExp || 0}
                        onChange={(e) => handleUpdateSkill(skill.id, { yearsOfExp: Number(e.target.value) })}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSkill(skill.id)}
                        aria-label="Remove skill"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No skills added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full">
          <h4 className="text-sm font-medium mb-3">Add New Skill</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="skillName" className="sr-only">Skill Name</Label>
              <Input
                id="skillName"
                value={newSkill.name}
                onChange={(e) => handleNewSkillChange("name", e.target.value)}
                placeholder="e.g., React, Python..."
              />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="skillLevel" className="sr-only">Level</Label>
              <Select
                  value={String(newSkill.level)}
                  onValueChange={(value) => handleNewSkillChange("level", Number(value))}
                >
                  <SelectTrigger id="skillLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="skillYears" className="sr-only">Years</Label>
              <Input
                id="skillYears"
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsOfExp || 0}
                onChange={(e) => handleNewSkillChange("yearsOfExp", Number(e.target.value))}
                placeholder="Years"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.name.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? "Adding..." : "Add Skill"}
            </Button>
            <div className="text-sm">
              {saveStatus === "success" && <p className="text-green-600">Skill added successfully!</p>}
              {saveStatus === "error" && <p className="text-destructive">Failed to add skill.</p>}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}