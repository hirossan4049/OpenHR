import { getTranslations } from "next-intl/server";
import { AuthForms } from "~/app/_components/auth-forms";
import { LatestPost } from "~/app/_components/post";
import { Link } from "~/navigation";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const t = await getTranslations('HomePage');
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            {t("title")} <span className="text-[hsl(280,100%,70%)]">TMS</span>
          </h1>

          {!session ? (
            <div className="w-full max-w-md">
              <AuthForms />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                <Link
                  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                  href="https://create.t3.gg/en/usage/first-steps"
                  target="_blank"
                >
                  <h3 className="text-2xl font-bold">{t("firstStepsTitle")}</h3>
                  <div className="text-lg">
                    {t("firstStepsDescription")}
                  </div>
                </Link>
                <Link
                  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                  href="https://create.t3.gg/en/introduction"
                  target="_blank"
                >
                  <h3 className="text-2xl font-bold">{t("documentationTitle")}</h3>
                  <div className="text-lg">
                    {t("documentationDescription")}
                  </div>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-2xl text-white">
                  {hello ? hello.greeting : t("loadingTRPC")}
                </p>

                <div className="flex flex-col items-center justify-center gap-4">
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
                    <Link
                      href="/api/auth/signout"
                      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                    >
                      {t("signOut")}
                    </Link>
                  </div>
                </div>
              </div>

              {session?.user && <LatestPost />}
            </>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}