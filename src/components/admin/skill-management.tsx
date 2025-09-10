"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Edit2, Search, Trash2 } from "lucide-react";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";

interface SkillMaster {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logoUrl: string | null;
  aliases?: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    userSkills: number;
  };
}

export function AdminSkillManagement() {
  const t = useTranslations("AdminSkillManagement");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingSkill, setEditingSkill] = useState<SkillMaster | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hiddenLogoIds, setHiddenLogoIds] = useState<Set<string>>(new Set());
  
  // Fetch skills with usage statistics
  const { data: skills = [], isLoading, refetch } = api.admin.getAllSkillsWithStats.useQuery();
  
  // Mutations
  const updateSkillMutation = api.admin.updateSkill.useMutation({
    onSuccess: () => {
      refetch();
      setIsEditDialogOpen(false);
      setEditingSkill(null);
    },
  });
  
  const deleteSkillMutation = api.admin.deleteSkill.useMutation({
    onSuccess: () => refetch(),
  });
  // Note: merge skills mutation available in API but not used here

  // Filter skills based on search and category
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch = !searchQuery || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.aliases?.some((alias: string) => alias.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(
      skills
        .map((s) => s.category)
        .filter((c): c is string => Boolean(c))
    )
  );

  const handleEditSkill = (skill: SkillMaster) => {
    setEditingSkill(skill);
    setIsEditDialogOpen(true);
  };

  const handleSaveSkill = () => {
    if (!editingSkill) return;
    
    updateSkillMutation.mutate({
      id: editingSkill.id,
      name: editingSkill.name,
      slug: editingSkill.slug,
      category: editingSkill.category || null,
      logoUrl: editingSkill.logoUrl || null,
      aliases: editingSkill.aliases || [],
      verified: editingSkill.verified,
    });
  };

  const handleDeleteSkill = (skillId: string) => {
    if (confirm(t("confirmDelete"))) {
      deleteSkillMutation.mutate({ id: skillId });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>
            {t("description")}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="search">{t("searchLabel")}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[200px]">
              <Label htmlFor="category-filter">{t("categoryFilter")}</Label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="">{t("allCategories")}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columnLogo")}</TableHead>
                  <TableHead>{t("columnName")}</TableHead>
                  <TableHead>{t("columnCategory")}</TableHead>
                  <TableHead>{t("columnAliases")}</TableHead>
                  <TableHead>{t("columnUsage")}</TableHead>
                  <TableHead>{t("columnStatus")}</TableHead>
                  <TableHead className="text-right">{t("columnActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredSkills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("noSkills")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell>
                        {skill.logoUrl && !hiddenLogoIds.has(skill.id) ? (
                          <Image
                            src={skill.logoUrl}
                            alt={skill.name}
                            width={24}
                            height={24}
                            className="rounded"
                            onError={() => setHiddenLogoIds(prev => {
                              const next = new Set(prev);
                              next.add(skill.id);
                              return next;
                            })}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{skill.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {skill.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {skill.category && (
                          <Badge variant="outline">{skill.category}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {skill.aliases && skill.aliases.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {skill.aliases.join(", ")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {skill._count?.userSkills || 0} {t("users")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {skill.verified ? (
                            <Badge variant="default" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              {t("verified")}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {t("unverified")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSkill(skill)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSkill(skill.id)}
                            disabled={deleteSkillMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Skill Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editSkillTitle")}</DialogTitle>
            <DialogDescription>
              {t("editSkillDescription")}
            </DialogDescription>
          </DialogHeader>
          
          {editingSkill && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t("fieldName")}</Label>
                <Input
                  id="edit-name"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-slug">{t("fieldSlug")}</Label>
                <Input
                  id="edit-slug"
                  value={editingSkill.slug}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, slug: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">{t("fieldCategory")}</Label>
                <Input
                  id="edit-category"
                  value={editingSkill.category || ""}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, category: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-logo">{t("fieldLogoUrl")}</Label>
                <Input
                  id="edit-logo"
                  value={editingSkill.logoUrl || ""}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, logoUrl: e.target.value } : null)}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-aliases">{t("fieldAliases")}</Label>
                <Textarea
                  id="edit-aliases"
                  value={editingSkill.aliases?.join("\n") || ""}
                  onChange={(e) => setEditingSkill(prev => prev ? { 
                    ...prev, 
                    aliases: e.target.value.split("\n").filter(a => a.trim()) 
                  } : null)}
                  placeholder={t("aliasesPlaceholder")}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-verified"
                  checked={editingSkill.verified}
                  onChange={(e) => setEditingSkill(prev => prev ? { ...prev, verified: e.target.checked } : null)}
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-verified">{t("fieldVerified")}</Label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button 
              onClick={handleSaveSkill}
              disabled={updateSkillMutation.isPending}
            >
              {updateSkillMutation.isPending ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
