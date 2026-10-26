"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import SectionHeader from "../../components/SectionHeader";
import { apiFetch } from "@/lib/api";

// Formato de uma categoria, igual ao que a API devolve
type Categoria = { id: number; name: string; userId: number | null };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [erro, setErro] = useState("");

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
        actions={<Button icon="plus">Nova categoria</Button>}
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
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="tag" title="Você ainda não criou categorias">
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
    </div>
  );
}