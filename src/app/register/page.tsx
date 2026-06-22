import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription | Jootiya",
};

export default function RegisterPage() {
  // Unified auth flow: redirect to login (OTP-based, no separate registration)
  redirect("/login?message=" + encodeURIComponent("Entrez votre e-mail pour vous connecter ou créer un compte."));
}
