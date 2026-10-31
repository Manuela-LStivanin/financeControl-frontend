"use client";

import { useState } from "react";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import SegmentedControl from "../../components/SegmentedControl";
import Select from "../../components/Select";
import Switch from "../../components/Switch";
import TextField from "../../components/TextField";
import { Conta } from "../../components/AccountCard";
import { Movimentacao } from "../../components/TransactionTable";
import { apiFetch } from "@/lib/api";
import { formatBRL, parseBRL } from "@/lib/format";

type Categoria = { id: number; name: string };

type TransactionFormProps = {
  movimentacao: Movimentacao | null; // null = registrando uma nova
  contas: Conta[];
  categorias: Categoria[];
  contaInicial: string;              // conta já escolhida ao abrir (ex.: o filtro da tela)
  onClose: () => void;
  onSaved: (mensagem: string) => void; // avisa a tela, que recarrega e mostra o aviso
};

type Erros = { amount?: string; date?: string; counterparty?: string; accountId?: string };

// Data de hoje no formato do campo de data ("2026-10-29"), no fuso de quem está usando
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Modal de registrar ou editar uma movimentação (entrada ou saída)
export default function TransactionForm({ movimentacao, contas, categorias, contaInicial, onClose, onSaved }: TransactionFormProps) {
  const editando = movimentacao !== null;

  // Começa com os dados da movimentação (editando) ou com valores padrão (registrando)
  const [form, setForm] = useState({
    transactionType: movimentacao?.transactionType ?? "SAIDA",
    amount: movimentacao ? Number(movimentacao.amount).toFixed(2).replace(".", ",") : "",
    date: movimentacao ? movimentacao.date.slice(0, 10) : hoje(),
    counterparty: movimentacao?.counterparty ?? "",
    accountId: movimentacao ? String(movimentacao.accountId) : contaInicial || String(contas[0]?.id ?? ""),
    categoryId: movimentacao?.categoryId ? String(movimentacao.categoryId) : "",
    description: movimentacao?.description ?? "",
    fixed: movimentacao?.fixed ?? false,
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");
  const [salvando, setSalvando] = useState(false);

  const saida = form.transactionType === "SAIDA";

  // Atualiza um campo do formulário mantendo os outros
  function atualizar(campo: keyof typeof form, valor: string | boolean) {
    setForm({ ...form, [campo]: valor });
  }

  // Confere os campos antes de enviar
  function validar(): Erros {
    const e: Erros = {};
    if (!(parseBRL(form.amount) > 0)) e.amount = "Informe um valor maior que zero";
    if (!form.date) e.date = "Informe a data";
    if (!form.counterparty.trim()) e.counterparty = saida ? "Para quem foi o pagamento?" : "De quem veio o dinheiro?";
    if (!form.accountId) e.accountId = "Escolha a conta";
    return e;
  }

  // Envia para a API: POST para registrar, PATCH para editar. A API atualiza o saldo da conta.
  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const valor = parseBRL(form.amount);
    const dados = {
      transactionType: form.transactionType,
      amount: valor,
      date: form.date,
      counterparty: form.counterparty.trim(),
      description: form.description.trim() || undefined,
      fixed: form.fixed,
    };

    setSalvando(true);
    try {
      if (editando) {
        // Na edição, "Sem categoria" vai como null para tirar a categoria
        const categoryId = form.categoryId ? Number(form.categoryId) : null;
        await apiFetch(`/transactions/${movimentacao.id}`, { method: "PATCH", body: JSON.stringify({ ...dados, categoryId }) });
        onSaved("Movimentação atualizada · saldo recalculado");
      } else {
        const categoryId = form.categoryId ? Number(form.categoryId) : undefined;
        await apiFetch("/transactions", {
          method: "POST",
          body: JSON.stringify({ ...dados, accountId: Number(form.accountId), categoryId }),
        });
        onSaved(`${saida ? "Saída" : "Entrada"} de ${formatBRL(valor)} registrada`);
      }
    } catch (e) {
      setErroApi((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open
      width={600}
      title={editando ? "Editar movimentação" : "Nova movimentação"}
      description="O saldo da conta é atualizado automaticamente."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="form-movimentacao" icon="check" disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : `Registrar ${saida ? "saída" : "entrada"}`}
          </Button>
        </>
      }
    >
      <form id="form-movimentacao" onSubmit={salvar} noValidate className="fc-modal-form">
        {/* Tipo: saída ou entrada */}
        <SegmentedControl
          label="Tipo"
          value={form.transactionType}
          onChange={(valor) => atualizar("transactionType", valor)}
          options={[
            { value: "SAIDA", label: "Saída", icon: "out" },
            { value: "ENTRADA", label: "Entrada", icon: "in" },
          ]}
        />

        <div className="fc-form-row">
          <TextField label="Valor (R$)" inputMode="decimal" placeholder="0,00" value={form.amount}
            onChange={(e) => atualizar("amount", e.target.value)} error={erros.amount} />
          <TextField label="Data" type="date" value={form.date}
            onChange={(e) => atualizar("date", e.target.value)} error={erros.date} />
        </div>

        {/* O rótulo muda conforme o tipo */}
        <TextField
          label={saida ? "Pago para" : "Recebido de"}
          placeholder={saida ? "Ex.: Mercado, Uber, aluguel" : "Ex.: empresa, cliente, transferência"}
          value={form.counterparty}
          onChange={(e) => atualizar("counterparty", e.target.value)}
          error={erros.counterparty}
        />

        <div className="fc-form-row">
          {/* A conta não muda depois de registrada (regra da API) */}
          <Select
            label="Conta"
            value={form.accountId}
            onChange={(e) => atualizar("accountId", e.target.value)}
            disabled={editando}
            error={erros.accountId}
            options={contas.map((c) => ({ value: String(c.id), label: `${c.institution} · ${c.accountNumber}` }))}
          />
          <Select
            label="Categoria"
            value={form.categoryId}
            onChange={(e) => atualizar("categoryId", e.target.value)}
            placeholder="Sem categoria"
            options={categorias.map((c) => ({ value: String(c.id), label: c.name }))}
          />
        </div>

        <TextField label="Descrição (opcional)" placeholder="Um detalhe para lembrar depois" value={form.description}
          onChange={(e) => atualizar("description", e.target.value)} />

        <Switch
          label="Movimentação fixa"
          hint="Se repete todo mês, como aluguel ou salário"
          checked={form.fixed}
          onChange={(valor) => atualizar("fixed", valor)}
        />

        {/* Erro vindo da API */}
        {erroApi && (
          <p className="fc-field-msg fc-field-msg-error">
            <Icon name="alert" size={14} />
            {erroApi}
          </p>
        )}
      </form>
    </Modal>
  );
}