import Link from "next/link";
import Amount from "./Amount";
import Icon from "./Icon";

// Formato de uma conta, igual ao que a API devolve
export type Conta = {
  id: number;
  accountNumber: string;
  institution: string;
  pixKey: string | null;
  balance: string; 
  accountType: "CORRENTE" | "POUPANCA";
};

type AccountCardProps = {
  conta: Conta;
  movimentacoes: number; 
  onEdit: () => void;
  onDelete: () => void;
};

const tipos = { CORRENTE: "Conta corrente", POUPANCA: "Poupança" };

// Card de uma conta bancária: instituição, saldo, chave Pix e ações
export default function AccountCard({ conta, movimentacoes, onEdit, onDelete }: AccountCardProps) {
  return (
    <article className="fc-card fc-account">
      {/* Topo: inicial do banco, nome, tipo e número, e os botões de editar/apagar */}
      <header className="fc-account-head">
        <span className="fc-account-mono" aria-hidden="true">
          {conta.institution.charAt(0).toUpperCase()}
        </span>
        <div className="fc-account-id">
          <h3 className="fc-account-inst">{conta.institution}</h3>
          <div className="fc-meta">
            {tipos[conta.accountType]} · {conta.accountNumber}
          </div>
        </div>
        <button type="button" className="fc-iconbtn" onClick={onEdit} aria-label={`Editar ${conta.institution}`} title="Editar">
          <Icon name="edit" size={18} />
        </button>
        <button type="button" className="fc-iconbtn fc-iconbtn-danger" onClick={onDelete} aria-label={`Apagar ${conta.institution}`} title="Apagar">
          <Icon name="trash" size={18} />
        </button>
      </header>

      {/* Saldo atual */}
      <div>
        <div className="fc-label">Saldo</div>
        <Amount value={conta.balance} size="lg" />
      </div>

      {/* Rodapé: chave Pix e atalho para as movimentações da conta */}
      <footer className="fc-account-foot">
        <span className="fc-meta">{conta.pixKey ? `Pix: ${conta.pixKey}` : "Sem chave Pix"}</span>
        <Link href={`/movimentacoes?accountId=${conta.id}`} className="fc-link">
          {movimentacoes} {movimentacoes === 1 ? "movimentação" : "movimentações"}
          <Icon name="chevron" size={16} />
        </Link>
      </footer>
    </article>
  );
}