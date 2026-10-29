import { formatBRL } from "@/lib/format";

type AmountProps = {
  value: number | string;
  size?: "md" | "lg";
};

// Valor em reais, com algarismos alinhados (tabulares)
export default function Amount({ value, size = "md" }: AmountProps) {
  return <span className={size === "lg" ? "fc-amount fc-amount-lg" : "fc-amount"}>{formatBRL(value)}</span>;
}