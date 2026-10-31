import Amount from "./Amount";
import Icon, { IconName } from "./Icon";

type StatCardProps = {
  label: string;
  value: number;
  icon?: IconName;
  note?: string; // texto pequeno embaixo do valor
  tone?: "default" | "brand"; // "brand" = card azul de destaque
};

// Card com um número de resumo da Visão geral (ex.: Saldo total)
export default function StatCard({ label, value, icon, note, tone = "default" }: StatCardProps) {
  return (
    <div className={tone === "brand" ? "fc-card fc-stat fc-stat-brand" : "fc-card fc-stat"}>
      <div className="fc-stat-top">
        <span className="fc-label">{label}</span>
        {icon && (
          <span className="fc-stat-icon">
            <Icon name={icon} size={18} />
          </span>
        )}
      </div>
      <Amount value={value} size="lg" />
      {note && <div className="fc-stat-note">{note}</div>}
    </div>
  );
}