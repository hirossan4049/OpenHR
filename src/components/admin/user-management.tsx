"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  UserCheck, 
  UserX,
  Tag,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Shield,
  User
} from "lucide-react";
import { formatRelativeTime } from "~/lib/formatting";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import { type UserRole } from "~/lib/validation/admin";
import { CreatableTagMultiSelect } from "~/components/ui/creatable-tag-multi-select";
import { TagPill } from "~/components/ui/tag-pill";
import { RolePill } from "~/components/ui/role-pill";

interface User {
  id: string;
  name: string | null;
  email: string | null; // allow null from API
  role: UserRole | string; // API may return string
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  userTags: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
      description: string | null;
    };
  }>;
}

const ROLE_ICONS = {
  ADMIN: Crown,
  MEMBER: Shield,
  VIEWER: Eye,
} as const;

const ROLE_COLORS = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MEMBER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", 
  VIEWER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
} as const;

export function AdminUserManagement() {
  const t = useTranslations("AdminUserManagement");
  const tTags = useTranslations("AdminTagManagement");
  
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleEditDialogOpen, setIsRoleEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserRole, setNewUserRole] = useState<UserRole>("MEMBER");

  // Tag assignment dialog state
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagEditingUser, setTagEditingUser] = useState<User | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Create viewer account form
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // API queries
  const { 
    data: usersData, 
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers 
  } = api.admin.getAllUsers.useQuery({
    search: search || undefined,
    role: selectedRole === "ALL" ? undefined : selectedRole,
    limit: 10000,
    offset: 0,
  });

  const { data: tags, error: tagsError, refetch: refetchTags } = api.admin.getAllTags.useQuery();

  // API mutations
  const createViewerMutation = api.admin.createViewerAccount.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewUserData({ name: "", email: "", password: "" });
      void refetchUsers();
    },
  });

  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      setIsRoleEditDialogOpen(false);
      setEditingUser(null);
      void refetchUsers();
    },
  });

  const assignTagMutation = api.admin.assignTagToUser.useMutation({
    onSuccess: () => {
      // we'll refetch after bulk operations
    },
  });
  const removeTagMutation = api.admin.removeTagFromUser.useMutation({
    onSuccess: () => {
      // we'll refetch after bulk operations
    },
  });

  // Inline create tag
  const createTagMutation = api.admin.createTag.useMutation({
    onSuccess: async (newTag) => {
      setSelectedTagIds((prev) => (prev.includes(newTag.id) ? prev : [...prev, newTag.id]));
      await refetchTags();
    },
  });
  const defaultTagColor = "#4F46E5"; // indigo-600

  const handleCreateViewer = () => {
    createViewerMutation.mutate(newUserData);
  };

  const handleUpdateRole = () => {
    if (editingUser) {
      updateRoleMutation.mutate({
        userId: editingUser.id,
        role: newUserRole,
      });
    }
  };

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setNewUserRole(user.role as UserRole);
    setIsRoleEditDialogOpen(true);
  };

  const handleOpenTagDialog = (user: User) => {
    setTagEditingUser(user);
    setSelectedTagIds(user.userTags.map((ut) => ut.tag.id));
    setIsTagDialogOpen(true);
  };

  const toggleSelectedTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSaveTags = async () => {
    if (!tagEditingUser) return;
    const current = new Set(tagEditingUser.userTags.map((ut) => ut.tag.id));
    const next = new Set(selectedTagIds);
    const toAdd = Array.from(next).filter((id) => !current.has(id));
    const toRemove = Array.from(current).filter((id) => !next.has(id));

    try {
      await Promise.all([
        ...toAdd.map((tagId) =>
          assignTagMutation.mutateAsync({ userId: tagEditingUser.id, tagId })
        ),
        ...toRemove.map((tagId) =>
          removeTagMutation.mutateAsync({ userId: tagEditingUser.id, tagId })
        ),
      ]);
      setIsTagDialogOpen(false);
      setTagEditingUser(null);
      await refetchUsers();
    } catch (e) {
      // keep dialog open, could show toast in future
      console.error(e);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const Icon = ROLE_ICONS[role];
    return <Icon className="h-4 w-4" />;
  };

  const filteredUsers = usersData?.users ?? [];
  const userCounts = {
    all: usersData?.total ?? 0,
    admins: filteredUsers.filter(u => u.role === "ADMIN").length,
    members: filteredUsers.filter(u => u.role === "MEMBER").length,
    viewers: filteredUsers.filter(u => u.role === "VIEWER").length,
  };

  // Basic access-denied handling for non-admins hitting this page client-side
  // (server layout already blocks access, but keep this for safety/SSR fallbacks)
  const isForbidden = (err: any) => {
    try {
      return err?.data?.code === "FORBIDDEN" || err?.shape?.data?.code === "FORBIDDEN";
    } catch {
      return false;
    }
  };
  if (isForbidden(usersError) || isForbidden(tagsError)) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Admins only. If you need access, contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions across the platform.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchUsers")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          {/* Role Filter */}
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole | "ALL")}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("allUsers")}</SelectItem>
              <SelectItem value="ADMIN">{t("admins")}</SelectItem>
              <SelectItem value="MEMBER">{t("members")}</SelectItem>
              <SelectItem value="VIEWER">{t("viewers")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createViewerAccount")}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("allUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.all}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("admins")}</CardTitle>
            <Crown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("members")}</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.members}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("viewers")}</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCounts.viewers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allUsers")}</CardTitle>
          <CardDescription>
            {usersData?.total ? `${usersData.total} total users` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noUsers")}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("role")}</TableHead>
                  <TableHead>{t("tags")}</TableHead>
                  <TableHead>{t("createdAt")}</TableHead>
                  <TableHead>{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name ?? ""}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <span>{user.name ?? "No name"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <RolePill role={user.role as UserRole} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.userTags.map(({ tag }) => (
                          <TagPill key={tag.id} name={tag.name} color={tag.color} size="sm" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatRelativeTime(new Date(user.createdAt))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTagDialog(user)}
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Viewer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("viewerAccountForm.title")}</DialogTitle>
            <DialogDescription>
              Create a read-only viewer account with limited access permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t("viewerAccountForm.name")}</Label>
              <Input
                id="name"
                placeholder={t("viewerAccountForm.namePlaceholder")}
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="email">{t("viewerAccountForm.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("viewerAccountForm.emailPlaceholder")}
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="password">{t("viewerAccountForm.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("viewerAccountForm.passwordPlaceholder")}
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t("viewerAccountForm.cancel")}
            </Button>
            <Button 
              onClick={handleCreateViewer}
              disabled={createViewerMutation.isPending || !newUserData.name || !newUserData.email || !newUserData.password}
            >
              {createViewerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("viewerAccountForm.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isRoleEditDialogOpen} onOpenChange={setIsRoleEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editRole")}</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.name ?? editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">New Role</Label>
              <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="MEMBER">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="VIEWER">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tags Dialog */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("assignTags")}</DialogTitle>
            <DialogDescription>
              {tagEditingUser ? (tagEditingUser.name ?? tagEditingUser.email) : ""}
            </DialogDescription>
          </DialogHeader>

          <CreatableTagMultiSelect
            options={(tags ?? []).map((tag) => ({
              id: tag.id,
              name: tag.name,
              color: tag.color,
              description: tag.description,
            }))}
            values={selectedTagIds}
            onValuesChange={setSelectedTagIds}
            onCreateTag={(name, color) => {
              // create with default color and empty description
              createTagMutation.mutate({
                name: name.trim(),
                color: color ?? defaultTagColor,
                description: undefined,
              })
            }}
            placeholder={t("assignTags")}
            searchPlaceholder={tTags("searchTags")}
            emptyText={tTags("noTags")}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              {t("viewerAccountForm.cancel")}
            </Button>
            <Button
              onClick={handleSaveTags}
              disabled={assignTagMutation.isPending || removeTagMutation.isPending}
            >
              {(assignTagMutation.isPending || removeTagMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("editRoleForm.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
