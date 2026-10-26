"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "../components/Sidebar";

// Moldura da área privada: só mostra as telas para quem está logado.
// Sem token, manda de volta para o login.
export default function PrivadaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [liberado, setLiberado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setLiberado(true);
  }, [router]);

  // Enquanto confere o token, não mostra nada (evita "piscar" a tela privada)
  if (!liberado) return null;

    return (
    <div className="fc-shell">
      <Sidebar />
      <main className="fc-content">{children}</main>
    </div>
  );
}