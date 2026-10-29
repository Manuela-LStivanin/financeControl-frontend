"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import GoalCard, { Meta } from "../../components/GoalCard";
import Modal from "../../components/Modal"; // NOVO
import SectionHeader from "../../components/SectionHeader";
import TextField from "../../components/TextField"; // NOVO
import Toast from "../../components/Toast"; // NOVO
import { apiFetch } from "@/lib/api";

// NOVO: valores do formulário (tudo texto, porque vem dos campos)
const formularioVazio = { description: "", targetAmount: "", deadline: "", currentAmount: "" };
type Erros = Partial<Record<keyof typeof formularioVazio, string>>;

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [erro, setErro] = useState("");

  // NOVO: modal de criar/editar
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Meta | null>(null); // null = criando
  const [form, setForm] = useState(formularioVazio);
  const [erros, setErros] = useState<Erros>({});
  const [erroApi, setErroApi] = useState("");
  const [salvando, setSalvando] = useState(false);

  // NOVO: aviso de sucesso
  const [aviso, setAviso] = useState<string | null>(null);

  // Busca as metas na API
  async function carregar() {
    try {
      setMetas(await apiFetch("/goals"));
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Carrega uma vez, quando a tela abre
  useEffect(() => {
    carregar();
  }, []);

  // NOVO: atualiza um campo do formulário mantendo os outros
  function atualizar(campo: keyof typeof formularioVazio, valor: string) {
    setForm({ ...form, [campo]: valor });
  }

  // NOVO: abre o modal vazio, para criar
  function abrirNova() {
    setEditando(null);
    setForm(formularioVazio);
    setErros({});
    setErroApi("");
    setModalAberto(true);
  }

  // NOVO: abre o modal preenchido, para editar
  function abrirEditar(meta: Meta) {
    setEditando(meta);
    setForm({
      description: meta.description ?? "",
      targetAmount: String(Number(meta.targetAmount)),
      deadline: meta.deadline.slice(0, 10), // "2027-12-31T00:00..." vira "2027-12-31"
      currentAmount: String(Number(meta.currentAmount)),
    });
    setErros({});
    setErroApi("");
    setModalAberto(true);
  }

  // NOVO: confere os campos antes de enviar, com as mesmas regras da API
  function validar(): Erros {
    const e: Erros = {};
    const hoje = new Date().toISOString().slice(0, 10);

    if (!form.description.trim()) e.description = "Dê um nome para a meta";
    if (!(Number(form.targetAmount) > 0)) e.targetAmount = "O valor alvo precisa ser maior que zero";
    if (!form.deadline) e.deadline = "Informe o prazo";
    else if (form.deadline < hoje) e.deadline = "O prazo não pode ser no passado";
    if (editando && Number(form.currentAmount) < 0) e.currentAmount = "O valor guardado não pode ser negativo";
    return e;
  }

  // NOVO: envia para a API (POST para criar, PUT para editar)
  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroApi("");

    const novosErros = validar();
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    const corpo = {
      description: form.description.trim(),
      targetAmount: Number(form.targetAmount),
      deadline: form.deadline,
      // "Já guardado" só existe na edição
      ...(editando ? { currentAmount: Number(form.currentAmount || 0) } : {}),
    };

    setSalvando(true);
    try {
      if (editando) {
        await apiFetch(`/goals/${editando.id}`, { method: "PUT", body: JSON.stringify(corpo) });
      } else {
        await apiFetch("/goals", { method: "POST", body: JSON.stringify(corpo) });
      }
      setModalAberto(false);
      setAviso(editando ? "Meta atualizada" : "Meta criada");
      await carregar();
    } catch (e) {
      setErroApi((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="target"
        eyebrow="Planejamento"
        title="Metas"
        count={metas.length}
        description="Quanto você quer juntar e até quando. Guarde valores aos poucos e acompanhe o progresso."
        actions={<Button icon="plus" onClick={abrirNova}>Nova meta</Button>} // NOVO: onClick
      />

      {erro && <p className="fc-field-msg fc-field-msg-error">{erro}</p>}

      {metas.length > 0 ? (
        <div className="fc-grid">
          {metas.map((m) => (
            <GoalCard key={m.id} meta={m} onEdit={() => abrirEditar(m)} /> // NOVO: onEdit
          ))}
        </div>
      ) : (
        <EmptyState
          icon="target"
          title="Nenhuma meta ainda"
          action={<Button icon="plus" onClick={abrirNova}>Criar a primeira meta</Button>} // NOVO
        >
          Uma meta tem valor alvo e prazo. Ex.: reserva de emergência até dezembro.
        </EmptyState>
      )}

      {/* NOVO: modal de criar/editar */}
      <Modal
        open={modalAberto}
        title={editando ? "Editar meta" : "Nova meta"}
        description={editando ? undefined : "Defina quanto quer juntar e até quando."}
        onClose={() => setModalAberto(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" form="form-meta" disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar" : "Criar meta"}
            </Button>
          </>
        }
      >
        <form id="form-meta" onSubmit={salvar} noValidate className="fc-auth-fields">
          <TextField
            label="Descrição"
            placeholder="Ex.: Viagem de férias"
            value={form.description}
            onChange={(e) => atualizar("description", e.target.value)}
            error={erros.description}
            autoFocus
          />
          <div className="fc-form-row">
            <TextField
              label="Valor alvo (R$)"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              value={form.targetAmount}
              onChange={(e) => atualizar("targetAmount", e.target.value)}
              error={erros.targetAmount}
            />
            <TextField
              label="Prazo"
              type="date"
              value={form.deadline}
              onChange={(e) => atualizar("deadline", e.target.value)}
              error={erros.deadline}
            />
          </div>
          {editando && (
            <TextField
              label="Já guardado (R$)"
              type="number"
              min="0"
              step="0.01"
              value={form.currentAmount}
              onChange={(e) => atualizar("currentAmount", e.target.value)}
              error={erros.currentAmount}
            />
          )}
          {erroApi && <p className="fc-field-msg fc-field-msg-error">{erroApi}</p>}
        </form>
      </Modal>

      {/* NOVO: aviso de sucesso */}
      {aviso && <Toast message={aviso} onClose={() => setAviso(null)} />}
    </div>
  );
}