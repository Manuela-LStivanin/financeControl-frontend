import Icon, { IconName } from "./Icon";

type EmptyStateProps = {
  title: string;
  icon?: IconName;
  children?: React.ReactNode; // texto explicativo
  action?: React.ReactNode;   // botão, ex.: "Criar categoria"
};

// Mostrado quando uma lista não tem nada ainda: convida a criar o primeiro item
export default function EmptyState({ title, icon = "search", children, action }: EmptyStateProps) {
  return (
    <div className="fc-empty">
      <span className="fc-empty-icon">
        <Icon name={icon} size={24} />
      </span>
      <strong>{title}</strong>
      {children && <p className="fc-empty-text">{children}</p>}
      {action}
    </div>
  );
}