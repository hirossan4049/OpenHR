"use client";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Search, PlusCircle, GitFork, Star, User } from "lucide-react";
import { Link } from "~/navigation";
import { useTranslations } from "next-intl";

// Placeholder data
const projects = [
  {
    id: 1,
    title: "Community Website Renewal",
    description: "Revamping the official community website with Next.js and Tailwind CSS.",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    members: 5,
    organizer: "Admin",
  },
  {
    id: 2,
    title: "Discord Bot for Auto-roles",
    description: "Developing a new Discord bot to automate role assignments based on skills.",
    skills: ["Node.js", "Discord.js", "TypeScript"],
    members: 3,
    organizer: "John Doe",
  },
  {
    id: 3,
    title: "Intro to Docker Workshop",
    description: "Planning and hosting a workshop for beginners to learn Docker.",
    skills: ["Docker", "Public Speaking"],
    members: 2,
    organizer: "Jane Smith",
  },
];

export function ProjectList() {
  const t = useTranslations("ProjectList");

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("createProject")}
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder={t("searchPlaceholder")} className="pl-10" />
        </div>
        {/* Add filter buttons here if needed */}
      </div>

      {/* Project List */}
      <div className="border rounded-lg">
        <ul className="divide-y">
          {projects.map((project) => (
            <li key={project.id} className="p-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <Link href={`/projects/${project.id}`} className="font-semibold text-primary hover:underline">
                    {project.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                     <div className="flex items-center gap-1">
                       <User className="h-4 w-4" />
                       <span>{t("members", { count: project.members })}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <span className="font-medium">{t("by", { organizer: project.organizer })}</span>
                     </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}