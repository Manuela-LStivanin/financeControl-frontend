import Icon, { IconName } from "./Icon";

type Option = { value: string; label: string; icon?: IconName };

type SegmentedControlProps = {
  label: string;
  hideLabel?: boolean; // esconde o rótulo na tela (continua disponível para leitores de tela)
  options: Option[];
  value: string;
  onChange: (value: string) => void;
};

// Grupo de botões em que só um fica selecionado por vez (como um rádio, mas no visual de "pílula")
export default function SegmentedControl({ label, hideLabel, options, value, onChange }: SegmentedControlProps) {
  return (
    <div className="fc-field">
      {!hideLabel && <span className="fc-field-label">{label}</span>}

      <div className="fc-seg" role="radiogroup" aria-label={label}>
        {/* Um botão para cada opção; o selecionado recebe a classe is-on */}
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={value === option.value ? "fc-seg-item is-on" : "fc-seg-item"}
            onClick={() => onChange(option.value)}
          >
            {option.icon && <Icon name={option.icon} size={16} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}