"use client";

import { Bell, Menu, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function Header() {
  const t = useTranslations("Header");

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
            {/* Admin only */}
            <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
              {t("admin")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            {/* Organizer/Admin only */}
            <Button size="sm" asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("createProject")}
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <Link href="/profile" data-testid="profile-link">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Link>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
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
                  {/* Admin only */}
                  <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
                    {t("admin")}
                  </Link>
                  <div className="border-t pt-4">
                    {/* Organizer/Admin only */}
                    <Button size="sm" asChild className="w-full">
                      <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t("createProject")}
                      </Link>
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
