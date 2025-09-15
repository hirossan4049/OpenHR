import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = Readonly<{ children: React.ReactNode } & { params: Promise<{ locale: string }> }>;

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("HomePage");

  const session = await auth();
  const userId = session?.user?.id;

  let isAdmin = false;
  if (userId) {
    const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    isAdmin = user?.role === "ADMIN";
  }

  if (!isAdmin) {
    return (
      <div className="container py-16">
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">{t("accessDenied")}</h1>
          <p className="mb-6 text-muted-foreground">
            Admin area only. If you need access, contact an administrator.
          </p>
          <div className="flex justify-center gap-3">
            <Link href={`/${locale}`} className="inline-flex h-9 items-center rounded-md border px-4 text-sm">
              Home
            </Link>
            <Link href={`/${locale}/`} className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground">
              {t("myProfile")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

