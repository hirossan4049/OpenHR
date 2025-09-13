"use client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Search, PlusCircle, User, Calendar, MapPin } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Link } from "~/navigation";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export function ProjectList() {
  const t = useTranslations("ProjectList");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"project" | "event" | undefined>();
  const [statusFilter, setStatusFilter] = useState<"open" | "closed" | undefined>();

  const { data, isLoading, error } = api.project.getAll.useQuery({
    search: search || undefined,
    type: typeFilter,
    recruitmentStatus: statusFilter,
    limit: 20,
    offset: 0,
  });

  const projects = data?.projects || [];

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
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder={t("searchPlaceholder")} 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex gap-4 flex-wrap">
          <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? undefined : value as "project" | "event")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterAll")}</SelectItem>
              <SelectItem value="project">{t("filterProjects")}</SelectItem>
              <SelectItem value="event">{t("filterEvents")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as "open" | "closed")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filterAll")}</SelectItem>
              <SelectItem value="open">{t("filterOpen")}</SelectItem>
              <SelectItem value="closed">{t("filterClosed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          {t("loading")}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-destructive">
          {t("errorLoading", { message: error.message })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <h3 className="text-lg font-semibold">{t("noProjects")}</h3>
            <p>{t("noProjectsDescription")}</p>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("createProject")}
            </Link>
          </Button>
        </div>
      )}

      {/* Project List */}
      {!isLoading && !error && projects.length > 0 && (
        <div className="border rounded-lg">
          <ul className="divide-y">
            {projects.map((project) => (
              <li key={project.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        href={{ pathname: "/projects/[id]", params: { id: project.id } }} 
                        className="font-semibold text-primary hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge variant={project.type === "event" ? "secondary" : "outline"}>
                        {project.type === "event" ? t("typeEvent") : t("typeProject")}
                      </Badge>
                      <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                        {project.recruitmentStatus === "open" ? t("statusOpen") : t("statusClosed")}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Dates */}
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        {project.startDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(project.startDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {project.endDate && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{t("until")} {new Date(project.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Required Skills */}
                    {project.requiredSkills.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {project.requiredSkills.slice(0, 5).map((skill) => (
                          <Badge 
                            key={skill.skillId} 
                            variant={skill.priority === "required" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {skill.skillName}
                            <span className="ml-1 text-xs">
                              {skill.priority === "required" ? t("required") : t("preferred")}
                            </span>
                          </Badge>
                        ))}
                        {project.requiredSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            {t("moreCount", { count: project.requiredSkills.length - 5 })}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3 text-right">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{t("members", { count: project.memberCount })}</span>
                        {project.maxMembers && (
                          <span className="text-xs">/{project.maxMembers}</span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-medium">{t("by", { organizer: project.organizer.name || "Unknown" })}</span>
                        {project.applicationCount > 0 && (
                          <span className="text-xs text-blue-600">
                            {t("applications", { count: project.applicationCount })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
