"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// Página inicial: não mostra nada, só encaminha
// para o painel (se já estiver logado) ou para o login
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/painel" : "/login");
  }, [router]);

  return null;
}