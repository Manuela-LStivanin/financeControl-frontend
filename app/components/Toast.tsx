"use client";

import { useEffect } from "react";
import Icon from "./Icon";

type ToastProps = {
  message: string;
  tone?: "success" | "danger"; // danger = ações de apagar
  onClose: () => void;
};

// Aviso rápido no canto da tela, que some sozinho depois de 3 segundos
export default function Toast({ message, tone = "success", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer); // cancela se o aviso sumir antes
  }, [message, onClose]);

  return (
    <div className={tone === "danger" ? "fc-toast fc-toast-danger" : "fc-toast"} role="status">
      <span className="fc-toast-icon">
        <Icon name={tone === "danger" ? "trash" : "check"} size={16} />
      </span>
      {message}
    </div>
  );
}