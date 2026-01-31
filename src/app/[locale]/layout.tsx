import "~/styles/globals.css";

import { type Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { Header } from "~/components/layout/header";
import { auth } from "~/server/auth";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "OpenHR",
  description: "Open source human resource management platform",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

// Added: supported locales & fallback
const SUPPORTED_LOCALES = ["en", "ja"] as const;
const DEFAULT_LOCALE = "en";

type Props = Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>;

export default async function RootLayout({ children, params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;

  const messages = await getMessages({ locale });
  const session = await auth();

  return (
    <html lang={locale} className="font-sans">
      <body>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="UTC">
          <SessionProvider session={session}>
            <TRPCReactProvider>
              {session ? <Header /> : null}
              {children}
            </TRPCReactProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
