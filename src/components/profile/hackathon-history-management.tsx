"use client";

import { Calendar, ExternalLink, FolderGit2, Plus, Trash2, Trophy, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";

interface HackathonParticipation {
  id: string;
  hackathon: { id: string; title: string } | null;
  externalHackathonName: string | null;
  externalHackathonUrl: string | null;
  externalHackathonDate: Date | null;
  portfolio: { id: string; title: string; url: string | null; imageUrl: string | null } | null;
  role: string;
  ranking: number | null;
  awards: string[];
  participatedAt: Date;
}

interface Portfolio {
  id: string;
  title: string;
  url: string | null;
  imageUrl: string | null;
  projectType: string;
}

export function HackathonHistoryManagement() {
  const t = useTranslations("HackathonHistoryManagement");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    externalHackathonName: "",
    externalHackathonUrl: "",
    externalHackathonDate: "",
    role: "participant" as "participant" | "organizer" | "judge" | "mentor",
    ranking: "",
    awards: [] as string[],
    portfolioId: "",
    participatedAt: "",
  });
  const [newAward, setNewAward] = useState("");

  const utils = api.useUtils();

  // Queries
  const { data: participations = [], isLoading } = api.user.getMyHackathonHistory.useQuery();
  const { data: portfolios = [] } = api.user.getMyPortfolios.useQuery();

  // Mutations
  const addMutation = api.user.addHackathonParticipation.useMutation({
    onSuccess: () => {
      utils.user.getMyHackathonHistory.invalidate();
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const updateMutation = api.user.updateHackathonParticipation.useMutation({
    onSuccess: () => {
      utils.user.getMyHackathonHistory.invalidate();
      resetForm();
      setIsDialogOpen(false);
      setEditingId(null);
    },
  });

  const deleteMutation = api.user.deleteHackathonParticipation.useMutation({
    onSuccess: () => {
      utils.user.getMyHackathonHistory.invalidate();
      setDeleteConfirmId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      externalHackathonName: "",
      externalHackathonUrl: "",
      externalHackathonDate: "",
      role: "participant",
      ranking: "",
      awards: [],
      portfolioId: "",
      participatedAt: "",
    });
    setNewAward("");
  };

  const openAddDialog = () => {
    resetForm();
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (participation: HackathonParticipation) => {
    setEditingId(participation.id);
    setFormData({
      externalHackathonName: participation.externalHackathonName || "",
      externalHackathonUrl: participation.externalHackathonUrl || "",
      externalHackathonDate: participation.externalHackathonDate
        ? new Date(participation.externalHackathonDate).toISOString().split("T")[0]!
        : "",
      role: participation.role as "participant" | "organizer" | "judge" | "mentor",
      ranking: participation.ranking?.toString() || "",
      awards: participation.awards || [],
      portfolioId: participation.portfolio?.id || "",
      participatedAt: new Date(participation.participatedAt).toISOString().split("T")[0]!,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = {
      externalHackathonName: formData.externalHackathonName || undefined,
      externalHackathonUrl: formData.externalHackathonUrl || undefined,
      externalHackathonDate: formData.externalHackathonDate
        ? new Date(formData.externalHackathonDate)
        : undefined,
      role: formData.role,
      ranking: formData.ranking ? parseInt(formData.ranking) : undefined,
      awards: formData.awards.length > 0 ? formData.awards : undefined,
      portfolioId: formData.portfolioId || undefined,
      participatedAt: formData.participatedAt
        ? new Date(formData.participatedAt)
        : undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      addMutation.mutate(data);
    }
  };

  const addAward = () => {
    if (newAward.trim()) {
      setFormData((prev) => ({
        ...prev,
        awards: [...prev.awards, newAward.trim()],
      }));
      setNewAward("");
    }
  };

  const removeAward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
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

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const isSubmitting = addMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
        ) : participations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t("empty")}</div>
        ) : (
          <div className="space-y-4">
            {participations.map((participation: HackathonParticipation) => {
              const hackathonName =
                participation.hackathon?.title ||
                participation.externalHackathonName ||
                t("unknownHackathon");
              const isExternal = !participation.hackathon && participation.externalHackathonName;

              return (
                <div
                  key={participation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {participation.externalHackathonUrl ? (
                            <a
                              href={participation.externalHackathonUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {hackathonName}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            hackathonName
                          )}
                        </h4>
                        {isExternal && (
                          <Badge variant="outline" className="text-xs">
                            {t("externalBadge")}
                          </Badge>
                        )}
                      </div>
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
                      {participation.awards.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {participation.awards.map((award, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Trophy className="h-3 w-3 mr-1" />
                              {award}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {(participation.externalHackathonDate || participation.participatedAt) && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(participation.externalHackathonDate || participation.participatedAt)}
                          </div>
                        )}
                        {participation.portfolio && (
                          <div className="flex items-center gap-1">
                            <FolderGit2 className="h-3 w-3" />
                            <span>{participation.portfolio.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(participation)}
                      >
                        {t("edit")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmId(participation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addButton")}
        </Button>
      </CardFooter>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? t("editTitle") : t("addTitle")}</DialogTitle>
            <DialogDescription>
              {editingId ? t("editDescription") : t("addDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hackathonName">{t("fieldHackathonName")}</Label>
              <Input
                id="hackathonName"
                value={formData.externalHackathonName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, externalHackathonName: e.target.value }))
                }
                placeholder={t("placeholderHackathonName")}
              />
            </div>
            <div>
              <Label htmlFor="hackathonUrl">{t("fieldHackathonUrl")}</Label>
              <Input
                id="hackathonUrl"
                type="url"
                value={formData.externalHackathonUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, externalHackathonUrl: e.target.value }))
                }
                placeholder={t("placeholderHackathonUrl")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hackathonDate">{t("fieldDate")}</Label>
                <Input
                  id="hackathonDate"
                  type="date"
                  value={formData.externalHackathonDate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, externalHackathonDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="role">{t("fieldRole")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      role: value as "participant" | "organizer" | "judge" | "mentor",
                    }))
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">{t("roleParticipant")}</SelectItem>
                    <SelectItem value="organizer">{t("roleOrganizer")}</SelectItem>
                    <SelectItem value="judge">{t("roleJudge")}</SelectItem>
                    <SelectItem value="mentor">{t("roleMentor")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="ranking">{t("fieldRanking")}</Label>
              <Input
                id="ranking"
                type="number"
                min="1"
                value={formData.ranking}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, ranking: e.target.value }))
                }
                placeholder={t("placeholderRanking")}
              />
            </div>
            <div>
              <Label>{t("fieldAwards")}</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder={t("placeholderAward")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAward();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addAward}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.awards.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.awards.map((award, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {award}
                      <button
                        type="button"
                        onClick={() => removeAward(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {portfolios.length > 0 && (
              <div>
                <Label htmlFor="portfolio">{t("fieldPortfolio")}</Label>
                <Select
                  value={formData.portfolioId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, portfolioId: value }))
                  }
                >
                  <SelectTrigger id="portfolio">
                    <SelectValue placeholder={t("placeholderPortfolio")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("noPortfolio")}</SelectItem>
                    {portfolios.map((portfolio: Portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.externalHackathonName.trim()}
            >
              {isSubmitting ? t("saving") : editingId ? t("save") : t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>{t("deleteDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && deleteMutation.mutate({ id: deleteConfirmId })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
