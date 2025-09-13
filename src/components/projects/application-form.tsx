"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { toast } from "~/components/ui/use-toast";

interface ApplicationFormProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationForm({ projectId, projectTitle, onClose, onSuccess }: ApplicationFormProps) {
  const t = useTranslations("ApplicationForm");
  const [message, setMessage] = useState("");

  const applyToProject = api.project.applyToProject.useMutation({
    onSuccess: () => {
      toast({ title: t("success"), variant: "success" });
      onSuccess();
    },
    onError: (error) => {
      toast({ title: t("error"), variant: "destructive" });
      console.error("Application error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyToProject.mutate({
      projectId,
      message: message.trim() || undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
            <br />
            <strong>{projectTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">{t("fieldMessage")}</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("fieldMessagePlaceholder")}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/1000 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={applyToProject.isPending}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={applyToProject.isPending}
            >
              {applyToProject.isPending ? t("applying") : t("apply")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
