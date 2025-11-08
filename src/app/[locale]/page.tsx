import { Award, FolderKanban, TrendingUp, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AuthForms } from "~/app/_components/auth-forms";
import { Link } from "~/navigation";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const t = await getTranslations('HomePage');
  const session = await auth();

  if (!session) {
    return (
      <HydrateClient>
        <main className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          {/* Hero Section */}
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-block rounded-full bg-purple-100 px-4 py-2 dark:bg-purple-900/30">
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {t("subtitle")}
                </span>
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                {t("hero")}
              </h1>

              <p className="mb-8 text-lg text-gray-600 dark:text-gray-400 md:text-xl">
                {t("description")}
              </p>

              <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/api/auth/signin"
                  className="w-full rounded-lg bg-purple-600 px-8 py-3 text-center font-semibold text-white transition hover:bg-purple-700 sm:w-auto"
                >
                  {t("cta.signIn")}
                </Link>
                <Link
                  href="/projects"
                  className="w-full rounded-lg border border-gray-300 bg-white px-8 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
                >
                  {t("cta.learnMore")}
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="border-t border-gray-200 bg-white py-16 dark:border-gray-800 dark:bg-gray-900/50 md:py-24">
            <div className="container mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white">
                {t("features.title")}
              </h2>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("features.members.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("features.members.description")}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-4 inline-flex rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <FolderKanban className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("features.projects.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("features.projects.description")}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("features.skills.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("features.skills.description")}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                    <Award className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                    {t("features.hackathons.title")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("features.hackathons.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign In Section */}
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-md">
              <AuthForms />
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {t("title")} <span className="text-[hsl(280,100%,70%)]">TMS</span>
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <a
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/usage/first-steps"
              target="_blank" rel="noreferrer"
            >
              <h3 className="text-2xl font-bold">{t("firstStepsTitle")}</h3>
              <div className="text-lg">
                {t("firstStepsDescription")}
              </div>
            </a>
            <a
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank" rel="noreferrer"
            >
              <h3 className="text-2xl font-bold">{t("documentationTitle")}</h3>
              <div className="text-lg">
                {t("documentationDescription")}
              </div>
            </a>
          </div>
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-2xl text-white">
              {session && <span>{t("loggedInAs", { name: session.user?.name || "" })}</span>}
            </p>
            <div className="flex gap-4">
              <Link
                href="/profile"
                className="rounded-full bg-purple-600 px-10 py-3 font-semibold no-underline transition hover:bg-purple-700"
              >
                {t("myProfile")}
              </Link>
              <a
                href="/api/auth/signout"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {t("signOut")}
              </a>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}