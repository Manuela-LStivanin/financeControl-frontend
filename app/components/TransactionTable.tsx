import Amount from "./Amount";
import Icon from "./Icon";
import { formatDate } from "@/lib/format";

// Formato de uma movimentação, igual ao que a API devolve
export type Movimentacao = {
  id: number;
  date: string;
  amount: string; // o Decimal chega como texto
  transactionType: "ENTRADA" | "SAIDA";
  description: string | null;
  counterparty: string;
  fixed: boolean;
  accountId: number;
  categoryId: number | null;
};

type TransactionTableProps = {
  movimentacoes: Movimentacao[];
  nomeConta: (id: number) => string;              // traduz o id da conta no nome do banco
  nomeCategoria: (id: number | null) => string | null;
  onEdit: (movimentacao: Movimentacao) => void;
  onDelete: (movimentacao: Movimentacao) => void;
};

// Tabela de movimentações: data, quem, categoria, conta, tipo, valor e ações
export default function TransactionTable({ movimentacoes, nomeConta, nomeCategoria, onEdit, onDelete }: TransactionTableProps) {
  return (
    <div className="fc-card fc-tablewrap">
      <table className="fc-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Movimentação</th>
            <th>Categoria</th>
            <th>Conta</th>
            <th>Tipo</th>
            <th className="fc-num">Valor</th>
            <th className="fc-actcol"><span className="fc-sr">Ações</span></th>
          </tr>
        </thead>

        <tbody>
          {movimentacoes.map((m) => {
            const saida = m.transactionType === "SAIDA";
            const categoria = nomeCategoria(m.categoryId);

            return (
              <tr key={m.id}>
                <td className="fc-meta-cell">{formatDate(m.date)}</td>

                {/* Quem pagou/recebeu, selo "Fixa" e a descrição embaixo */}
                <td>
                  <div className="fc-cell-main">
                    {m.counterparty}
                    {m.fixed && <span className="fc-badge"><Icon name="repeat" size={13} />Fixa</span>}
                  </div>
                  {m.description && <div className="fc-meta">{m.description}</div>}
                </td>

                <td>{categoria ? <span className="fc-badge">{categoria}</span> : <span className="fc-meta">Sem categoria</span>}</td>
                <td className="fc-meta-cell">{nomeConta(m.accountId)}</td>

                {/* Tipo: selo com palavra e seta, nunca só a cor */}
                <td>
                  <span className={saida ? "fc-badge fc-badge-saida" : "fc-badge fc-badge-entrada"}>
                    <Icon name={saida ? "out" : "in"} size={13} />
                    {saida ? "Saída" : "Entrada"}
                  </span>
                </td>

                <td className="fc-num"><Amount value={m.amount} type={m.transactionType} /></td>

                <td className="fc-actcol">
                  <div className="fc-rowactions">
                    <button type="button" className="fc-iconbtn" onClick={() => onEdit(m)} aria-label={`Editar ${m.counterparty}`} title="Editar">
                      <Icon name="edit" size={18} />
                    </button>
                    <button type="button" className="fc-iconbtn fc-iconbtn-danger" onClick={() => onDelete(m)} aria-label={`Apagar ${m.counterparty}`} title="Apagar">
                      <Icon name="trash" size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}   