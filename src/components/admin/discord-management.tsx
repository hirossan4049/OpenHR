"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw, Users, Plus, Eye, Link, Unlink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export function DiscordManagement() {
  const t = useTranslations("DiscordManagement");
  const [newGuildId, setNewGuildId] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(null);

  // Queries
  const { data: guildSyncs, refetch: refetchGuildSyncs } = api.admin.getGuildSyncs.useQuery();

  // Mutations
  const syncGuildMutation = api.admin.syncGuildMembers.useMutation({
    onSuccess: () => {
      refetchGuildSyncs();
    },
  });

  const handleSyncGuild = async (guildId: string) => {
    try {
      await syncGuildMutation.mutateAsync({ guildId });
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  const handleAddGuild = () => {
    if (newGuildId && /^\d{17,19}$/.test(newGuildId)) {
      // Trigger initial sync for the new guild
      handleSyncGuild(newGuildId);
      setNewGuildId("");
      setIsAddDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: t("statusPending"), variant: "secondary" as const },
      syncing: { label: t("statusSyncing"), variant: "default" as const },
      completed: { label: t("statusCompleted"), variant: "default" as const },
      error: { label: t("statusError"), variant: "destructive" as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("addGuild")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addGuildDialog")}</DialogTitle>
              <DialogDescription>{t("addGuildDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guildId">{t("guildId")}</Label>
                <Input
                  id="guildId"
                  placeholder={t("guildIdPlaceholder")}
                  value={newGuildId}
                  onChange={(e) => setNewGuildId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">{t("guildIdHelper")}</p>
                {newGuildId && !/^\d{17,19}$/.test(newGuildId) && (
                  <p className="text-sm text-destructive">{t("invalidGuildId")}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t("cancel")}
              </Button>
              <Button 
                onClick={handleAddGuild}
                disabled={!newGuildId || !/^\d{17,19}$/.test(newGuildId)}
              >
                {t("addGuildButton")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("guildSyncs")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!guildSyncs || guildSyncs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("noGuilds")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("guildId")}</TableHead>
                  <TableHead>{t("guildName")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("members")}</TableHead>
                  <TableHead>{t("lastSync")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guildSyncs.map((guildSync) => (
                  <TableRow key={guildSync.guildId}>
                    <TableCell className="font-mono text-xs">{guildSync.guildId}</TableCell>
                    <TableCell>{guildSync.guildName || "-"}</TableCell>
                    <TableCell>{getStatusBadge(guildSync.status)}</TableCell>
                    <TableCell>
                      {guildSync._count.members > 0 ? (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {guildSync._count.members}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(guildSync.lastSyncedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncGuild(guildSync.guildId)}
                          disabled={syncGuildMutation.isLoading}
                        >
                          <RefreshCw className="h-4 w-4" />
                          {t("syncNow")}
                        </Button>
                        {guildSync._count.members > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedGuildId(guildSync.guildId)}
                          >
                            <Eye className="h-4 w-4" />
                            {t("viewMembers")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Members List Dialog would go here */}
      {selectedGuildId && (
        <DiscordMembersDialog
          guildId={selectedGuildId}
          open={!!selectedGuildId}
          onClose={() => setSelectedGuildId(null)}
        />
      )}
    </div>
  );
}

// Members dialog component
function DiscordMembersDialog({ 
  guildId, 
  open, 
  onClose 
}: { 
  guildId: string; 
  open: boolean; 
  onClose: () => void; 
}) {
  const t = useTranslations("DiscordManagement");
  const [search, setSearch] = useState("");

  const { data: membersData, isLoading } = api.admin.getGuildMembers.useQuery(
    { guildId, search: search || undefined },
    { enabled: open }
  );

  const formatDiscordDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("membersList")} - {guildId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder={t("searchMembers")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : !membersData?.members.length ? (
            <div className="text-center py-4 text-muted-foreground">
              No members found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("discordUser")}</TableHead>
                  <TableHead>{t("linkedUser")}</TableHead>
                  <TableHead>{t("joinedAt")}</TableHead>
                  <TableHead>{t("memberActions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersData.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {member.avatar && (
                          <img
                            src={`https://cdn.discordapp.com/avatars/${member.discordId}/${member.avatar}.png?size=32`}
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {member.displayName || member.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{member.username}
                            {member.discriminator && `#${member.discriminator}`}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.user ? (
                        <div>
                          <div className="font-medium">{member.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {member.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">{t("notLinked")}</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDiscordDate(member.joinedAt)}</TableCell>
                    <TableCell>
                      {member.user ? (
                        <Button size="sm" variant="outline">
                          <Unlink className="h-4 w-4" />
                          {t("unlinkUser")}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Link className="h-4 w-4" />
                          {t("linkUser")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}