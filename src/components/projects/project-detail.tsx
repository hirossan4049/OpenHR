"use client";

import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "~/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ArrowLeft, Calendar, MapPin, Settings, Users, MessageSquare } from "lucide-react";
import { useState } from "react";
import { ApplicationForm } from "./application-form";
import { ApplicationManagement } from "./application-management";

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const t = useTranslations("ProjectDetail");
  const { data: session } = useSession();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationManagement, setShowApplicationManagement] = useState(false);

  const { data: project, isLoading, error } = api.project.getById.useQuery({ id: projectId });

  const updateRecruitmentStatus = api.project.updateRecruitmentStatus.useMutation({
    onSuccess: () => {
      // Refetch project data
      void utils.project.getById.invalidate({ id: projectId });
    },
  });

  const utils = api.useUtils();

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

  const isOrganizer = session?.user?.id === project.organizer.id;
  const isMember = project.members.some(member => member.user.id === session?.user?.id);
  const canApply = session && !isOrganizer && !isMember && project.recruitmentStatus === "open";

  const handleToggleRecruitment = () => {
    const newStatus = project.recruitmentStatus === "open" ? "closed" : "open";
    updateRecruitmentStatus.mutate({
      projectId: project.id,
      status: newStatus,
    });
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToList")}
          </Link>
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <Badge variant={project.type === "event" ? "secondary" : "outline"}>
                {project.type === "event" ? "Event" : "Project"}
              </Badge>
              <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                {project.recruitmentStatus === "open" ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOrganizer && (
              <>
                <Button variant="outline" asChild>
                  <Link href={{ pathname: "/projects/[id]/edit", params: { id: project.id } }}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("editProject")}
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowApplicationManagement(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t("manageApplications")}
                  {project.pendingApplicationsCount > 0 && (
                    <Badge className="ml-2" variant="destructive">
                      {project.pendingApplicationsCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleRecruitment}
                  disabled={updateRecruitmentStatus.isPending}
                >
                  {project.recruitmentStatus === "open" ? t("closeRecruitment") : t("openRecruitment")}
                </Button>
              </>
            )}
            
            {canApply && (
              <Button onClick={() => setShowApplicationForm(true)}>
                {t("applyButton")}
              </Button>
            )}
            
            {!canApply && session && !isOrganizer && (
              <Button disabled>
                {isMember ? t("alreadyMember") : 
                 project.recruitmentStatus === "closed" ? t("recruitmentClosed") : 
                 t("alreadyApplied")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(project.startDate || project.endDate) && (
                <div className="flex gap-4">
                  {project.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{t("startDate")}:</strong> {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {project.endDate && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{t("endDate")}:</strong> {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {project.maxMembers && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {t("maxMembers", { max: project.maxMembers })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle>{t("requiredSkills")}</CardTitle>
            </CardHeader>
            <CardContent>
              {project.requiredSkills.length === 0 ? (
                <p className="text-muted-foreground">{t("noRequiredSkills")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map((skill) => (
                    <Badge 
                      key={skill.skillId}
                      variant={skill.priority === "required" ? "destructive" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {skill.skillName}
                      <span className="text-xs">
                        Lv.{skill.minLevel}
                      </span>
                      <span className="text-xs opacity-75">
                        ({skill.priority === "required" ? t("required") : t("preferred")})
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle>{t("members")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback>
                        {member.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.user.name || "Unknown"}</p>
                      {member.user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{member.user.bio}</p>
                      )}
                    </div>
                    <Badge variant="outline">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>{t("organizer")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.organizer.image || undefined} />
                  <AvatarFallback>
                    {project.organizer.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.organizer.name || "Unknown"}</p>
                  {project.organizer.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.organizer.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Members</span>
                <span className="font-medium">
                  {project.members.length}
                  {project.maxMembers && ` / ${project.maxMembers}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                  {project.recruitmentStatus === "open" ? "Open" : "Closed"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Form Dialog */}
      {showApplicationForm && (
        <ApplicationForm 
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            void utils.project.getById.invalidate({ id: projectId });
          }}
        />
      )}

      {/* Application Management Dialog */}
      {showApplicationManagement && isOrganizer && (
        <ApplicationManagement
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setShowApplicationManagement(false)}
        />
      )}
    </div>
  );
}
