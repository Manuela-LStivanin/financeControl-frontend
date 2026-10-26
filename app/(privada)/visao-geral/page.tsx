"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function VisaoGeralPage() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    apiFetch("/users/me").then((usuario) => setNome(usuario.name));
  }, []);

  return (
    <main style={{ padding: "var(--space-8)" }}>
      <h1>Olá, {nome}!</h1>
      <p>Você está logado.</p>
      <p>{formatDate("2027-12-31T00:00:00.000Z")}</p>
    </main>
  );
}