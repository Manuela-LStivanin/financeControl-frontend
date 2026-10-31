import { useId } from "react";
import Icon from "./Icon";

type Option = { value: string; label: string };

// Herda todas as propriedades de um <select> do HTML (value, onChange, disabled...)
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hideLabel?: boolean;   // esconde o rótulo na tela (leitores de tela continuam lendo)
  options: Option[];
  placeholder?: string;  // primeira opção, com valor vazio (ex.: "Todas as contas")
  error?: string;
};

// Lista de escolha (caixa de seleção) com o visual do design system
export default function Select({ label, hideLabel, options, placeholder, error, id, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className={error ? "fc-field fc-field-error" : "fc-field"}>
      <label className={hideLabel ? "fc-sr" : "fc-field-label"} htmlFor={selectId}>
        {label}
      </label>

      {/* O <select> nativo, com uma setinha desenhada por cima */}
      <div className="fc-selectwrap">
        <select id={selectId} className="fc-input fc-select" {...rest}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron" size={16} className="fc-select-caret" />
      </div>

      {error && (
        <p className="fc-field-msg fc-field-msg-error">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}