"use client";

import { usePathname, useRouter } from "next/navigation";
import SegmentedControl from "../components/SegmentedControl";

// [LOCAL] Abas "Entrar | Criar conta" no topo do formulário de acesso
// Abas "Entrar | Criar conta": a aba ativa vem do endereço atual,
// e clicar em uma aba leva para a página correspondente
export default function AuthTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SegmentedControl
      label="Acesso"
      hideLabel
      value={pathname}
      onChange={(rota) => router.push(rota)}
      options={[
        { value: "/login", label: "Entrar" },
        { value: "/cadastro", label: "Criar conta" },
      ]}
    />
  );
}