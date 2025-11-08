"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ProfileEditForm } from "~/components/profile/profile-edit-form";
import { SkillManagement } from "~/components/profile/skill-management";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Github, Mail, User, Trophy, Calendar, Briefcase, FileText, ExternalLink } from "lucide-react";
import { TagPill } from "~/components/ui/tag-pill";
import { RolePill } from "~/components/ui/role-pill";
import { api } from "~/trpc/react";

interface UserProfile {
  name: string;
  bio?: string;
  grade?: string;
  contact?: string;
  githubUrl?: string;
  userTags?: Array<{ tag: { id: string; name: string; color: string; description?: string | null } }>
  role?: "ADMIN" | "MEMBER" | "VIEWER";
}

interface UserSkill {
  id: string;
  skillId: string;
  name: string;
  level: number;
  yearsOfExp?: number;
}

interface HackathonParticipation {
  id: string;
  hackathon: {
    id: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
  };
  role: string;
  ranking: number | null;
  awards: string | null;
  participatedAt: string;
}

interface Portfolio {
  id: string;
  title: string;
  description: string;
  url: string | null;
  imageUrl: string | null;
  projectType: string;
  technologies: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  url: string;
  platform: string;
  publishedAt: string | null;
  description: string | null;
  tags: string | null;
  createdAt: string;
}

export function ProfilePage() {
  const t = useTranslations("ProfilePage");
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [hackathonHistory, setHackathonHistory] = useState<HackathonParticipation[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfileData();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  // Use tRPC queries
  const { data: portfolioData } = api.portfolio.getMyPortfolios.useQuery(undefined, {
    enabled: status === "authenticated"
  });
  const { data: articleData } = api.article.getMyArticles.useQuery(undefined, {
    enabled: status === "authenticated"
  });

  const fetchProfileData = async () => {
    try {
      const [profileResponse, skillsResponse, hackathonResponse] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/skills"),
        fetch("/api/hackathon-history"),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);
      }

      if (hackathonResponse.ok) {
        const hackathonData = await hackathonResponse.json();
        setHackathonHistory(hackathonData);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update portfolios and articles when data changes
  useEffect(() => {
    if (portfolioData) {
      const formattedPortfolios = portfolioData.map(p => ({
        ...p,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
      }));
      setPortfolios(formattedPortfolios);
    }
  }, [portfolioData]);

  useEffect(() => {
    if (articleData) {
      const formattedArticles = articleData.map(a => ({
        ...a,
        publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
        createdAt: a.createdAt.toISOString(),
      }));
      setArticles(formattedArticles);
    }
  }, [articleData]);

  const handleProfileSave = (data: UserProfile) => {
    setProfile((prev) => ({ ...prev, ...data }));
    setIsEditing(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="container py-8">
        <ProfileEditForm
          initialData={profile || undefined}
          onSave={handleProfileSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="mb-4 h-24 w-24">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0) ?? session?.user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile?.name ?? session?.user?.name}</h1>
                {profile?.role && (
                  <div className="mt-2"><RolePill role={profile.role} /></div>
                )}
                <p className="text-muted-foreground">{profile?.grade}</p>
                <p className="mt-2 text-sm text-muted-foreground text-center">{profile?.bio}</p>
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{session?.user?.email}</span>
                </div>
                {profile?.contact && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.contact}</span>
                  </div>
                )}
                {profile?.githubUrl && (
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      GitHub Profile
                    </a>
                  </div>
                )}
                {profile?.userTags && profile.userTags.length > 0 && (
                  <div className="pt-2">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">Tags</div>
                    <div className="flex flex-wrap gap-1">
                      {profile.userTags.map(({ tag }) => (
                        <TagPill key={tag.id} name={tag.name} color={tag.color} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button className="mt-6 w-full" onClick={() => setIsEditing(true)}>
                {t("editProfile")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <Tabs defaultValue="skills">
            <TabsList className="grid w-full grid-cols-6 text-xs">
              <TabsTrigger value="skills">{t("skills")}</TabsTrigger>
              <TabsTrigger value="portfolios">作品</TabsTrigger>
              <TabsTrigger value="articles">記事</TabsTrigger>
              <TabsTrigger value="hackathons">ハッカソン</TabsTrigger>
              <TabsTrigger value="projects">{t("projects")}</TabsTrigger>
              <TabsTrigger value="activity">{t("activity")}</TabsTrigger>
            </TabsList>
            <TabsContent value="skills">
                <SkillManagement
                  initialSkills={skills}
                  onSkillsChange={setSkills}
                />
            </TabsContent>
            <TabsContent value="portfolios">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    ポートフォリオ
                  </CardTitle>
                  <CardDescription>作成した作品やアプリケーションの一覧です。</CardDescription>
                </CardHeader>
                <CardContent>
                  {portfolios.length > 0 ? (
                    <div className="space-y-4">
                      {portfolios.map((portfolio) => {
                        const technologies = portfolio.technologies ? JSON.parse(portfolio.technologies) : [];
                        return (
                          <div key={portfolio.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{portfolio.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                  {portfolio.projectType === 'personal' ? '個人開発' :
                                   portfolio.projectType === 'hackathon' ? 'ハッカソン' :
                                   portfolio.projectType === 'team' ? 'チーム開発' : '課題'}
                                </span>
                                {portfolio.url && (
                                  <a href={portfolio.url} target="_blank" rel="noopener noreferrer"
                                     className="text-blue-600 hover:text-blue-800">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{portfolio.description}</p>

                            {technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {technologies.map((tech: string, index: number) => (
                                  <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                            {(portfolio.startDate || portfolio.endDate) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {portfolio.startDate && new Date(portfolio.startDate).toLocaleDateString()}
                                {portfolio.startDate && portfolio.endDate && ' - '}
                                {portfolio.endDate && new Date(portfolio.endDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">まだポートフォリオが登録されていません。</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    技術記事
                  </CardTitle>
                  <CardDescription>執筆した技術記事やブログの一覧です。</CardDescription>
                </CardHeader>
                <CardContent>
                  {articles.length > 0 ? (
                    <div className="space-y-4">
                      {articles.map((article) => {
                        const tags = article.tags ? JSON.parse(article.tags) : [];
                        return (
                          <div key={article.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">
                                <a href={article.url} target="_blank" rel="noopener noreferrer"
                                   className="hover:text-blue-600 flex items-center gap-2">
                                  {article.title}
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                  {article.platform === 'qiita' ? 'Qiita' :
                                   article.platform === 'zenn' ? 'Zenn' :
                                   article.platform === 'note' ? 'note' :
                                   article.platform === 'blog' ? 'ブログ' : 'その他'}
                                </span>
                                {article.publishedAt && (
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(article.publishedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            {article.description && (
                              <p className="text-muted-foreground text-sm mb-3">{article.description}</p>
                            )}

                            {tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {tags.map((tag: string, index: number) => (
                                  <span key={index} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">まだ記事が登録されていません。</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="hackathons">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Hackathon History
                  </CardTitle>
                  <CardDescription>Your participation history in hackathons.</CardDescription>
                </CardHeader>
                <CardContent>
                  {hackathonHistory.length > 0 ? (
                    <div className="space-y-4">
                      {hackathonHistory.map((participation) => {
                        const awards = participation.awards ? JSON.parse(participation.awards) : [];
                        return (
                          <div key={participation.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{participation.hackathon.title}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(participation.participatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{participation.hackathon.description}</p>

                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                {participation.role}
                              </span>
                              {participation.ranking && (
                                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                                  #{participation.ranking}
                                </span>
                              )}
                            </div>

                            {awards.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {awards.map((award: string, index: number) => (
                                  <span key={index} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    {award}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hackathon participation history yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>{t("projects")}</CardTitle>
                  <CardDescription>Projects you have participated in.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No projects to display yet.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>{t("activity")}</CardTitle>
                  <CardDescription>Your recent activity in the community.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
