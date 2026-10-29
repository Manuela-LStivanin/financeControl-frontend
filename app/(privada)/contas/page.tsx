"use client";

import { useEffect, useState } from "react";
import AccountCard, { Conta } from "../../components/AccountCard";
import Amount from "../../components/Amount";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import SectionHeader from "../../components/SectionHeader";
import AccountForm from "./AccountForm";
import { apiFetch } from "@/lib/api";

export default function ContasPage() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [movPorConta, setMovPorConta] = useState<Record<number, number>>({}); // id da conta -> quantidade
  const [erro, setErro] = useState("");

  // Modal de criar/editar: undefined = fechado, null = criando, Conta = editando
  const [formConta, setFormConta] = useState<Conta | null | undefined>(undefined);

  // Confirmação de exclusão
  const [apagando, setApagando] = useState<Conta | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Busca as contas e as movimentações ao mesmo tempo, e conta as movimentações de cada conta
  async function carregar() {
    try {
      const [listaContas, listaMov] = await Promise.all([
        apiFetch("/accounts"),
        apiFetch("/transactions"),
      ]);
      //um objeto que funciona como dicionário: chave número (o id da conta) → valor número (a quantidade). 
      // No fim, fica algo como { 1: 3, 2: 0, 5: 1 }.
      const contagem: Record<number, number> = {};
      for (const mov of listaMov as { accountId: number }[]) {
        contagem[mov.accountId] = (contagem[mov.accountId] ?? 0) + 1; 
      }
      setContas(listaContas);
      setMovPorConta(contagem);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Carrega uma vez, quando a tela abre
  useEffect(() => {
    carregar();
  }, []);

  // Depois de salvar no modal: fecha e recarrega a lista
  function aoSalvar() {
    setFormConta(undefined);
    carregar();
  }

  // Apaga na API depois da confirmação
  async function confirmarExclusao() {
    if (!apagando) return;
    setExcluindo(true);
    try {
      await apiFetch(`/accounts/${apagando.id}`, { method: "DELETE" });
      setApagando(null);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
      setApagando(null);
    } finally {
      setExcluindo(false);
    }
  }

  // Resumo do topo
  const saldoSomado = contas.reduce((soma, c) => soma + Number(c.balance), 0);
  const correntes = contas.filter((c) => c.accountType === "CORRENTE").length;
  const poupancas = contas.filter((c) => c.accountType === "POUPANCA").length;
  const movDaApagada = apagando ? movPorConta[apagando.id] ?? 0 : 0;

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="wallet"
        eyebrow="Finanças"
        title="Contas"
        count={contas.length}
        description="Suas contas bancárias. O saldo muda a cada movimentação lançada."
        actions={<Button icon="plus" onClick={() => setFormConta(null)}>Nova conta</Button>}
      />

      {erro && <p className="fc-field-msg fc-field-msg-error">{erro}</p>}

      {/* Faixa de resumo */}
      <div className="fc-strip">
        <div>
          <span className="fc-label">Saldo somado</span>
          <Amount value={saldoSomado} size="lg" />
        </div>
        <div>
          <span className="fc-label">Contas correntes</span>
          <strong className="fc-strip-n">{correntes}</strong>
        </div>
        <div>
          <span className="fc-label">Poupanças</span>
          <strong className="fc-strip-n">{poupancas}</strong>
        </div>
      </div>

      {/* Grade de cards, ou o aviso de lista vazia */}
      {contas.length > 0 ? (
        <div className="fc-grid">
          {contas.map((conta) => (
            <AccountCard
              key={conta.id}
              conta={conta}
              movimentacoes={movPorConta[conta.id] ?? 0}
              onEdit={() => setFormConta(conta)}
              onDelete={() => setApagando(conta)}
            />
          ))}
          <button type="button" className="fc-addcard" onClick={() => setFormConta(null)}>
            <Icon name="plus" size={22} />
            Adicionar conta
          </button>
        </div>
      ) : (
        <EmptyState
          icon="wallet"
          title="Nenhuma conta cadastrada"
          action={<Button icon="plus" onClick={() => setFormConta(null)}>Adicionar a primeira conta</Button>}
        >
          Cadastre uma conta para começar a lançar entradas e saídas.
        </EmptyState>
      )}

      {/* Modal de criar/editar (só existe enquanto está aberto) */}
      {formConta !== undefined && (
        <AccountForm conta={formConta} onClose={() => setFormConta(undefined)} onSaved={aoSalvar} />
      )}

      {/* Confirmação de exclusão: avisa quantas movimentações vão junto */}
      <ConfirmDialog
        open={apagando !== null}
        title={`Apagar a conta ${apagando?.institution ?? ""}?`}
        confirmLabel="Apagar conta"
        onConfirm={confirmarExclusao}
        onCancel={() => setApagando(null)}
        loading={excluindo}
      >
        <p>
          A conta <strong>{apagando?.institution} · {apagando?.accountNumber}</strong> será removida.
        </p>
        <p>
          {movDaApagada > 0 ? (
            <><strong>{movDaApagada} {movDaApagada === 1 ? "movimentação" : "movimentações"}</strong> dela também {movDaApagada === 1 ? "será apagada" : "serão apagadas"}. </>
          ) : (
            "Ela não tem movimentações. "
          )}
          Isso não pode ser desfeito.
        </p>
      </ConfirmDialog>
    </div>
  );
}