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
import { Github, Mail, User, Trophy, Calendar, Briefcase, FileText, ExternalLink, PlusCircle, Pencil } from "lucide-react";
import { TagPill } from "~/components/ui/tag-pill";
import { RolePill } from "~/components/ui/role-pill";
import { api } from "~/trpc/react";
import { Button as UiButton } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "~/components/ui/use-toast";
import { Link } from "~/navigation";

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

const detectPlatformFromUrl = (url: string): Article["platform"] => {
  try {
    const host = new URL(url).hostname;
    if (host.includes("qiita")) return "qiita";
    if (host.includes("zenn")) return "zenn";
    if (host.includes("note")) return "note";
    return host.includes("blog") ? "blog" : "other";
  } catch {
    return "other";
  }
};

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
  const [portfolioDialog, setPortfolioDialog] = useState<{ open: boolean; mode: "create" | "edit"; data?: Portfolio }>({ open: false, mode: "create" });
  const [articleDialog, setArticleDialog] = useState<{ open: boolean; mode: "create" | "edit"; data?: Article }>({ open: false, mode: "create" });
  const utils = api.useUtils();
  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    url: "",
    projectType: "personal" as Portfolio["projectType"],
    technologies: "",
    startDate: "",
    endDate: "",
  });
  const [articleForm, setArticleForm] = useState({
    title: "",
    url: "",
    platform: "qiita",
    publishedAt: "",
    description: "",
    tags: "",
  });
  const [isFetchingArticleMeta, setIsFetchingArticleMeta] = useState(false);

  const portfolioCreate = api.portfolio.create.useMutation({
    onSuccess: async () => {
      toast({ title: "作品を追加しました" });
      await utils.portfolio.getMyPortfolios.invalidate();
      closePortfolioDialog();
    },
    onError: () => toast({ title: "作品の保存に失敗しました", variant: "destructive" }),
  });

  const portfolioUpdate = api.portfolio.update.useMutation({
    onSuccess: async () => {
      toast({ title: "作品を更新しました" });
      await utils.portfolio.getMyPortfolios.invalidate();
      closePortfolioDialog();
    },
    onError: () => toast({ title: "作品の更新に失敗しました", variant: "destructive" }),
  });

  const articleCreate = api.article.create.useMutation({
    onSuccess: async () => {
      toast({ title: "記事を追加しました" });
      await utils.article.getMyArticles.invalidate();
      closeArticleDialog();
    },
    onError: () => toast({ title: "記事の保存に失敗しました", variant: "destructive" }),
  });

  const articleUpdate = api.article.update.useMutation({
    onSuccess: async () => {
      toast({ title: "記事を更新しました" });
      await utils.article.getMyArticles.invalidate();
      closeArticleDialog();
    },
    onError: () => toast({ title: "記事の更新に失敗しました", variant: "destructive" }),
  });

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

  // Auto-fetch article metadata when URL is provided
  useEffect(() => {
    if (!articleDialog.open) return;
    const url = articleForm.url.trim();
    if (!url || !/^https?:\/\//.test(url)) return;

    const handler = setTimeout(async () => {
      try {
        setIsFetchingArticleMeta(true);
        const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        if (!res.ok) return;
        const data = await res.json();
        setArticleForm((prev) => ({
          ...prev,
          title: prev.title || data.title || prev.title,
          description: prev.description || data.description || prev.description,
          platform: prev.platform === "qiita" ? detectPlatformFromUrl(url) : prev.platform,
        }));
      } catch (error) {
        console.error("Failed to fetch article metadata", error);
      } finally {
        setIsFetchingArticleMeta(false);
      }
    }, 600);

    return () => clearTimeout(handler);
  }, [articleForm.url, articleDialog.open]);

  const handleProfileSave = (data: UserProfile) => {
    setProfile((prev) => ({ ...prev, ...data }));
    setIsEditing(false);
  };

  const openPortfolioDialog = (mode: "create" | "edit", data?: Portfolio) => {
    setPortfolioDialog({ open: true, mode, data });
    setPortfolioForm({
      title: data?.title ?? "",
      description: data?.description ?? "",
      url: data?.url ?? "",
      projectType: data?.projectType ?? "personal",
      technologies: data?.technologies ? JSON.parse(data.technologies).join(", ") : "",
      startDate: data?.startDate ? data.startDate.slice(0, 10) : "",
      endDate: data?.endDate ? data.endDate.slice(0, 10) : "",
    });
  };

  const closePortfolioDialog = () => {
    setPortfolioDialog({ open: false, mode: "create" });
    setPortfolioForm({
      title: "",
      description: "",
      url: "",
      projectType: "personal",
      technologies: "",
      startDate: "",
      endDate: "",
    });
  };

  const submitPortfolio = () => {
    const payload = {
      title: portfolioForm.title.trim(),
      description: portfolioForm.description.trim(),
      url: portfolioForm.url.trim() || undefined,
      projectType: portfolioForm.projectType,
      technologies: portfolioForm.technologies
        ? portfolioForm.technologies.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      startDate: portfolioForm.startDate ? new Date(portfolioForm.startDate) : undefined,
      endDate: portfolioForm.endDate ? new Date(portfolioForm.endDate) : undefined,
      imageUrl: undefined as string | undefined,
      isPublic: true,
    };

    if (portfolioDialog.mode === "edit" && portfolioDialog.data) {
      portfolioUpdate.mutate({ id: portfolioDialog.data.id, ...payload });
    } else {
      portfolioCreate.mutate(payload);
    }
  };

  const openArticleDialog = (mode: "create" | "edit", data?: Article) => {
    setArticleDialog({ open: true, mode, data });
    setArticleForm({
      title: data?.title ?? "",
      url: data?.url ?? "",
      platform: data?.platform ?? "qiita",
      publishedAt: data?.publishedAt ? data.publishedAt.slice(0, 10) : "",
      description: data?.description ?? "",
      tags: data?.tags ? JSON.parse(data.tags).join(", ") : "",
    });
  };

  const closeArticleDialog = () => {
    setArticleDialog({ open: false, mode: "create" });
    setArticleForm({
      title: "",
      url: "",
      platform: "qiita",
      publishedAt: "",
      description: "",
      tags: "",
    });
  };

  const submitArticle = () => {
    const payload = {
      title: articleForm.title.trim(),
      url: articleForm.url.trim(),
      platform: articleForm.platform as Article["platform"],
      publishedAt: articleForm.publishedAt ? new Date(articleForm.publishedAt) : undefined,
      description: articleForm.description.trim() || undefined,
      tags: articleForm.tags
        ? articleForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      isPublic: true,
    };

    if (articleDialog.mode === "edit" && articleDialog.data) {
      articleUpdate.mutate({ id: articleDialog.data.id, ...payload });
    } else {
      articleCreate.mutate(payload);
    }
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
                  <div className="flex gap-2 pt-2">
                    <UiButton size="sm" onClick={() => openPortfolioDialog("create")}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      作品を追加
                    </UiButton>
                  </div>
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
                                <UiButton variant="ghost" size="icon" onClick={() => openPortfolioDialog("edit", portfolio)}>
                                  <Pencil className="h-4 w-4" />
                                </UiButton>
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
                  <div className="flex gap-2 pt-2">
                    <UiButton size="sm" onClick={() => openArticleDialog("create")}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      記事を追加
                    </UiButton>
                  </div>
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
                                <UiButton variant="ghost" size="icon" onClick={() => openArticleDialog("edit", article)}>
                                  <Pencil className="h-4 w-4" />
                                </UiButton>
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
                  <div className="pt-2">
                    <UiButton variant="outline" size="sm" asChild>
                      <Link href="/projects">ハッカソン案件を探す</Link>
                    </UiButton>
                  </div>
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
                  <div className="flex gap-2 pt-2">
                    <UiButton size="sm" asChild>
                      <Link href="/projects/new">プロジェクトを作成</Link>
                    </UiButton>
                    <UiButton variant="outline" size="sm" asChild>
                      <Link href="/my">自分のプロジェクトを編集</Link>
                    </UiButton>
                  </div>
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

      {/* Portfolio Dialog */}
      <Dialog open={portfolioDialog.open} onOpenChange={(open) => open ? setPortfolioDialog((prev) => ({ ...prev, open })) : closePortfolioDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{portfolioDialog.mode === "edit" ? "作品を編集" : "作品を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="portfolio-title">タイトル</Label>
              <Input
                id="portfolio-title"
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="作品名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-description">概要</Label>
              <Textarea
                id="portfolio-description"
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="どんな作品か簡単に書いてください"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>種別</Label>
                <Select
                  value={portfolioForm.projectType}
                  onValueChange={(value) => setPortfolioForm((prev) => ({ ...prev, projectType: value as Portfolio["projectType"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">個人開発</SelectItem>
                    <SelectItem value="team">チーム開発</SelectItem>
                    <SelectItem value="hackathon">ハッカソン</SelectItem>
                    <SelectItem value="assignment">課題</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio-url">URL</Label>
                <Input
                  id="portfolio-url"
                  value={portfolioForm.url}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolio-technologies">使用技術（カンマ区切り）</Label>
              <Input
                id="portfolio-technologies"
                value={portfolioForm.technologies}
                onChange={(e) => setPortfolioForm((prev) => ({ ...prev, technologies: e.target.value }))}
                placeholder="React, Next.js, Prisma"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="portfolio-start">開始日</Label>
                <Input
                  id="portfolio-start"
                  type="date"
                  value={portfolioForm.startDate}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio-end">終了日</Label>
                <Input
                  id="portfolio-end"
                  type="date"
                  value={portfolioForm.endDate}
                  onChange={(e) => setPortfolioForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <UiButton variant="outline" onClick={closePortfolioDialog}>キャンセル</UiButton>
            <UiButton onClick={submitPortfolio} disabled={portfolioCreate.isPending || portfolioUpdate.isPending}>
              {portfolioDialog.mode === "edit" ? "更新" : "追加"}
            </UiButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Dialog */}
      <Dialog open={articleDialog.open} onOpenChange={(open) => open ? setArticleDialog((prev) => ({ ...prev, open })) : closeArticleDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{articleDialog.mode === "edit" ? "記事を編集" : "記事を追加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="article-title">タイトル</Label>
              <Input
                id="article-title"
                value={articleForm.title}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="記事タイトル"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-url">URL</Label>
              <Input
                id="article-url"
                value={articleForm.url}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
              <p className="text-xs text-muted-foreground">
                URLを入力するとタイトルと概要を自動取得します。
                {isFetchingArticleMeta && <span className="ml-1">取得中…</span>}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>プラットフォーム</Label>
                <Select
                  value={articleForm.platform}
                  onValueChange={(value) => setArticleForm((prev) => ({ ...prev, platform: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qiita">Qiita</SelectItem>
                    <SelectItem value="zenn">Zenn</SelectItem>
                    <SelectItem value="note">note</SelectItem>
                    <SelectItem value="blog">ブログ</SelectItem>
                    <SelectItem value="other">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="article-date">公開日</Label>
                <Input
                  id="article-date"
                  type="date"
                  value={articleForm.publishedAt}
                  onChange={(e) => setArticleForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-description">概要</Label>
              <Textarea
                id="article-description"
                value={articleForm.description}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="どんな内容の記事か簡単に書いてください"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="article-tags">タグ（カンマ区切り）</Label>
              <Input
                id="article-tags"
                value={articleForm.tags}
                onChange={(e) => setArticleForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Next.js, TypeScript"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <UiButton variant="outline" onClick={closeArticleDialog}>キャンセル</UiButton>
            <UiButton onClick={submitArticle} disabled={articleCreate.isPending || articleUpdate.isPending}>
              {articleDialog.mode === "edit" ? "更新" : "追加"}
            </UiButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
