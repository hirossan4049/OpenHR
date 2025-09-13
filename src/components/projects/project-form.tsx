"use client";

import { useState } from "react";
import { useRouter } from "~/navigation";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "~/components/ui/use-toast";
import { CreatableSkillSelect } from "~/components/ui/creatable-skill-select";
import { DatePicker } from "~/components/ui/date-picker";

interface RequiredSkill {
  skillId: string;
  skillName: string;
  minLevel: number;
  priority: "required" | "preferred";
}

interface ProjectFormProps {
  projectId?: string;
  initialData?: {
    title: string;
    description: string;
    type: "project" | "event";
    maxMembers?: number;
    startDate?: Date;
    endDate?: Date;
    requiredSkills: RequiredSkill[];
  };
}

export function ProjectForm({ projectId, initialData }: ProjectFormProps) {
  const t = useTranslations("ProjectForm");
  const tSkills = useTranslations("SkillManagement");
  const router = useRouter();
  const isEditing = !!projectId;

  // Form state
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<"project" | "event">(initialData?.type || "project");
  const [maxMembers, setMaxMembers] = useState<string>(initialData?.maxMembers?.toString() || "");
  const [startDate, setStartDate] = useState<string>(
    initialData?.startDate ? initialData.startDate.toISOString().slice(0, 10) : ""
  );
  const [endDate, setEndDate] = useState<string>(
    initialData?.endDate ? initialData.endDate.toISOString().slice(0, 10) : ""
  );
  const [startTime, setStartTime] = useState<string>(
    initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(11, 16) : ""
  );
  const [endTime, setEndTime] = useState<string>(
    initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(11, 16) : ""
  );
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>(initialData?.requiredSkills || []);
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  // API queries and mutations
  const { data: skills = [] } = api.user.searchSkills.useQuery(
    { query: skillSearchTerm, limit: 20 },
    { enabled: skillSearchTerm.length >= 1 }
  );

  const suggestSkill = api.user.suggestSkill.useMutation({
    onError: () => {
      toast({ title: t("createError"), variant: "destructive" });
    },
  });

  const createProject = api.project.create.useMutation({
    onSuccess: (project) => {
      toast({ title: t("createSuccess"), variant: "success" });
      router.push({ pathname: "/projects/[id]", params: { id: project.id } });
    },
    onError: (error) => {
      toast({ title: t("createError"), variant: "destructive" });
      console.error("Create project error:", error);
    },
  });

  const updateProject = api.project.update.useMutation({
    onSuccess: (project) => {
      toast({ title: t("updateSuccess"), variant: "success" });
      router.push({ pathname: "/projects/[id]", params: { id: project.id } });
    },
    onError: (error) => {
      toast({ title: t("updateError"), variant: "destructive" });
      console.error("Update project error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combineLocalDateTime = (dateStr?: string, timeStr?: string) => {
      if (!dateStr) return undefined;
      const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) return undefined;
      const y = parseInt(dateMatch[1]!, 10);
      const m = parseInt(dateMatch[2]!, 10);
      const d = parseInt(dateMatch[3]!, 10);
      if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return new Date(y, m - 1, d);
      const [hhStr, mmStr] = timeStr.split(":");
      const hh = parseInt(hhStr!, 10);
      const mm = parseInt(mmStr!, 10);
      return new Date(y, m - 1, d, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm);
    };

    const formData = {
      title,
      description,
      type,
      maxMembers: maxMembers ? parseInt(maxMembers) : undefined,
      startDate: type === "event"
        ? combineLocalDateTime(startDate, startTime)
        : startDate
          ? new Date(startDate)
          : undefined,
      endDate: type === "event"
        ? combineLocalDateTime(endDate, endTime)
        : endDate
          ? new Date(endDate)
          : undefined,
      requiredSkills: requiredSkills.map(skill => ({
        skillId: skill.skillId,
        minLevel: skill.minLevel,
        priority: skill.priority,
      })),
    };

    if (isEditing && projectId) {
      updateProject.mutate({ id: projectId, ...formData });
    } else {
      createProject.mutate(formData);
    }
  };

  const ymd = (d?: Date) => (d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10) : "");

  const addSkill = (skill: { id: string; name: string }) => {
    if (requiredSkills.find(s => s.skillId === skill.id)) {
      return; // Already added
    }

    setRequiredSkills([
      ...requiredSkills,
      {
        skillId: skill.id,
        skillName: skill.name,
        minLevel: 1,
        priority: "required",
      },
    ]);
    setSkillSearchTerm("");
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skillId !== skillId));
  };

  const updateSkillLevel = (skillId: string, level: number) => {
    setRequiredSkills(requiredSkills.map(s => 
      s.skillId === skillId ? { ...s, minLevel: level } : s
    ));
  };

  const updateSkillPriority = (skillId: string, priority: "required" | "preferred") => {
    setRequiredSkills(requiredSkills.map(s => 
      s.skillId === skillId ? { ...s, priority } : s
    ));
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", t("levelBeginner"), t("levelBasic"), t("levelIntermediate"), t("levelAdvanced"), t("levelExpert")];
    return labels[level] || "";
  };

  const isSubmitting = createProject.isPending || updateProject.isPending;

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {isEditing ? t("editTitle") : t("createTitle")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEditing ? t("editDescription") : t("createDescription")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("fieldTitle")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("fieldTitlePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("fieldDescription")}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("fieldDescriptionPlaceholder")}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">{t("fieldType")}</Label>
                <Select value={type} onValueChange={(value) => setType(value as "project" | "event")}>
                  <SelectTrigger data-testid="type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">{t("typeProject")}</SelectItem>
                    <SelectItem value="event">{t("typeEvent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">{t("fieldMaxMembers")}</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  placeholder={t("fieldMaxMembersPlaceholder")}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("fieldStartDate")}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      date={startDate ? new Date(startDate) : undefined}
                      onChange={(d) => setStartDate(ymd(d))}
                      placeholder={t("fieldStartDate")}
                    />
                  </div>
                  {type === "event" && (
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required={false}
                      className="w-36"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">{t("fieldEndDate")}</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <DatePicker
                      date={endDate ? new Date(endDate) : undefined}
                      onChange={(d) => setEndDate(ymd(d))}
                      placeholder={t("fieldEndDate")}
                    />
                  </div>
                  {type === "event" && (
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required={false}
                      className="w-36"
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Skills */}
        <Card>
          <CardHeader>
            <CardTitle>{t("requiredSkillsTitle")}</CardTitle>
            <CardDescription>{t("requiredSkillsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Skill Search (creatable) */}
            <div className="space-y-2">
              <Label>{t("addSkill")}</Label>
              <CreatableSkillSelect
                skills={skills}
                value={""}
                onValueChange={(skillId) => {
                  const s = skills.find((sk) => sk.id === skillId);
                  if (s) addSkill({ id: s.id, name: s.name });
                }}
                onCreateSkill={async (name) => {
                  const res = await suggestSkill.mutateAsync({ name });
                  const created = res.skill;
                  addSkill({ id: created.id, name: created.name });
                }}
                onSearchChange={(q) => setSkillSearchTerm(q)}
                placeholder={t("skillName")}
                emptyText={tSkills("noSkillsFound")}
                searchPlaceholder={t("addSkill")}
                createText={tSkills("createSkill", { search: "{search}" })}
                ariaLabel={t("addSkill")}
              />
            </div>

            {/* Skills List */}
            {requiredSkills.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {t("noSkillsAdded")}
              </p>
            ) : (
              <div className="space-y-3">
                {requiredSkills.map((skill) => (
                  <div key={skill.skillId} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Badge variant="outline" className="flex-shrink-0">
                      {skill.skillName}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">{t("skillLevel")}</Label>
                      <Select 
                        value={skill.minLevel.toString()} 
                        onValueChange={(value) => updateSkillLevel(skill.skillId, parseInt(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((level) => (
                            <SelectItem key={level} value={level.toString()}>
                              {getLevelLabel(level)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label className="text-xs">{t("skillPriority")}</Label>
                      <Select 
                        value={skill.priority} 
                        onValueChange={(value) => updateSkillPriority(skill.skillId, value as "required" | "preferred")}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">{t("priorityRequired")}</SelectItem>
                          <SelectItem value="preferred">{t("priorityPreferred")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(skill.skillId)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditing ? t("saving") : t("creating"))
              : (isEditing ? t("save") : t("create"))
            }
          </Button>
        </div>
      </form>
    </div>
  );
}
