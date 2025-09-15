"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Folder, Settings, Code, MessageSquare, TrendingUp, Clock, FileText } from "lucide-react";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";

export function AdminDashboard() {
  const t = useTranslations("AdminDashboard");
  
  const { data: stats, isLoading: statsLoading } = api.admin.getDashboardStats.useQuery();
  const { data: activities, isLoading: activitiesLoading } = api.admin.getRecentActivities.useQuery({
    limit: 5,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalMembers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("activeUsers", { count: stats?.activeUsers ?? 0 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalProjects")}</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.totalProjects ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("totalEvents", { count: stats?.totalEvents ?? 0 })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("recentApplications")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.recentApplications ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("lastSevenDays")}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pendingApplications")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.pendingApplications ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("needsReview")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("recentProjects")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : activities?.recentProjects.length ? (
              <div className="space-y-3">
                {activities.recentProjects.map((project) => (
                  <div key={project.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{project.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("by")} {project.organizer.name} • {t(project.type === "event" ? "event" : "project")}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noRecentProjects")}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("recentApplicationsActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : activities?.recentApplications.length ? (
              <div className="space-y-3">
                {activities.recentApplications.map((application) => (
                  <div key={application.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{application.applicant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("appliedTo")} {application.project.title}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noRecentApplications")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("manageUsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage user accounts, roles, and permissions.</p>
            <Button asChild>
              <a href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                {t("manageUsers")}
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("manageProjects")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Oversee and manage all projects and events.</p>
            <Button asChild>
              <a href="/admin/projects">
                <Folder className="mr-2 h-4 w-4" />
                {t("manageProjects")}
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("manageSkills")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Manage skill master database, verification, and merging.</p>
            <Button asChild>
              <a href="/admin/skills">
                <Code className="mr-2 h-4 w-4" />
                {t("manageSkills")}
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("manageDiscord")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Sync Discord server members and manage integrations.</p>
            <Button asChild>
              <a href="/admin/discord">
                <MessageSquare className="mr-2 h-4 w-4" />
                {t("manageDiscord")}
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("systemSettings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Configure system-wide settings and preferences.</p>
            <Button asChild>
              <a href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                {t("systemSettings")}
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
