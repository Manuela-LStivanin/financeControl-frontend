import { formatBRL } from "@/lib/format";

type AmountProps = {
  value: number | string;
  size?: "md" | "lg";
  type?: "ENTRADA" | "SAIDA"; // NOVO: com tipo, o valor ganha sinal (+/−) e cor
};

// Valor em reais, com algarismos alinhados (tabulares).
// Entrada: "+ R$ 100,00" em azul. Saída: "− R$ 100,00" em coral.
export default function Amount({ value, size = "md", type }: AmountProps) {
  // NOVO: sinal e cor conforme o tipo
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