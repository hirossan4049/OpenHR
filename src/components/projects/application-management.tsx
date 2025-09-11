"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Card, CardContent } from "~/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "~/components/ui/use-toast";

interface ApplicationManagementProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

interface RespondDialogState {
  applicationId: string;
  applicantName: string;
  status: "approved" | "rejected";
}

export function ApplicationManagement({ projectId, projectTitle, onClose }: ApplicationManagementProps) {
  const t = useTranslations("ApplicationManagement");
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>();
  const [respondDialog, setRespondDialog] = useState<RespondDialogState | null>(null);
  const [responseMessage, setResponseMessage] = useState("");

  const { data: applications, isLoading } = api.project.getApplications.useQuery({
    projectId,
    status: statusFilter,
  });

  const respondToApplication = api.project.respondToApplication.useMutation({
    onSuccess: () => {
      const isApproved = respondDialog?.status === "approved";
      toast({ 
        title: isApproved ? t("approveSuccess") : t("rejectSuccess"), 
        variant: "success" 
      });
      setRespondDialog(null);
      setResponseMessage("");
      void utils.project.getApplications.invalidate({ projectId });
    },
    onError: (error) => {
      toast({ title: t("error"), variant: "destructive" });
      console.error("Respond to application error:", error);
    },
  });

  const utils = api.useUtils();

  const handleRespond = (applicationId: string, applicantName: string, status: "approved" | "rejected") => {
    setRespondDialog({ applicationId, applicantName, status });
    setResponseMessage("");
  };

  const handleSubmitResponse = () => {
    if (!respondDialog) return;

    respondToApplication.mutate({
      applicationId: respondDialog.applicationId,
      status: respondDialog.status,
      response: responseMessage.trim() || undefined,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">{t("pending")}</Badge>;
      case "approved":
        return <Badge variant="default">{t("approved")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("rejected")}</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description")}
              <br />
              <strong>{projectTitle}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Filter */}
            <div className="mb-4">
              <Select 
                value={statusFilter || "all"} 
                onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filterAll")}</SelectItem>
                  <SelectItem value="pending">{t("filterPending")}</SelectItem>
                  <SelectItem value="approved">{t("filterApproved")}</SelectItem>
                  <SelectItem value="rejected">{t("filterRejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                Loading applications...
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (!applications || applications.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                {t("noApplications")}
              </div>
            )}

            {/* Applications List */}
            {!isLoading && applications && applications.length > 0 && (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {/* Applicant Info */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={application.applicant.image || undefined} />
                          <AvatarFallback>
                            {application.applicant.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">
                                {application.applicant.name || "Unknown"}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Applied {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(application.status)}
                              {getStatusBadge(application.status)}
                            </div>
                          </div>

                          {/* Bio */}
                          {application.applicant.bio && (
                            <p className="text-sm text-muted-foreground">
                              {application.applicant.bio}
                            </p>
                          )}

                          {/* Skills */}
                          {application.applicant.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {application.applicant.skills.map((skill) => (
                                  <Badge key={skill.id} variant="outline" className="text-xs">
                                    {skill.name} (Lv.{skill.level})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Application Message */}
                          {application.message && (
                            <div>
                              <p className="text-sm font-medium mb-1">Application Message:</p>
                              <p className="text-sm bg-muted p-3 rounded">
                                {application.message}
                              </p>
                            </div>
                          )}

                          {/* Response */}
                          {application.response && (
                            <div>
                              <p className="text-sm font-medium mb-1">Your Response:</p>
                              <p className="text-sm bg-blue-50 p-3 rounded">
                                {application.response}
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          {application.status === "pending" && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleRespond(application.id, application.applicant.name || "Unknown", "approved")}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                {t("approve")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRespond(application.id, application.applicant.name || "Unknown", "rejected")}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                {t("reject")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      {respondDialog && (
        <Dialog open onOpenChange={() => setRespondDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("respondDialog")}</DialogTitle>
              <DialogDescription>
                {t("respondDescription")}
                <br />
                <strong>{respondDialog.applicantName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="responseMessage">{t("responseMessage")}</Label>
                <Textarea
                  id="responseMessage"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={t("responsePlaceholder")}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {responseMessage.length}/1000 characters
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRespondDialog(null)}
                disabled={respondToApplication.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                onClick={handleSubmitResponse}
                disabled={respondToApplication.isPending}
                variant={respondDialog.status === "approved" ? "default" : "destructive"}
              >
                {respondToApplication.isPending 
                  ? t("processing") 
                  : (respondDialog.status === "approved" ? t("approveButton") : t("rejectButton"))
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}