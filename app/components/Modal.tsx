"use client";

import { useEffect } from "react";
import Icon from "./Icon";

type ModalProps = {
  open: boolean;              // aberto ou fechado
  title: string;
  description?: string;
  onClose: () => void;        // o que fazer ao fechar
  footer?: React.ReactNode;   // botões de baixo (Cancelar, Salvar)
  children: React.ReactNode;  // conteúdo (o formulário)
  width?: number;
};

// Janela que aparece por cima da tela. Fecha no X, no Esc ou clicando fora.
export default function Modal({ open, title, description, onClose, footer, children, width = 480 }: ModalProps) {
  // Enquanto aberto, fecha ao apertar Esc
  useEffect(() => {
    if (!open) return;
    function aoApertarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", aoApertarTecla);
    return () => document.removeEventListener("keydown", aoApertarTecla);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fc-overlay"
      onMouseDown={(e) => {
        // Clicou no fundo escuro (e não dentro da janela): fecha
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fc-modal" role="dialog" aria-modal="true" aria-labelledby="fc-modal-title" style={{ maxWidth: width }}>
        <header className="fc-modal-head">
          <div className="fc-modal-headtext">
            <h2 id="fc-modal-title" className="fc-modal-title">{title}</h2>
            {description && <p className="fc-modal-desc">{description}</p>}
          </div>
          <button type="button" className="fc-iconbtn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="fc-modal-body">{children}</div>
        {footer && <footer className="fc-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}