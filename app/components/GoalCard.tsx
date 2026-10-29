import Button from "./Button";
import Icon from "./Icon";
import { formatBRL, formatDate } from "@/lib/format"; // NOVO: formatBRL

// Formato de uma meta, igual ao que a API devolve
export type Meta = {
  id: number;
  description: string | null;
  targetAmount: string;  // vem como texto por causa do Decimal
  currentAmount: string;
  deadline: string;
  achieved: boolean;     // calculado pela API
};

// O card recebe a meta e, opcionalmente, o que fazer ao guardar, editar e apagar
type GoalCardProps = {
  meta: Meta;
  onDeposit?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

// Card de uma meta: descrição, prazo, valores, barra de progresso e situação
export default function GoalCard({ meta, onDeposit, onEdit, onDelete }: GoalCardProps) {
  const atual = Number(meta.currentAmount);
  const alvo = Number(meta.targetAmount);

  // Porcentagem guardada, limitada a 100 (pode ter guardado mais que o alvo)
  const pct = alvo > 0 ? Math.min(100, Math.round((atual / alvo) * 100)) : 0;

  // NOVO: quanto falta para chegar no alvo (nunca negativo)
  const falta = Math.max(0, alvo - atual);

  // Atrasada: não foi atingida e o prazo já passou
  const atrasada = !meta.achieved && new Date(meta.deadline) < new Date();

  return (
    <article className={meta.achieved ? "fc-goal is-done" : "fc-goal"}>
      <header className="fc-goal-head">
        <span className="fc-goal-icon">
          <Icon name={meta.achieved ? "check" : "target"} size={20} />
        </span>
        <div className="fc-goal-id">
          <h3 className="fc-goal-title">{meta.description || "Meta"}</h3>
          <span className="fc-meta">
            <Icon name="calendar" size={13} /> até {formatDate(meta.deadline)}
          </span>
        </div>
        {meta.achieved && <span className="fc-badge fc-badge-entrada"><Icon name="check" size={13} />Concluída</span>}
        {atrasada && <span className="fc-badge fc-badge-saida"><Icon name="alert" size={13} />Atrasada</span>}
      </header>

      {/* NOVO: quanto já guardou, "de" quanto quer juntar */}
      <div className="fc-goal-values">
        <span className="fc-goal-amount">{formatBRL(atual)}</span>
        <span className="fc-meta">de {formatBRL(alvo)}</span>
      </div>

      <div
        className="fc-goal-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Progresso de ${meta.description || "meta"}`}
      >
        <div className="fc-goal-fill" style={{ width: `${pct}%` }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* NOVO: porcentagem com o que falta embaixo */}
        <span className="fc-goal-status">
          <span className="fc-goal-pct">{pct}%</span>
          <span className="fc-meta">{meta.achieved ? "meta atingida" : `faltam ${formatBRL(falta)}`}</span>
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {onDeposit && !meta.achieved && (
            <Button size="sm" variant="secondary" icon="plus" onClick={onDeposit}>
              Guardar
            </Button>
          )}
          {onEdit && (
            <button type="button" className="fc-iconbtn" onClick={onEdit} aria-label={`Editar ${meta.description || "meta"}`} title="Editar">
              <Icon name="edit" size={18} />
            </button>
          )}
          {onDelete && (
            <button type="button" className="fc-iconbtn fc-iconbtn-danger" onClick={onDelete} aria-label={`Apagar ${meta.description || "meta"}`} title="Apagar">
              <Icon name="trash" size={18} />
            </button>
          )}
        </span>
      </div>
    </article>
  );
}