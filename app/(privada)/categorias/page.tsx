"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import SectionHeader from "../../components/SectionHeader";
import TextField from "../../components/TextField";
import Toast from "../../components/Toast"; // NOVO
import { apiFetch } from "@/lib/api";

// Formato de uma categoria, igual ao que a API devolve
type Categoria = { id: number; name: string; userId: number | null };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");

  // Modal de criar/renomear
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null); // null = criando
  const [nome, setNome] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [salvando, setSalvando] = useState(false);

  // Confirmação de exclusão
  const [apagando, setApagando] = useState<Categoria | null>(null); // null = fechada
  const [excluindo, setExcluindo] = useState(false);

  // NOVO: aviso de sucesso (null = nenhum aviso na tela)
  const [aviso, setAviso] = useState<{ texto: string; tom: "success" | "danger" } | null>(null);

  // Busca as categorias na API
  async function carregar() {
    try {
      setCategorias(await apiFetch("/categories"));
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  // Carrega uma vez, quando a tela abre
  useEffect(() => {
    carregar();
  }, []);

  // Abre o modal vazio, para criar
  function abrirNova() {
    setEditando(null);
    setNome("");
    setErroModal("");
    setModalAberto(true);
  }

  // Abre o modal com o nome atual, para renomear
  function abrirRenomear(categoria: Categoria) {
    setEditando(categoria);
    setNome(categoria.name);
    setErroModal("");
    setModalAberto(true);
  }

  // Valida e envia para a API (POST para criar, PUT para renomear)
  async function salvar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 3 || nomeLimpo.length > 50) {
      setErroModal("O nome precisa ter entre 3 e 50 caracteres");
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await apiFetch(`/categories/${editando.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: nomeLimpo }),
        });
      } else {
        await apiFetch("/categories", {
          method: "POST",
          body: JSON.stringify({ name: nomeLimpo }),
        });
      }
      setModalAberto(false);
      setAviso({ texto: editando ? "Categoria renomeada" : "Categoria criada", tom: "success" }); // NOVO
      await carregar(); // atualiza a lista
    } catch (e) {
      // Ex.: 409 "Já existe uma categoria com esse nome"
      setErroModal((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  // Apaga na API depois da confirmação
  async function confirmarExclusao() {
    if (!apagando) return;
    setExcluindo(true);
    try {
      await apiFetch(`/categories/${apagando.id}`, { method: "DELETE" });
      setApagando(null);
      setAviso({ texto: "Categoria apagada", tom: "danger" }); // NOVO
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
      setApagando(null);
    } finally {
      setExcluindo(false);
    }
  }

  // Separa em dois grupos: as padrão não têm dono (userId vazio)
  const padrao = categorias.filter((c) => c.userId === null);
  const minhas = categorias.filter((c) => c.userId !== null);

  return (
    <div className="fc-page">
      <SectionHeader
        level="page"
        icon="tag"
        eyebrow="Organização"
        title="Categorias"
        count={categorias.length}
        description="Agrupe as movimentações. As categorias padrão valem para todos e não podem ser alteradas."
        actions={
          <Button icon="plus" onClick={abrirNova}>
            Nova categoria
          </Button>
        }
      />

      {erro && <p className="fc-field-msg fc-field-msg-error">{erro}</p>}

      <div className="fc-two">
        <section className="fc-panel">
          <SectionHeader icon="tag" title="Minhas categorias" count={minhas.length} description="Criadas por você" />
          {minhas.length > 0 ? (
            <div>
              {minhas.map((c) => (
                <div key={c.id} className="fc-catrow">
                  <span className="fc-caticon"><Icon name="tag" size={18} /></span>
                  <span className="fc-catname">{c.name}</span>
                  <button
                    type="button"
                    className="fc-iconbtn"
                    onClick={() => abrirRenomear(c)}
                    aria-label={`Renomear ${c.name}`}
                    title="Renomear"
                  >
                    <Icon name="edit" size={18} />
                  </button>
                  <button
                    type="button"
                    className="fc-iconbtn fc-iconbtn-danger"
                    onClick={() => setApagando(c)}
                    aria-label={`Apagar ${c.name}`}
                    title="Apagar"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="tag"
              title="Você ainda não criou categorias"
              action={<Button icon="plus" onClick={abrirNova}>Criar categoria</Button>}
            >
              Crie categorias próprias, como Faculdade ou Pets, além das padrão.
            </EmptyState>
          )}
        </section>

        <section className="fc-panel">
          <SectionHeader icon="lock" title="Categorias padrão" count={padrao.length} description="Disponíveis desde o cadastro" />
          <div>
            {padrao.map((c) => (
              <div key={c.id} className="fc-catrow">
                <span className="fc-caticon"><Icon name="lock" size={18} /></span>
                <span className="fc-catname">{c.name}</span>
                <span className="fc-badge">Padrão</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal de criar/renomear */}
      <Modal
        open={modalAberto}
        title={editando ? "Renomear categoria" : "Nova categoria"}
        description={editando ? undefined : "Ela aparece só para você, junto com as padrão."}
        onClose={() => setModalAberto(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-categoria" disabled={salvando}>
              {salvando ? "Salvando..." : editando ? "Salvar" : "Criar categoria"}
            </Button>
          </>
        }
      >
        <form id="form-categoria" onSubmit={salvar} noValidate>
          <TextField
            label="Nome"
            placeholder="Ex.: Faculdade"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={erroModal}
            autoFocus
          />
        </form>
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={apagando !== null}
        title={`Apagar a categoria ${apagando?.name ?? ""}?`}
        confirmLabel="Apagar categoria"
        onConfirm={confirmarExclusao}
        onCancel={() => setApagando(null)}
        loading={excluindo}
      >
        <p>
          As movimentações dessa categoria <strong>não serão apagadas</strong>: elas ficam como{" "}
          <strong>Sem categoria</strong>.
        </p>
      </ConfirmDialog>

      {/* NOVO: aviso de sucesso, só aparece quando existe um aviso */}
      {aviso && <Toast message={aviso.texto} tone={aviso.tom} onClose={() => setAviso(null)} />}
    </div>
  );
}