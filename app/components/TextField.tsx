import { useId } from "react";
import Icon from "./Icon";

// Herda todas as propriedades de um <input> do HTML 
type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function TextField({ label, error, id, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className={error ? "fc-field fc-field-error" : "fc-field"}>
      <label className="fc-field-label" htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className="fc-input" aria-invalid={error ? true : undefined} {...rest} />
      {error && (
        <p className="fc-field-msg fc-field-msg-error">
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}