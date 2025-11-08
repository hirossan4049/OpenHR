"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  MessageSquare,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "~/navigation";
import { api } from "~/trpc/react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { status, data: session } = useSession();
  const isAuthenticated = status === "authenticated";
  const userId = session?.user?.id;

  const projectsQuery = api.project.getMyProjects.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const applicationsQuery = api.project.getMyApplications.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const portfoliosQuery = api.portfolio.getMyPortfolios.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const articlesQuery = api.article.getMyArticles.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const profileQuery = api.user.getMemberById.useQuery(
    { id: userId ?? "" },
    {
      enabled: isAuthenticated && Boolean(userId),
    },
  );
  const recommendedQuery = api.project.getAll.useQuery({
    limit: 4,
    offset: 0,
    recruitmentStatus: "open",
  });

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t("signInTitle")}</h1>
          <p className="text-muted-foreground">{t("signInDescription")}</p>
          <Button asChild>
            <Link href="/api/auth/signin">{t("signInCta")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const projects = projectsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];
  const portfolios = portfoliosQuery.data ?? [];
  const articles = articlesQuery.data ?? [];
  const skills = profileQuery.data?.skills ?? [];
  const recommendedProjects = recommendedQuery.data?.projects ?? [];

  const openProjects = projects.filter((project) => project.recruitmentStatus === "open").length;
  const pendingApplications = applications.filter((app) => app.status === "pending").length;
  const approvedApplications = applications.filter((app) => app.status === "approved").length;
  const rejectedApplications = applications.filter((app) => app.status === "rejected").length;

  const statsCards = [
    {
      title: t("stats.activeProjects"),
      value: projectsQuery.isLoading ? "…" : openProjects,
      description: t("stats.totalProjects", { count: projects.length }),
      icon: Rocket,
    },
    {
      title: t("stats.pendingApplications"),
      value: applicationsQuery.isLoading ? "…" : pendingApplications,
      description: t("stats.totalApplications", { count: applications.length }),
      icon: Clock,
    },
    {
      title: t("stats.skills"),
      value: profileQuery.isLoading ? "…" : skills.length,
      description: t("stats.skillsDescription"),
      icon: Target,
    },
    {
      title: t("stats.showcaseItems"),
      value: portfoliosQuery.isLoading || articlesQuery.isLoading ? "…" : portfolios.length + articles.length,
      description: t("stats.portfolioDescription"),
      icon: Sparkles,
    },
  ];

  const quickActions = [
    {
      label: t("quickActions.newProject.label"),
      description: t("quickActions.newProject.description"),
      href: "/projects/new",
      icon: FolderKanban,
    },
    {
      label: t("quickActions.browseProjects.label"),
      description: t("quickActions.browseProjects.description"),
      href: "/projects",
      icon: ArrowUpRight,
    },
    {
      label: t("quickActions.updateProfile.label"),
      description: t("quickActions.updateProfile.description"),
      href: "/profile",
      icon: Users,
    },
  ];
  type ApplicationStatus = "pending" | "approved" | "rejected";
  const applicationStatusLabels: Record<ApplicationStatus, string> = {
    pending: t("applicationStatus.pending"),
    approved: t("applicationStatus.approved"),
    rejected: t("applicationStatus.rejected"),
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title", { name: session?.user?.name ?? "" })}
          </h1>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <FolderKanban className="mr-2 h-4 w-4" />
            {t("cta.createProject")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t("sections.myProjects")}</CardTitle>
              <CardDescription>{t("sections.myProjectsDescription")}</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/my">
                {t("actions.viewAll")}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projectsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            ) : projects.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("empty.projects")}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Link
                          href={{ pathname: "/projects/[id]", params: { id: project.id } }}
                          className="font-semibold hover:underline"
                        >
                          {project.title}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <Badge variant={project.type === "event" ? "secondary" : "outline"}>
                            {project.type === "event" ? t("project.typeEvent") : t("project.typeProject")}
                          </Badge>
                          <Badge variant={project.recruitmentStatus === "open" ? "default" : "secondary"}>
                            {project.recruitmentStatus === "open"
                              ? t("project.statusOpen")
                              : t("project.statusClosed")}
                          </Badge>
                          <span>
                            {t("projects.members", { count: project._count.members })}
                            {project.maxMembers ? `/${project.maxMembers}` : ""}
                          </span>
                        </div>
                      </div>
                      {project._count.applications > 0 && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <MessageSquare className="h-4 w-4" />
                          {t("projects.pendingApplications", { count: project._count.applications })}
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.applications")}</CardTitle>
            <CardDescription>{t("sections.applicationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("applications.pending", { count: pendingApplications })}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("applications.approved", { count: approvedApplications })}</span>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("applications.rejected", { count: rejectedApplications })}</span>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              {applicationsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">{t("loading")}</p>
              ) : applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("empty.applications")}</p>
              ) : (
                applications.slice(0, 3).map((application) => (
                  <div key={application.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between font-medium">
                      <Link
                        href={{ pathname: "/projects/[id]", params: { id: application.project.id } }}
                        className="hover:underline"
                      >
                        {application.project.title}
                      </Link>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {applicationStatusLabels[application.status as ApplicationStatus]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("applications.appliedOn", {
                        date: new Date(application.createdAt).toLocaleDateString(),
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t("sections.portfolio")}</CardTitle>
              <CardDescription>{t("sections.portfolioDescription")}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/profile">{t("actions.addPortfolio")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">{t("actions.addArticle")}</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t("portfolioSummary.portfoliosLabel")}</p>
                <p className="text-2xl font-bold">{portfolios.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t("portfolioSummary.articlesLabel")}</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t("sections.skillsHighlight")}</p>
              {profileQuery.isLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">{t("loading")}</p>
              ) : skills.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">{t("empty.skills")}</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.slice(0, 6).map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="text-xs">
                      {skill.name} · Lv{skill.level}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.quickActions")}</CardTitle>
            <CardDescription>{t("sections.quickActionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map(({ label, description, href, icon: Icon }) => (
              <Button key={href} variant="outline" className="w-full justify-start" asChild>
                <Link href={href}>
                  <Icon className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{t("sections.recommendations")}</CardTitle>
            <CardDescription>{t("sections.recommendationsDescription")}</CardDescription>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/projects">
              {t("actions.goToProjects")}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recommendedQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          ) : recommendedProjects.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {t("empty.recommendations")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendedProjects.map((project) => (
                <div key={project.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={{ pathname: "/projects/[id]", params: { id: project.id } }}
                        className="font-semibold hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge variant="outline">{t("project.statusOpen")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {project.requiredSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill.skillId} variant="secondary" className="text-xs">
                          {skill.skillName}
                        </Badge>
                      ))}
                      {project.requiredSkills.length === 0 && (
                        <span>{t("recommendation.noSkills")}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("recommendation.members", { count: project.memberCount })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild>
            <Link href="/members">{t("actions.findMembers")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
