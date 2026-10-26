"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { IconName } from "./Icon";

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
    </nav>
  );
}