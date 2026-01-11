import { Award, Database, FolderKanban, Sparkles, TrendingUp, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "~/navigation";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

type Props = Readonly<{ params: Promise<{ locale?: string }> }>;

export default async function Home({ params }: Props) {
  const session = await auth();
  const { locale = "en" } = await params;

  if (session) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations('HomePage');

  if (!session) {
    const heroHighlights = [
      {
        icon: Users,
        title: t("heroHighlights.directory.title"),
        description: t("heroHighlights.directory.description"),
      },
      {
        icon: FolderKanban,
        title: t("heroHighlights.projects.title"),
        description: t("heroHighlights.projects.description"),
      },
      {
        icon: TrendingUp,
        title: t("heroHighlights.insights.title"),
        description: t("heroHighlights.insights.description"),
      },
    ];

    const stats = [
      {
        value: t("stats.members.value"),
        label: t("stats.members.label"),
      },
      {
        value: t("stats.projects.value"),
        label: t("stats.projects.label"),
      },
      {
        value: t("stats.skills.value"),
        label: t("stats.skills.label"),
      },
    ];

    const workflowSteps = [
      {
        icon: Database,
        title: t("workflow.steps.collect.title"),
        description: t("workflow.steps.collect.description"),
      },
      {
        icon: FolderKanban,
        title: t("workflow.steps.match.title"),
        description: t("workflow.steps.match.description"),
      },
      {
        icon: TrendingUp,
        title: t("workflow.steps.celebrate.title"),
        description: t("workflow.steps.celebrate.description"),
      },
    ];

    const previewSkills = Object.values(t.raw("preview.profile.skills") as Record<string, string>);
    const previewActivityItems = Object.values(t.raw("preview.activity.items") as Record<string, string>);
    const previewLogoItems = Object.values(t.raw("preview.logos.items") as Record<string, string>);

    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col bg-slate-950 text-white">
          <div className="relative isolate overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent" aria-hidden />
            <div className="absolute -left-12 top-16 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl" aria-hidden />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />

            <div className="container mx-auto px-4">
              <header className="flex items-center justify-between py-6">
                <Link href="/" className="text-lg font-semibold tracking-tight">
                  OpenHR
                </Link>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/projects"
                    className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    {t("cta.learnMore")}
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    {t("cta.signIn")}
                  </Link>
                </div>
              </header>

              <div className="grid gap-16 pb-16 pt-6 md:grid-cols-[1.05fr,0.95fr] md:pb-24 md:pt-10">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                    {t("subtitle")}
                  </span>
                  <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                    {t("hero")}
                  </h1>
                  <p className="mt-6 text-lg text-white/70 md:text-xl">
                    {t("description")}
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/auth/signin"
                      className="rounded-2xl bg-purple-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-purple-400"
                    >
                      {t("cta.signIn")}
                    </Link>
                    <Link
                      href="/members"
                      className="rounded-2xl border border-white/30 px-6 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
                    >
                      {t("cta.learnMore")}
                    </Link>
                  </div>

                  <div className="mt-12 grid gap-4 sm:grid-cols-3">
                    {heroHighlights.map(({ icon: Icon, title, description }) => (
                      <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <Icon className="mb-3 h-6 w-6 text-purple-300" />
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-sm text-white/70">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-4 rounded-[30px] bg-purple-500/20 blur-2xl" aria-hidden />
                  <div className="relative rounded-[30px] border border-white/10 bg-slate-900/70 p-1 shadow-2xl shadow-purple-500/30">
                    <div className="rounded-[24px] bg-slate-950/80 p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                        {t("cta.signIn")}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        {t("ctaBanner.title")}
                      </h2>
                      <p className="mt-2 text-sm text-white/70">
                        {t("ctaBanner.description")}
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link
                          href="/auth/signin"
                          className="rounded-2xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                        >
                          {t("cta.signIn")}
                        </Link>
                        <Link
                          href="/members"
                          className="rounded-2xl border border-white/30 px-5 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
                        >
                          {t("cta.learnMore")}
                        </Link>
                      </div>
                      <p className="mt-4 text-xs text-white/60">
                        {t("description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 border-t border-white/10 py-10 text-center sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-semibold sm:text-4xl">{stat.value}</p>
                    <p className="mt-2 text-sm text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 py-16">
                <div className="mx-auto max-w-2xl text-center">
                  <Sparkles className="mx-auto h-6 w-6 text-purple-300" />
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                    {t("preview.title")}
                  </p>
                  <p className="mt-4 text-base text-white/70">{t("preview.description")}</p>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
                  <div className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-2xl font-semibold">
                        ET
                      </div>
                      <div>
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
                          {t("preview.profile.badge")}
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold">{t("preview.profile.name")}</h3>
                        <p className="text-sm text-white/70">
                          {t("preview.profile.role")} ・ {t("preview.profile.grade")} ・ {t("preview.profile.availability")}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-sm text-white/80">{t("preview.profile.tagline")}</p>

                    <div className="mt-6">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                        {t("preview.profile.skillsLabel")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {previewSkills.map((skill) => (
                          <span key={skill} className="rounded-full border border-white/15 px-4 py-1 text-sm text-white/80">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                      <p className="text-sm font-semibold text-white">{t("preview.activity.title")}</p>
                      <ul className="mt-4 space-y-3 text-sm text-white/80">
                        {previewActivityItems.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-300" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/50">
                        {t("preview.activity.updated")}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/10 bg-slate-950/60 p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                      {t("preview.logos.title")}
                    </p>
                    <p className="mt-3 text-base text-white/70">{t("preview.logos.description")}</p>
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
                      {previewLogoItems.map((logo) => (
                        <div key={logo} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white/90">
                            {logo
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 3)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white/80">{logo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white py-20 text-gray-900 dark:bg-slate-950 dark:text-white">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-purple-600 dark:text-purple-300">
                  {t("subtitle")}
                </p>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("features.title")}</h2>
                <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                  {t("description")}
                </p>
              </div>

              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-4 inline-flex rounded-xl bg-blue-600/10 p-3 dark:bg-blue-500/20">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("features.members.title")}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t("features.members.description")}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-4 inline-flex rounded-xl bg-green-600/10 p-3 dark:bg-green-500/20">
                    <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("features.projects.title")}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t("features.projects.description")}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-4 inline-flex rounded-xl bg-purple-600/10 p-3 dark:bg-purple-500/20">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("features.skills.title")}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t("features.skills.description")}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">
                  <div className="mb-4 inline-flex rounded-xl bg-orange-600/10 p-3 dark:bg-orange-500/20">
                    <Award className="h-6 w-6 text-orange-500 dark:text-orange-300" />
                  </div>
                  <h3 className="text-lg font-semibold">{t("features.hackathons.title")}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t("features.hackathons.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-slate-950 py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-purple-300">
                  {t("subtitle")}
                </p>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{t("workflow.title")}</h2>
                <p className="mt-4 text-base text-white/70">{t("workflow.subtitle")}</p>
              </div>

              <div className="mt-12 grid gap-6 md:grid-cols-3">
                {workflowSteps.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <Icon className="h-10 w-10 text-purple-300" />
                    <p className="mt-6 text-lg font-semibold">{title}</p>
                    <p className="mt-2 text-sm text-white/70">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white py-20 dark:bg-slate-950">
            <div className="container mx-auto px-4">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-10 text-white">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-3xl font-semibold">{t("ctaBanner.title")}</h3>
                    <p className="mt-4 text-base text-white/80">{t("ctaBanner.description")}</p>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/auth/signin"
                      className="rounded-2xl bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                    >
                      {t("ctaBanner.primary")}
                    </Link>
                    <Link
                      href="/members"
                      className="rounded-2xl border border-white/60 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      {t("ctaBanner.secondary")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }

  return null;
}
