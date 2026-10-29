"use client";

import { useEffect, useState } from "react";
import { Conta } from "../../components/AccountCard";
import Amount from "../../components/Amount";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import SectionHeader from "../../components/SectionHeader";
import SegmentedControl from "../../components/SegmentedControl";
import Select from "../../components/Select";
import TextField from "../../components/TextField";
import Toast from "../../components/Toast";
import TransactionTable, { Movimentacao } from "../../components/TransactionTable";
import TransactionForm from "./TransactionForm";
import { apiFetch } from "@/lib/api";
import { formatBRL, formatDate } from "@/lib/format";

type Categoria = { id: number; name: string };
type Filtros = { busca: string; accountId: string; categoryId: string; tipo: string };

// Tela de movimentações: filtros, resumo, tabela e os modais de registrar, editar e apagar
export default function Movimentacoes({ contaInicial }: { contaInicial: string }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [contas, setContas] = useState<Conta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");

  // Filtros: a conta pode vir do endereço (ex.: o link do card de conta)
  const filtrosVazios: Filtros = { busca: "", accountId: "", categoryId: "", tipo: "TODAS" };
  const [filtros, setFiltros] = useState<Filtros>({ ...filtrosVazios, accountId: contaInicial });

  // Modal de registrar/editar: undefined = fechado, null = registrando, Movimentacao = editando
  const [formMov, setFormMov] = useState<Movimentacao | null | undefined>(undefined);

  // Confirmação de exclusão e aviso de sucesso
  const [apagando, setApagando] = useState<Movimentacao | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; tom: "success" | "danger" } | null>(null);

  // Busca movimentações, contas e categorias ao mesmo tempo
  async function carregar() {
    try {
      const [listaMov, listaContas, listaCategorias] = await Promise.all([
        apiFetch("/transactions"),
        apiFetch("/accounts"),
        apiFetch("/categories"),
      ]);
      setMovimentacoes(listaMov);
      setContas(listaContas);
      setCategorias(listaCategorias);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Carrega uma vez, quando a tela abre
  useEffect(() => {
    carregar();
  }, []);

  // A API devolve só os ids; estas funções trazem os nomes para mostrar na tabela
  const nomeConta = (id: number) => contas.find((c) => c.id === id)?.institution ?? "—";
  const nomeCategoria = (id: number | null) => categorias.find((c) => c.id === id)?.name ?? null;

  function atualizarFiltro(campo: keyof Filtros, valor: string) {
    setFiltros({ ...filtros, [campo]: valor });
  }

  // Aplica os filtros na lista (a API já devolve da mais recente para a mais antiga)
  const busca = filtros.busca.trim().toLowerCase();
  const visiveis = movimentacoes
    .filter((m) => !filtros.accountId || m.accountId === Number(filtros.accountId))
    .filter((m) => !filtros.categoryId || m.categoryId === Number(filtros.categoryId))
    .filter((m) => filtros.tipo === "TODAS" || m.transactionType === filtros.tipo)
    .filter((m) => !busca || `${m.counterparty} ${m.description ?? ""}`.toLowerCase().includes(busca));

  const temFiltro = busca !== "" || filtros.accountId !== "" || filtros.categoryId !== "" || filtros.tipo !== "TODAS";

  // Resumo do que está na tela
  const somar = (tipo: string) =>
    visiveis.filter((m) => m.transactionType === tipo).reduce((soma, m) => soma + Number(m.amount), 0);
  const entradas = somar("ENTRADA");
  const saidas = somar("SAIDA");

  // Depois de salvar no modal: fecha, recarrega e mostra o aviso
  function aoSalvar(mensagem: string) {
    setFormMov(undefined);
    setAviso({ texto: mensagem, tom: "success" });
    carregar();
  }

  // Apaga na API depois da confirmação; a API desfaz o efeito no saldo
  async function confirmarExclusao() {
    if (!apagando) return;
    setExcluindo(true);
    try {
      await apiFetch(`/transactions/${apagando.id}`, { method: "DELETE" });
      setApagando(null);
      setAviso({ texto: "Movimentação apagada · saldo ajustado", tom: "danger" });
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
      setApagando(null);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="swap"
        eyebrow="Finanças"
        title="Movimentações"
        count={movimentacoes.length}
        description="Entradas e saídas de todas as contas. Lançar, editar ou apagar atualiza o saldo da conta."
        actions={
          <Button icon="plus" disabled={contas.length === 0} onClick={() => setFormMov(null)}>
            Nova movimentação
          </Button>
        }
      />

      {erro && <p className="fc-field-msg fc-field-msg-error">{erro}</p>}

      {/* Filtros */}
      <div className="fc-card fc-filters">
        <TextField label="Buscar" hideLabel placeholder="Buscar por quem pagou ou recebeu"
          value={filtros.busca} onChange={(e) => atualizarFiltro("busca", e.target.value)} />
        <Select label="Conta" hideLabel value={filtros.accountId} placeholder="Todas as contas"
          onChange={(e) => atualizarFiltro("accountId", e.target.value)}
          options={contas.map((c) => ({ value: String(c.id), label: c.institution }))} />
        <Select label="Categoria" hideLabel value={filtros.categoryId} placeholder="Todas as categorias"
          onChange={(e) => atualizarFiltro("categoryId", e.target.value)}
          options={categorias.map((c) => ({ value: String(c.id), label: c.name }))} />
        <SegmentedControl label="Tipo" hideLabel value={filtros.tipo} onChange={(valor) => atualizarFiltro("tipo", valor)}
          options={[
            { value: "TODAS", label: "Todas" },
            { value: "ENTRADA", label: "Entradas" },
            { value: "SAIDA", label: "Saídas" },
          ]} />
        {temFiltro && (
          <Button size="sm" variant="ghost" icon="close" onClick={() => setFiltros(filtrosVazios)}>
            Limpar
          </Button>
        )}
      </div>

      {/* Faixa de resumo do que está filtrado */}
      <div className="fc-strip">
        <div>
          <span className="fc-label">Entradas</span>
          <Amount value={entradas} type="ENTRADA" size="lg" />
        </div>
        <div>
          <span className="fc-label">Saídas</span>
          <Amount value={saidas} type="SAIDA" size="lg" />
        </div>
        <div>
          <span className="fc-label">Resultado</span>
          <Amount value={entradas - saidas} size="lg" />
        </div>
        <div>
          <span className="fc-label">Lançamentos</span>
          <strong className="fc-strip-n">{visiveis.length}</strong>
        </div>
      </div>

      {/* Tabela, ou o aviso de lista vazia */}
      {visiveis.length > 0 ? (
        <TransactionTable
          movimentacoes={visiveis}
          nomeConta={nomeConta}
          nomeCategoria={nomeCategoria}
          onEdit={(m) => setFormMov(m)}
          onDelete={(m) => setApagando(m)}
        />
      ) : contas.length === 0 ? (
        <EmptyState icon="wallet" title="Cadastre uma conta primeiro">
          As movimentações sempre pertencem a uma conta.
        </EmptyState>
      ) : (
        <EmptyState icon="search" title={temFiltro ? "Nenhuma movimentação com esses filtros" : "Nenhuma movimentação ainda"}>
          Ajuste os filtros ou lance uma nova movimentação.
        </EmptyState>
      )}

      {/* Modal de registrar/editar (só existe enquanto está aberto) */}
      {formMov !== undefined && (
        <TransactionForm
          movimentacao={formMov}
          contas={contas}
          categorias={categorias}
          contaInicial={filtros.accountId}
          onClose={() => setFormMov(undefined)}
          onSaved={aoSalvar}
        />
      )}

      {/* Confirmação de exclusão: mostra o ajuste que vai acontecer no saldo */}
      <ConfirmDialog
        open={apagando !== null}
        title="Apagar esta movimentação?"
        confirmLabel="Apagar movimentação"
        onConfirm={confirmarExclusao}
        onCancel={() => setApagando(null)}
        loading={excluindo}
      >
        {apagando && (
          <>
            <p>
              <strong>{apagando.counterparty}</strong> · {formatDate(apagando.date)} ·{" "}
              <Amount value={apagando.amount} type={apagando.transactionType} />
            </p>
            <p>
              O saldo de <strong>{nomeConta(apagando.accountId)}</strong> volta a ser ajustado:{" "}
              {apagando.transactionType === "SAIDA" ? "+" : "−"} {formatBRL(apagando.amount)}.
            </p>
          </>
        )}
      </ConfirmDialog>

      {aviso && <Toast message={aviso.texto} tone={aviso.tom} onClose={() => setAviso(null)} />}
    </div>
  );
}