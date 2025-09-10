"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Github, Mail, User } from "lucide-react";
import { use } from "react";
import { api } from "~/trpc/react";
import { Link } from "~/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface MemberDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: MemberDetailPageProps) {
  const { id } = use(params);
  const t = useTranslations("MemberDetail");

  const { data: member, isLoading, error } = api.user.getMemberById.useQuery({ id });

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 4) return "default";
    if (level >= 3) return "secondary";
    return "outline";
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
    return labels[level] || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
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
      <div className="container mx-auto py-8">
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
        </div>
      </div>
    </div>
  );
}