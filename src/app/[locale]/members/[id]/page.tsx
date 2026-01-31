"use client";

import { ArrowLeft, Calendar, ExternalLink, FileText, FolderGit2, Github, Mail, Trophy, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Link } from "~/navigation";
import { api } from "~/trpc/react";

export default function MemberDetailPage() {
  const params = useParams();
  const id = (params as { id?: string })?.id ?? "";
  const t = useTranslations("MemberDetail");

  const { data: member, isLoading, error } = api.user.getMemberById.useQuery(
    { id },
    {
      enabled: Boolean(id),
      retry: false,
    }
  );

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 4) return "default";
    if (level >= 3) return "secondary";
    return "outline";
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
    return labels[level] || "Unknown";
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      participant: t("roleParticipant"),
      organizer: t("roleOrganizer"),
      judge: t("roleJudge"),
      mentor: t("roleMentor"),
    };
    return roleMap[role] || role;
  };

  const getProjectTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      personal: t("projectTypePersonal"),
      hackathon: t("projectTypeHackathon"),
      team: t("projectTypeTeam"),
      assignment: t("projectTypeAssignment"),
    };
    return typeMap[type] || type;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const getPlatformIcon = (_platform: string) => {
    return <FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8" data-testid="member-loading">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container mx-auto py-8" data-testid="member-not-found">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToDirectory")}
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("memberNotFound")}</h3>
          <p className="text-muted-foreground">{t("memberNotFoundDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToDirectory")}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mt-4">
          {member.name || t("noName")}
        </h1>
        {member.grade && (
          <p className="text-xl text-muted-foreground">{member.grade}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={member.image || undefined} alt={member.name || ""} />
                <AvatarFallback className="text-2xl">
                  {member.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{member.name || t("noName")}</CardTitle>
              {member.grade && (
                <p className="text-muted-foreground">{member.grade}</p>
              )}
              {/* Tags */}
              {member.tags && member.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {member.tags.map((tag: { id: string; name: string; color: string }) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, color: "#fff" }}
                      className="text-xs"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {member.contact && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.contact}</span>
                  </div>
                )}
                {member.githubUrl && (
                  <div className="flex items-center gap-3">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      GitHub Profile
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {member.bio && (
            <Card>
              <CardHeader>
                <CardTitle>{t("aboutSection")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>{t("skillsSection")}</CardTitle>
            </CardHeader>
            <CardContent>
              {member.skills.length === 0 ? (
                <p className="text-muted-foreground">{t("noSkills")}</p>
              ) : (
                <div className="space-y-4">
                  {/* Group skills by category */}
                  {Object.entries(
                    member.skills.reduce((acc: Record<string, any[]>, skill: any) => {
                      const category = skill.category || t("uncategorized");
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(skill);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(skills as any[]).map((skill: any) => (
                          <Badge
                            key={skill.id}
                            variant={getLevelBadgeVariant(skill.level)}
                          >
                            <span className="font-medium">{skill.name}</span>
                            <span className="ml-2 text-xs opacity-75">
                              {getLevelLabel(skill.level)}
                              {skill.yearsOfExp && ` • ${skill.yearsOfExp}y`}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Portfolios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5" />
                {t("portfoliosSection")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!member.portfolios || member.portfolios.length === 0 ? (
                <p className="text-muted-foreground">{t("noPortfolios")}</p>
              ) : (
                <div className="space-y-4">
                  {member.portfolios.map((portfolio: any) => (
                    <div
                      key={portfolio.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">{portfolio.title}</h4>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {getProjectTypeLabel(portfolio.projectType)}
                          </Badge>
                          {portfolio.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {portfolio.description}
                            </p>
                          )}
                          {portfolio.technologies && portfolio.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {portfolio.technologies.map((tech: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(portfolio.startDate || portfolio.endDate) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(portfolio.startDate)}
                              {portfolio.endDate && ` - ${formatDate(portfolio.endDate)}`}
                            </div>
                          )}
                        </div>
                        {portfolio.url && (
                          <a
                            href={portfolio.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              {t("viewProject")}
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("articlesSection")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!member.articles || member.articles.length === 0 ? (
                <p className="text-muted-foreground">{t("noArticles")}</p>
              ) : (
                <div className="space-y-4">
                  {member.articles.map((article: any) => (
                    <div
                      key={article.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(article.platform)}
                            <h4 className="font-semibold">{article.title}</h4>
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {article.platform}
                          </Badge>
                          {article.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {article.description}
                            </p>
                          )}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {article.publishedAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(article.publishedAt)}
                            </div>
                          )}
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2"
                        >
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {t("readArticle")}
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hackathon History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                {t("hackathonHistorySection")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!member.hackathonHistory || member.hackathonHistory.length === 0 ? (
                <p className="text-muted-foreground">{t("noHackathonHistory")}</p>
              ) : (
                <div className="space-y-4">
                  {member.hackathonHistory.map((participation: any) => (
                    <div
                      key={participation.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {participation.hackathon?.title || "Unknown Hackathon"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getRoleLabel(participation.role)}
                            </Badge>
                            {participation.ranking && (
                              <Badge variant="default" className="text-xs">
                                {t("ranking", { ranking: participation.ranking })}
                              </Badge>
                            )}
                          </div>
                          {participation.awards && participation.awards.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {participation.awards.map((award: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {award}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {participation.participatedAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(participation.participatedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
