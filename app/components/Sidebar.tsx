"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon, { IconName } from "./Icon";
import { apiFetch } from "@/lib/api";
import { clearToken } from "@/lib/auth";

// As telas da área privada, na ordem do protótipo
const itens: { href: string; label: string; icon: IconName }[] = [
  { href: "/visao-geral", label: "Visão geral", icon: "home" },
  { href: "/contas", label: "Contas", icon: "wallet" },
  { href: "/movimentacoes", label: "Movimentações", icon: "swap" },
  { href: "/categorias", label: "Categorias", icon: "tag" },
  { href: "/metas", label: "Metas", icon: "target" },
  { href: "/perfil", label: "Perfil", icon: "user" },
];

export default function Sidebar() {
  const pathname = usePathname(); // endereço atual, ex.: "/contas"

  const router = useRouter();
  const [usuario, setUsuario] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // Busca os dados de quem está logado, uma vez, quando o menu aparece
  useEffect(() => {
    apiFetch("/users/me")
      .then(setUsuario)
      .catch(() => {});
  }, []);

  // Sair: apaga o token e volta para o login
  function sair() {
    clearToken();
    router.replace("/login");
  }

  return (
    <nav className="fc-sidebar" aria-label="Navegação principal">
      <div className="fc-logo">
        <span className="fc-logo-mark">
          <Icon name="coins" />
        </span>
        financeControl
      </div>

      <ul className="fc-nav">
        {itens.map((item) => {
          const ativo = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={ativo ? "fc-nav-item is-active" : "fc-nav-item"}
                aria-current={ativo ? "page" : undefined}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {usuario && (
        <div className="fc-sidebar-user">
          <span className="fc-avatar">
            {usuario.name.charAt(0).toUpperCase()}
          </span>
          <div className="fc-sidebar-user-text">
            <strong>{usuario.name}</strong>
            <span>{usuario.email}</span>
          </div>
          <button
            type="button"
            className="fc-iconbtn"
            onClick={sair}
            aria-label="Sair"
            title="Sair"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      )}
    </nav>
  );
}
