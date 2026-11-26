import { formatBRL } from "@/lib/format";

type AmountProps = {
  value: number | string;
  size?: "md" | "lg";
  type?: "ENTRADA" | "SAIDA";
};

// Valor em reais, com algarismos alinhados (tabulares).
export default function Amount({ value, size = "md", type }: AmountProps) {
  // Sinal e cor conforme o tipo
  const sinal = type === "ENTRADA" ? "+ " : type === "SAIDA" ? "− " : "";
  const classes = [
    "fc-amount",
    size === "lg" ? "fc-amount-lg" : "",
    type === "ENTRADA" ? "fc-amount-entrada" : "",
    type === "SAIDA" ? "fc-amount-saida" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{sinal + formatBRL(value)}</span>;
}