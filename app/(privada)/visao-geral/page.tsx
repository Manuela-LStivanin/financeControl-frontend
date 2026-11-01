"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // NOVO
import { Conta } from "../../components/AccountCard";
import Amount from "../../components/Amount"; // NOVO
import EmptyState from "../../components/EmptyState"; // NOVO
import Icon from "../../components/Icon"; // NOVO
import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";
import { Movimentacao } from "../../components/TransactionTable"; // NOVO: tipo da Manu, no lugar do nosso
import TransactionRow from "../../components/TransactionRow"; // NOVO
import { apiFetch } from "@/lib/api";

// NOVO: o "type Movimentacao" que estava aqui foi apagado; agora vem do TransactionTable da Manu

type Categoria = { id: number; name: string }; // NOVO

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
  const [categorias, setCategorias] = useState<Categoria[]>([]); // NOVO
  const [carregado, setCarregado] = useState(false);
  const [erro, setErro] = useState("");

  // Busca usuário, contas, movimentações e categorias ao mesmo tempo
  async function carregar() {
    try {
      const [usuario, listaContas, listaMov, listaCategorias] = await Promise.all([
        apiFetch("/users/me"),
        apiFetch("/accounts"),
        apiFetch("/transactions"),
        apiFetch("/categories"), // NOVO
      ]);
      setNome(usuario.name);
      setContas(listaContas);
      setMovimentacoes(listaMov);
      setCategorias(listaCategorias); // NOVO
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

  // NOVO: as 5 mais recentes (a API já devolve da mais nova para a mais antiga)
  const recentes = movimentacoes.slice(0, 5);

  // NOVO: traduzem os ids em nomes para mostrar na lista
  const nomeConta = (id: number) => contas.find((c) => c.id === id)?.institution ?? "";
  const nomeCategoria = (id: number | null) => categorias.find((c) => c.id === id)?.name ?? null;

  // Textos do cabeçalho: "domingo, 1 de novembro" e "novembro"
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

      {/* NOVO: Contas e Últimas movimentações, lado a lado */}
      <div className="fc-two">
        <section className="fc-panel">
          <SectionHeader
            icon="wallet"
            title="Contas"
            count={contas.length}
            description="Saldo de cada conta"
            actions={
              <Link href="/contas" className="fc-btn fc-btn-ghost fc-btn-sm">
                Ver todas <Icon name="chevron" size={16} />
              </Link>
            }
          />
          {contas.length > 0 ? (
            <div className="fc-list fc-flush">
              {contas.map((c) => (
                // Clicar na conta abre as movimentações já filtradas por ela
                <Link key={c.id} href={`/movimentacoes?accountId=${c.id}`} className="fc-mini fc-clickable">
                  <span className="fc-account-mono fc-mono-sm">{c.institution.charAt(0).toUpperCase()}</span>
                  <span className="fc-mini-text">
                    <strong>{c.institution}</strong>
                    <span className="fc-meta">
                      {c.accountType === "CORRENTE" ? "Conta corrente" : "Poupança"} · {c.accountNumber}
                    </span>
                  </span>
                  <Amount value={c.balance} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="wallet"
              title="Nenhuma conta ainda"
              action={
                <Link href="/contas" className="fc-btn fc-btn-primary fc-btn-sm">
                  Adicionar conta
                </Link>
              }
            />
          )}
        </section>

        <section className="fc-panel">
          <SectionHeader
            icon="swap"
            title="Últimas movimentações"
            description="Os 5 lançamentos mais recentes"
            actions={
              <Link href="/movimentacoes" className="fc-btn fc-btn-ghost fc-btn-sm">
                Ver extrato <Icon name="chevron" size={16} />
              </Link>
            }
          />
          {recentes.length > 0 ? (
            <div className="fc-list fc-flush">
              {recentes.map((m) => (
                <TransactionRow
                  key={m.id}
                  movimentacao={m}
                  categoria={nomeCategoria(m.categoryId)}
                  conta={nomeConta(m.accountId)}
                />
              ))}
            </div>
          ) : (
            <EmptyState icon="swap" title="Nada lançado ainda" />
          )}
        </section>
      </div>
    </div>
  );
}