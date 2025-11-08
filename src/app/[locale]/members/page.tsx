"use client";

import { Filter, LayoutGrid, List, Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Link } from "~/navigation";
import { api } from "~/trpc/react";

export default function MembersDirectoryPage() {
  const t = useTranslations("MembersDirectory");
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // allow user to control how many items are shown per page
  const [pageSize, setPageSize] = useState<number>(25);

  // Fetch members with search and filters
  const { data: membersData, isLoading: membersLoading } = api.user.getMembers.useQuery({
    search: search || undefined,
    skillId: skillFilter || undefined,
    limit: pageSize,
    offset: currentPage * pageSize,
  });

  // Fetch all skills for filter dropdown
  const { data: skills } = api.user.getAllSkills.useQuery();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const handleSkillFilterChange = (value: string) => {
    setSkillFilter(value === "all" ? undefined : value);
    setCurrentPage(0); // Reset to first page when filtering
  };

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 4) return "default";
    if (level >= 3) return "secondary";
    return "outline";
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", "Beginner", "Basic", "Intermediate", "Advanced", "Expert"];
    return labels[level] || "Unknown";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <Label htmlFor="search">{t("searchLabel")}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search"
              data-testid="search-input"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="min-w-[200px]">
          <Label htmlFor="skill-filter">{t("skillFilterLabel")}</Label>
          <Select value={skillFilter || "all"} onValueChange={handleSkillFilterChange}>
            <SelectTrigger id="skill-filter" data-testid="skill-filter-trigger">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allSkills")}</SelectItem>
              {skills?.map((skill: any) => (
                <SelectItem key={skill.id} value={skill.id}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Items per page control */}
        <div className="min-w-[160px]">
          <Label htmlFor="items-per-page">{t("itemsPerPageLabel")}</Label>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(0); }}
          >
            <SelectTrigger id="items-per-page" data-testid="items-per-page-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <Label className="sr-only">{t("viewModeLabel")}</Label>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
            title={t("viewModeGrid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
            title={t("viewModeList")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results Count */}
      {membersData && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          {t("resultsCount", { count: membersData.total })}
        </div>
      )}

      {/* Members Grid or List */}
      {membersLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {membersData?.members.length === 0 ? (
            <div className="text-center py-12" data-testid="no-results">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("noResults")}</h3>
              <p className="text-muted-foreground">{t("noResultsDescription")}</p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {membersData?.members.map((member: any) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow" data-testid="member-card">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.image || undefined} alt={member.name || ""} />
                          <AvatarFallback>
                            {member.name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">
                            <Link
                              href={{
                                pathname: "/members/[id]" as const,
                                params: { id: member.id }
                              }}
                              className="hover:underline"
                            >
                              {member.name || t("noName")}
                            </Link>
                          </CardTitle>
                          {member.grade && (
                            <p className="text-sm text-muted-foreground">{member.grade}</p>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground mb-4 overflow-hidden">
                            {member.bio.length > 100 ? `${member.bio.substring(0, 100)}...` : member.bio}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 3).map((skill: any) => (
                            <Badge
                              key={skill.id}
                              variant={getLevelBadgeVariant(skill.level)}
                              className="text-xs"
                            >
                              {skill.name} ({getLevelLabel(skill.level)})
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} {t("moreSkills")}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // List view using Table
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("searchLabel")}</TableHead>
                        <TableHead>{t("grade")}</TableHead>
                        <TableHead>{t("description")}</TableHead>
                        <TableHead>{t("skillFilterLabel")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {membersData?.members.map((member: any) => (
                        <TableRow key={member.id} className="align-top">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.image || undefined} alt={member.name || ""} />
                                <AvatarFallback>{member.name?.charAt(0) || "?"}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  <Link
                                    href={{ pathname: "/members/[id]" as const, params: { id: member.id } }}
                                    className="hover:underline"
                                  >
                                    {member.name || t("noName")}
                                  </Link>
                                </div>
                                {member.bio && (
                                  <div className="text-xs text-muted-foreground truncate">{member.bio}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground w-36">{member.grade || "-"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[40ch] truncate">
                            {member.bio || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {member.skills.slice(0, 5).map((skill: any) => (
                                <Badge key={skill.id} variant={getLevelBadgeVariant(skill.level)} className="text-xs">
                                  {skill.name}
                                </Badge>
                              ))}
                              {member.skills.length > 5 && (
                                <Badge variant="outline" className="text-xs">+{member.skills.length - 5}</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {membersData && membersData.members.length > 0 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                data-testid="pagination-prev"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t("previousPage")}
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                {t("pageInfo", {
                  current: currentPage + 1,
                  total: Math.ceil((membersData.total || 0) / pageSize)
                })}
              </span>
              <Button
                variant="outline"
                data-testid="pagination-next"
                disabled={!membersData.hasMore}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t("nextPage")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}