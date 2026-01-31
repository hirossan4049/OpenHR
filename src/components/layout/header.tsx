"use client";

import { Bell, LogOut, Menu, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { api } from "~/trpc/react";

export function Header() {
  const t = useTranslations("Header");
  const { status, data: session } = useSession();
  const { data: me } = api.user.getCurrentRole.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const isAdmin = me?.role === "ADMIN";
  const canCreateProject = status === "authenticated" && me?.role !== "VIEWER";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold">
            <span>OpenHR</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("dashboard")}
            </Link>
            <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("projects")}
            </Link>
            <Link href="/my" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("myProjects")}
            </Link>
            <Link href="/members" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("members")}
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
                {t("admin")}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            {/* Disallow for VIEWER */}
            {canCreateProject && (
              <Button size="sm" asChild>
                <Link href="/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("createProject")}
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="profile-link">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={me?.image ?? session?.user?.image ?? undefined}
                    alt={me?.name ?? session?.user?.name ?? "Profile"}
                  />
                  <AvatarFallback>
                    {(me?.name ?? session?.user?.name ?? "??").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">{t("profile")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: window.location.origin })}>
                <LogOut className="mr-2 h-4 w-4" />
                {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" data-testid="mobile-menu">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("toggleMenu")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-6">
                  <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("dashboard")}
                  </Link>
                  <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("projects")}
                  </Link>
                  <Link href="/my" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("myProjects")}
                  </Link>
                  <Link href="/members" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("members")}
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
                      {t("admin")}
                    </Link>
                  )}
                  <div className="border-t pt-4 space-y-2">
                    <Link href="/profile" className="block text-muted-foreground transition-colors hover:text-foreground">
                      {t("profile")}
                    </Link>
                    {canCreateProject && (
                      <Button size="sm" asChild className="w-full">
                        <Link href="/projects/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {t("createProject")}
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => signOut({ callbackUrl: window.location.origin })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("signOut")}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
