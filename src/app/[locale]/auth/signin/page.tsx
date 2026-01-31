import { redirect } from "next/navigation";
import { AuthForms } from "~/app/_components/auth-forms";
import { auth } from "~/server/auth";

type Props = Readonly<{ params: Promise<{ locale?: string }> }>;

export default async function SignInPage({ params }: Props) {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <h1 className="text-3xl font-bold">Sign in or create an account</h1>
          <p className="mt-2 text-sm text-white/70">Use your credentials to sign in, or create a new account below.</p>
        </div>
        <AuthForms />
      </div>
    </main>
  );
}
