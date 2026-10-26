"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function VisaoGeralPage() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    apiFetch("/users/me").then((usuario) => setNome(usuario.name));
  }, []);

  return (
    <main style={{ padding: "var(--space-8)" }}>
      <h1>Olá, {nome}!</h1>
      <p>Você está logado.</p>
    </main>
  );
}