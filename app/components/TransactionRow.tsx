import Amount from "./Amount";
import Icon from "./Icon";
import { Movimentacao } from "./TransactionTable";
import { formatDate } from "@/lib/format";

type TransactionRowProps = {
  movimentacao: Movimentacao;
  categoria: string | null;
  conta: string;
};

// Uma movimentação em formato de lista: seta, quem, detalhes e valor
export default function TransactionRow({ movimentacao: m, categoria, conta }: TransactionRowProps) {
  const saida = m.transactionType === "SAIDA";

  // "31/10/2026 · Alimentação · Nubank · Fixa" (o que for null fica de fora)
  const detalhes = [formatDate(m.date), categoria ?? "Sem categoria", conta, m.fixed ? "Fixa" : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="fc-txn">
      <span className={saida ? "fc-txn-dir is-out" : "fc-txn-dir is-in"}>
        <Icon name={saida ? "out" : "in"} size={18} />
      </span>
      <span className="fc-txn-main">
        <span className="fc-txn-who">{m.counterparty}</span>
        <span className="fc-meta">
          {detalhes}
          {m.description ? ` — ${m.description}` : ""}
        </span>
      </span>
      <Amount value={m.amount} type={m.transactionType} />
    </div>
  );
}