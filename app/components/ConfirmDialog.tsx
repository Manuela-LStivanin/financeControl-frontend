"use client";

import Button from "./Button";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;   // explicação da consequência
  confirmLabel?: string;       // texto do botão vermelho
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

// Confirmação antes de uma ação que não dá para desfazer (apagar)
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Apagar",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      width={440}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger-solid" icon="trash" onClick={onConfirm} disabled={loading}>
            {loading ? "Apagando..." : confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}