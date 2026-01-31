"use client";

import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { CreatableSkillSelect } from "~/components/ui/creatable-skill-select";
import { api } from "~/trpc/react";

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
    level: 3, // Default to Intermediate
    yearsOfExp: 0,
  });
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [errors, setErrors] = useState<Partial<Record<keyof SkillData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [removingSkillId, setRemovingSkillId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const t = useTranslations("SkillManagement");
  const tLevel = useTranslations("SkillLevel");

  // Generate level options with translations
  const levelOptions = [
    { value: 1, label: tLevel("level1") },
    { value: 2, label: tLevel("level2") },
    { value: 3, label: tLevel("level3") },
    { value: 4, label: tLevel("level4") },
    { value: 5, label: tLevel("level5") },
  ];

  const getLevelDisplay = (level: number) => {
    const label = levelOptions.find(opt => opt.value === level)?.label ?? tLevel("unknown");
    return tLevel("levelWithNumber", { level, label });
  };

  // tRPC queries for skill search and suggestions
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults = [], isLoading: isSearching } = api.user.searchSkills.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length >= 1 }
  );
  
  const suggestSkillMutation = api.user.suggestSkill.useMutation();

  useEffect(() => {
    onSkillsChange?.(skills);
  }, [skills, onSkillsChange]);

  // Handle skill creation from CreatableSkillSelect
  const handleCreateSkill = async (skillName: string) => {
    try {
      // Optimistically set the name so the Add button enables
      setNewSkill(prev => ({ ...prev, name: skillName }));
      const result = await suggestSkillMutation.mutateAsync({
        name: skillName,
        category: undefined,
      });
      
      if (result.created) {
        // Skill was created, now use it
        setSelectedSkillId(result.skill.id);
        setNewSkill(prev => ({ ...prev, name: result.skill.name }));
      } else {
        // Skill already existed, use the existing one
        setSelectedSkillId(result.skill.id);
        setNewSkill(prev => ({ ...prev, name: result.skill.name }));
      }
    } catch (error) {
      console.error("Error creating skill:", error);
      setSaveStatus("error");
    }
  };

  // Handle skill selection from dropdown
  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId);
    // Find the skill in search results or existing skills
    const selectedSkill = searchResults.find(s => s.id === skillId);
    if (selectedSkill) {
      setNewSkill(prev => ({ ...prev, name: selectedSkill.name }));
    }
  };

  const handleAddSkill = async () => {
    setErrors({});
    setSaveStatus("idle");

    try {
      const validatedSkill = skillSchema.parse(newSkill);

      if (skills.some(skill => skill.name.toLowerCase() === validatedSkill.name.toLowerCase())) {
        setErrors({ name: t("exists") });
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
      setSelectedSkillId("");
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

  const requestRemoveSkill = (skillId: string) => {
    setPendingRemovalId(skillId);
    setRemoveError(null);
  };

  const confirmRemoveSkill = async () => {
    if (!pendingRemovalId) return;
    setRemovingSkillId(pendingRemovalId);
    setRemoveError(null);
    try {
      const response = await fetch(`/api/skills/${pendingRemovalId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove skill");
      setSkills(prev => prev.filter(s => s.id !== pendingRemovalId));
    } catch (error) {
      console.error("Error removing skill:", error);
      setRemoveError("Failed to remove skill. Please try again.");
    } finally {
      setRemovingSkillId(null);
      setPendingRemovalId(null);
    }
  };

  const cancelRemove = () => {
    setPendingRemovalId(null);
    setRemoveError(null);
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
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">{t("columnSkill")}</TableHead>
                <TableHead>{t("columnLevel")}</TableHead>
                <TableHead>{t("columnYears")}</TableHead>
                <TableHead className="text-right">{t("columnActions")}</TableHead>
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
                          <SelectValue placeholder={t("placeholderSelectLevel")} />
                        </SelectTrigger>
                        <SelectContent>
                          {levelOptions.map(opt => (
                            <SelectItem key={opt.value} value={String(opt.value)}>{getLevelDisplay(opt.value)}</SelectItem>
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
                        aria-label={t("columnYears")}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {pendingRemovalId === skill.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={confirmRemoveSkill}
                            disabled={removingSkillId === skill.id}
                          >
                            {removingSkillId === skill.id ? t("buttonRemoving") : t("buttonConfirm")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelRemove}
                            disabled={removingSkillId === skill.id}
                          >
                            {t("buttonCancel")}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => requestRemoveSkill(skill.id)}
                          aria-label="Remove skill"
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    {t("empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <div className="w-full">
          <h4 className="text-sm font-medium mb-3">{t("addSectionTitle", { defaultValue: "Add New Skill" })}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <CreatableSkillSelect
                skills={searchResults}
                value={selectedSkillId}
                onValueChange={handleSkillSelect}
                onCreateSkill={handleCreateSkill}
                onSearchChange={setSearchQuery}
                placeholder={t("placeholderName", { defaultValue: "e.g., React, Python..." })}
                emptyText={t("noSkillsFound", { defaultValue: "No skills found." })}
                searchPlaceholder={t("searchSkills", { defaultValue: "Search skills..." })}
                createText={t("createSkill", { search: "{search}", defaultValue: "Create \"{search}\"" })}
                isLoading={isSearching || suggestSkillMutation.isPending}
                ariaLabel={t("columnSkill")}
              />
              {/* Input removed: Select is the primary entry */}
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="skillLevel" className="sr-only">{t("columnLevel")}</Label>
              <Select
                value={String(newSkill.level)}
                onValueChange={(value) => handleNewSkillChange("level", Number(value))}
              >
            <SelectTrigger id="skillLevel" aria-label={t("columnLevel")}>
              <SelectValue placeholder={t("placeholderSelectLevel")} />
            </SelectTrigger>
                <SelectContent>
                  {levelOptions.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{getLevelDisplay(opt.value)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skillYears" className="sr-only">{t("columnYears")}</Label>
              <Input
                id="skillYears"
                type="number"
                min="0"
                max="50"
                value={newSkill.yearsOfExp || 0}
                onChange={(e) => handleNewSkillChange("yearsOfExp", Number(e.target.value))}
                placeholder={t("placeholderYears")}
                aria-label={t("columnYears")}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.name.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {isLoading ? t("buttonAdding", { defaultValue: "Adding..." }) : t("buttonAdd", { defaultValue: "Add Skill" })}
            </Button>
            <div className="text-sm space-y-1 text-right">
              {saveStatus === "success" && <p className="text-green-600">{t("successAdd")}</p>}
              {saveStatus === "error" && <p className="text-destructive">{t("errorAdd")}</p>}
              {removeError && <p className="text-destructive">{t("errorRemove")}</p>}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
