import { Bell, Menu, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold">
            <span>OpenHR</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
            <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">
              Projects
            </Link>
            <Link href="/members" className="text-muted-foreground transition-colors hover:text-foreground">
              Members
            </Link>
            {/* Admin only */}
            <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            {/* Organizer/Admin only */}
            <Button size="sm" asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>

          <Link href="/profile">
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
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-6">
                  <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                  <Link href="/projects" className="text-muted-foreground transition-colors hover:text-foreground">
                    Projects
                  </Link>
                  <Link href="/members" className="text-muted-foreground transition-colors hover:text-foreground">
                    Members
                  </Link>
                  {/* Admin only */}
                  <Link href="/admin" className="text-muted-foreground transition-colors hover:text-foreground">
                    Admin
                  </Link>
                  <div className="border-t pt-4">
                    {/* Organizer/Admin only */}
                    <Button size="sm" asChild className="w-full">
                      <Link href="/projects/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Project
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
