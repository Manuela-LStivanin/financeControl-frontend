import Icon, { IconName } from "./Icon";

type SectionHeaderProps = {
  title: string;
  icon?: IconName;
  eyebrow?: string;           // texto pequeno acima do título
  description?: string;
  count?: number;             // quantidade ao lado do título
  level?: "page" | "section"; // "page" = título grande do topo da tela
  actions?: React.ReactNode;  // botões à direita
};

// Cabeçalho usado no topo de cada tela e no topo de cada painel
export default function SectionHeader({
  title,
  icon,
  eyebrow,
  description,
  count,
  level = "section",
  actions,
}: SectionHeaderProps) {
  const Titulo = level === "page" ? "h1" : "h2";

  return (
    <div className={level === "page" ? "fc-sechead fc-sechead-page" : "fc-sechead"}>
      {icon && (
        <span className="fc-sechead-icon">
          <Icon name={icon} size={level === "page" ? 26 : 22} />
        </span>
      )}
      <div className="fc-sechead-text">
        {eyebrow && <div className="fc-sechead-eyebrow">{eyebrow}</div>}
        <Titulo className="fc-sechead-title">
          {title}
          {count !== undefined && <span className="fc-sechead-count">{count}</span>}
        </Titulo>
        {description && <p className="fc-sechead-desc">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}