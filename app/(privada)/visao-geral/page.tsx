"use client";

import { useEffect, useState } from "react";
import { Conta } from "../../components/AccountCard";
import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";
import { apiFetch } from "@/lib/api";

// Formato de uma movimentação, igual ao que o GET /transactions devolve
type Movimentacao = {
  id: number;
  date: string;
  amount: string; // a API manda Decimal como texto
  transactionType: "ENTRADA" | "SAIDA";
  description: string | null;
  counterparty: string;
  fixed: boolean;
  accountId: number;
  categoryId: number | null;
};

// Devolve o mês de hoje no formato da API, ex.: "2026-10"
function mesAtual() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

// 1 -> "1 lançamento", 3 -> "3 lançamentos"
function lancamentos(n: number) {
  return n === 1 ? "1 lançamento" : `${n} lançamentos`;
}

export default function VisaoGeralPage() {
  const [nome, setNome] = useState("");
  const [contas, setContas] = useState<Conta[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

  // Busca usuário, contas e movimentações ao mesmo tempo
  async function carregar() {
    try {
      const [usuario, listaContas, listaMov] = await Promise.all([
        apiFetch("/users/me"),
        apiFetch("/accounts"),
        apiFetch("/transactions"),
      ]);
      setNome(usuario.name);
      setContas(listaContas);
      setMovimentacoes(listaMov);
      setCarregado(true);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (erro) return <p className="fc-field-msg fc-field-msg-error">{erro}</p>;
  if (!carregado) return null;

  // Saldo total: soma o saldo de todas as contas
  const saldoTotal = contas.reduce((soma, c) => soma + Number(c.balance), 0);

  // Só as movimentações deste mês ("2026-10-05T00:00..." começa com "2026-10")
  const doMes = movimentacoes.filter((m) => m.date.startsWith(mesAtual()));
  const entradas = doMes.filter((m) => m.transactionType === "ENTRADA");
  const saidas = doMes.filter((m) => m.transactionType === "SAIDA");
  const totalEntradas = entradas.reduce((soma, m) => soma + Number(m.amount), 0);
  const totalSaidas = saidas.reduce((soma, m) => soma + Number(m.amount), 0);
  const resultado = totalEntradas - totalSaidas;

  // Textos do cabeçalho: "sábado, 31 de outubro" e "outubro"
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const primeiroNome = nome.split(" ")[0];

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="home"
        eyebrow={hoje}
        title={`Olá, ${primeiroNome}`}
        description="Um resumo das suas contas, movimentações e metas."
      />

      {/* Os 4 cards de resumo */}
      <div className="fc-stats">
        <StatCard
          tone="brand"
          label="Saldo total"
          icon="coins"
          value={saldoTotal}
          note={contas.length === 1 ? "1 conta" : `${contas.length} contas`}
        />
        <StatCard label={`Entradas em ${nomeMes}`} icon="in" value={totalEntradas} note={lancamentos(entradas.length)} />
        <StatCard label={`Saídas em ${nomeMes}`} icon="out" value={totalSaidas} note={lancamentos(saidas.length)} />
        <StatCard
          label="Resultado do mês"
          icon="swap"
          value={resultado}
          note={resultado >= 0 ? "Sobrou dinheiro" : "Gastou mais do que entrou"}
        />
      </div>
    </div>
  );
}