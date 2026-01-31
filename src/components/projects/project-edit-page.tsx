"use client";

import { api } from "~/trpc/react";
import { ProjectForm } from "./project-form";
import { useTranslations } from "next-intl";
import { Link } from "~/navigation";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ProjectEditPageProps {
  projectId: string;
}

export function ProjectEditPage({ projectId }: ProjectEditPageProps) {
  const t = useTranslations("ProjectDetail");
  const { data: project, isLoading, error } = api.project.getById.useQuery({ id: projectId });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">{t("notFound")}</h1>
          <p className="text-muted-foreground mb-4">{t("notFoundDescription")}</p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToList")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Transform project data for the form
  const initialData = {
    title: project.title,
    description: project.description,
    readme: project.readme || undefined,
    type: project.type as "project" | "event",
    maxMembers: project.maxMembers || undefined,
    startDate: project.startDate || undefined,
    endDate: project.endDate || undefined,
    requiredSkills: project.requiredSkills.map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      minLevel: skill.minLevel,
      priority: skill.priority as "required" | "preferred",
    })),
  };

  return (
    <ProjectForm 
      projectId={project.id} 
      initialData={initialData}
    />
  );
}