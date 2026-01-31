"use client";

import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "~/navigation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ArrowLeft, Calendar, MapPin, Settings, Users, MessageSquare, Plus } from "lucide-react";
import { useState } from "react";
import { ApplicationForm } from "./application-form";
import { ApplicationManagement } from "./application-management";
import { MarkdownViewer } from "~/components/ui/markdown-viewer";
import { Input } from "~/components/ui/input";
import { toast } from "~/components/ui/use-toast";
import * as React from "react";
// Free-text role input (no select)

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const t = useTranslations("ProjectDetail");
  const { data: session } = useSession();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showApplicationManagement, setShowApplicationManagement] = useState(false);

  const { data: project, isLoading, error } = api.project.getById.useQuery({ id: projectId });

  // tRPC utils for cache invalidation
  const utils = api.useUtils();

  // Organizer flag can be used in hooks below; safe when project is undefined
  const isOrganizer = !!(session?.user?.id && project?.organizer?.id && session.user.id === project.organizer.id);

  const updateRecruitmentStatus = api.project.updateRecruitmentStatus.useMutation({
    onSuccess: () => {
      // Refetch project data
      void utils.project.getById.invalidate({ id: projectId });
    },
  });

  // Add member (organizer only)
  const addMember = api.project.addMember.useMutation({
    onSuccess: () => {
      toast({ title: t("memberAddSuccess"), variant: "success" });
      setMemberSearch("");
      void utils.project.getById.invalidate({ id: projectId });
    },
    onError: (err) => {
      toast({ title: t("memberAddError"), variant: "destructive" });
      console.error("Add member error:", err);
    },
  });

  const [memberSearch, setMemberSearch] = useState("");
  const { data: memberCandidates } = api.user.getMembers.useQuery({
    search: memberSearch || undefined,
    limit: 5,
    offset: 0,
  }, { enabled: isOrganizer && !!memberSearch });

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">{t("loading")}</div>
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

  // isOrganizer already computed above using optional chaining
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
                {project.type === "event" ? t("typeEvent") : t("typeProject")}
              </Badge>
              <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                {project.recruitmentStatus === "open" ? t("statusOpen") : t("statusClosed")}
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
            <CardTitle>{t("infoTitle")}</CardTitle>
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

          {/* README */}
          {project.readme && (
            <Card>
              <CardHeader>
                <CardTitle>{t("readme")}</CardTitle>
              </CardHeader>
              <CardContent>
                <MarkdownViewer content={project.readme} />
              </CardContent>
            </Card>
          )}

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
                    {isOrganizer && member.user.id !== project.organizer.id ? (
                      <MemberRoleInput
                        projectId={project.id}
                        userId={member.user.id}
                        value={member.role}
                        onUpdated={() => void utils.project.getById.invalidate({ id: projectId })}
                      />
                    ) : (
                      <Badge variant="outline">{member.role}</Badge>
                    )}
                    {isOrganizer && member.user.id !== project.organizer.id && (
                      <OrganizerRemoveMemberButton projectId={project.id} userId={member.user.id} onRemoved={() => void utils.project.getById.invalidate({ id: projectId })} />
                    )}
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

          {isOrganizer && (
            <Card>
              <CardHeader>
                <CardTitle>{t("addMember")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder={t("searchUsersPlaceholder")}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
                {memberSearch && (memberCandidates?.members?.length ?? 0) > 0 && (
                  <div className="space-y-2">
                    {memberCandidates!.members.map((u) => (
                      <div key={u.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={(u as any).image || undefined} />
                            <AvatarFallback>
                              {u.name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{u.name || "Unknown"}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addMember.mutate({ projectId: project.id, userId: u.id })}
                          disabled={addMember.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {t("add")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t("statsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("members")}</span>
                <span className="font-medium">
                  {project.members.length}
                  {project.maxMembers && ` / ${project.maxMembers}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("status")}</span>
                <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                  {project.recruitmentStatus === "open" ? t("statusOpen") : t("statusClosed")}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("created")}</span>
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

function OrganizerRemoveMemberButton({ projectId, userId, onRemoved }: { projectId: string; userId: string; onRemoved?: () => void }) {
  const t = useTranslations("ProjectDetail");
  const utils = api.useUtils();
  const removeMember = api.project.removeMember.useMutation({
    onSuccess: async () => {
      toast({ title: t("memberRemoveSuccess"), variant: "success" });
      await utils.project.getById.invalidate({ id: projectId });
      onRemoved?.();
    },
    onError: () => {
      toast({ title: t("memberRemoveError"), variant: "destructive" });
    },
  });
  return (
    <Button
      size="sm"
      variant="outline"
      className="ml-2 text-destructive border-destructive"
      onClick={() => removeMember.mutate({ projectId, userId })}
      disabled={removeMember.isPending}
      aria-label={t("removeMemberAria", { defaultValue: "Remove member" })}
    >
      {t("remove")}
    </Button>
  );
}

function MemberRoleInput({ projectId, userId, value, onUpdated }: { projectId: string; userId: string; value: string; onUpdated?: () => void }) {
  const t = useTranslations("ProjectDetail");
  const utils = api.useUtils();
  const [roleText, setRoleText] = React.useState(value || "");
  const updateRole = api.project.updateMemberRole.useMutation({
    onSuccess: async () => {
      toast({ title: t("memberRoleUpdateSuccess"), variant: "success" });
      await utils.project.getById.invalidate({ id: projectId });
      onUpdated?.();
    },
    onError: () => {
      toast({ title: t("memberRoleUpdateError"), variant: "destructive" });
    },
  });

  const commit = () => {
    const trimmed = roleText.trim();
    if (!trimmed || trimmed === value) return;
    updateRole.mutate({ projectId, userId, role: trimmed });
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={roleText}
        onChange={(e) => setRoleText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        placeholder={t("rolePlaceholder", { defaultValue: "Role (e.g., Frontend)" })}
        className="h-8 w-40"
        disabled={updateRole.isPending}
      />
      <Button size="sm" variant="outline" onClick={commit} disabled={updateRole.isPending}>
        {t("save", { defaultValue: "Save" })}
      </Button>
    </div>
  );
}
