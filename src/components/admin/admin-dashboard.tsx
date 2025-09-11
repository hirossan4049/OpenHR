"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Users, Folder, Settings, Code } from "lucide-react";

export function AdminDashboard() {
  const t = useTranslations("AdminDashboard");

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalMembers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">+180.1% from last month</p> {/* Placeholder data */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeProjects")}</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+150</div> {/* Placeholder data */}
            <p className="text-xs text-muted-foreground">+19% from last month</p> {/* Placeholder data */}
          </CardContent>
        </Card>
      </div>

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
