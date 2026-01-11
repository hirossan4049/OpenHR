import { redirect } from "next/navigation";

export default function SignInRedirectPage() {
  redirect("/api/auth/signin");
}
