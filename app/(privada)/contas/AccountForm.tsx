"use client";

import { useState } from "react";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import SegmentedControl from "../../components/SegmentedControl";
import TextField from "../../components/TextField";
import { Conta } from "../../components/AccountCard";
import { apiFetch } from "@/lib/api";
import { formatBRL, parseBRL } from "@/lib/format";

type AccountFormProps = {
  conta: Conta | null; 
  onClose: () => void;
  onSaved: () => void; // chamado depois de salvar, para a tela recarregar a lista
};

type Erros = { institution?: string; accountNumber?: string; balance?: string };

// Modal de criar ou editar uma conta bancária
export default function AccountForm({ conta, onClose, onSaved }: AccountFormProps) {
  const editando = conta !== null;

  // Começa com os dados da conta (editando) ou vazio (criando)
  const [form, setForm] = useState({
    accountType: conta?.accountType ?? "CORRENTE",
    institution: conta?.institution ?? "",
    accountNumber: conta?.accountNumber ?? "",
    pixKey: conta?.pixKey ?? "",
    balance: "",
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo: keyof typeof form, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // Confere os campos antes de enviar
  function validar(): Erros {
    const e: Erros = {};
    if (!form.institution.trim()) e.institution = "Informe o banco ou instituição";
    if (!form.accountNumber.trim()) e.accountNumber = "Informe o número da conta";
    if (!editando && form.balance !== "" && isNaN(parseBRL(form.balance))) e.balance = "Use só números, ex.: 1.250,00";
    return e;
  }

  // Envia para a API: POST para criar, PATCH para editar
  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const dados = {
      accountType: form.accountType,
      institution: form.institution.trim(),
      accountNumber: form.accountNumber.trim(),
      pixKey: form.pixKey.trim() || undefined,
    };

    setSalvando(true);
    try {
      if (editando) {
        await apiFetch(`/accounts/${conta.id}`, { method: "PATCH", body: JSON.stringify(dados) });
      } else {
        const saldoInicial = form.balance === "" ? 0 : parseBRL(form.balance);
        await apiFetch("/accounts", { method: "POST", body: JSON.stringify({ ...dados, balance: saldoInicial }) });
      }
      onSaved();
    } catch (e) {
      // Ex.: 409 "Já existe uma conta com esse número nessa instituição"
      setErroApi((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open
      title={editando ? "Editar conta" : "Nova conta"}
      description={editando ? "O saldo muda só pelas movimentações." : "Cadastre uma conta bancária para lançar movimentações nela."}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="form-conta" icon="check" disabled={salvando}>
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar conta"}
          </Button>
        </>
      }
    >
      <form id="form-conta" onSubmit={salvar} noValidate className="fc-modal-form">
        <SegmentedControl
          label="Tipo"
          value={form.accountType}
          onChange={(valor) => atualizar("accountType", valor)}
          options={[
            { value: "CORRENTE", label: "Conta corrente" },
            { value: "POUPANCA", label: "Poupança" },
          ]}
        />

        <div className="fc-form-row">
          <TextField label="Instituição" placeholder="Ex.: Nubank" value={form.institution}
            onChange={(e) => atualizar("institution", e.target.value)} error={erros.institution} />
          <TextField label="Número da conta" placeholder="0000-0" value={form.accountNumber}
            onChange={(e) => atualizar("accountNumber", e.target.value)} error={erros.accountNumber} />
        </div>

        <TextField label="Chave Pix (opcional)" placeholder="E-mail, CPF, telefone ou aleatória" value={form.pixKey}
          onChange={(e) => atualizar("pixKey", e.target.value)} />

        {/* Saldo: informado só na criação; depois, só as movimentações mudam o saldo */}
        {editando ? (
          <div className="fc-note">
            <Icon name="lock" size={16} />
            <span>Saldo atual: <strong>{formatBRL(conta.balance)}</strong>. Para corrigir, lance uma movimentação.</span>
          </div>
        ) : (
          <TextField label="Saldo inicial (R$)" inputMode="decimal" placeholder="0,00" value={form.balance}
            onChange={(e) => atualizar("balance", e.target.value)} error={erros.balance} />
        )}

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