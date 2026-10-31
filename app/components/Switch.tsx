import { useId } from "react";

type SwitchProps = {
  label: string;
  hint?: string; // explicação menor embaixo do rótulo
  checked: boolean;
  onChange: (checked: boolean) => void;
};

// Interruptor liga/desliga (como um checkbox, no visual de chave)
export default function Switch({ label, hint, checked, onChange }: SwitchProps) {
  const id = useId();

  return (
    <div className="fc-switchrow">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={checked ? "fc-switch is-on" : "fc-switch"}
        onClick={() => onChange(!checked)}
      >
        <span className="fc-switch-knob" />
      </button>
      <label htmlFor={id} className="fc-switch-label">
        {label}
        {hint && <span className="fc-switch-hint">{hint}</span>}
      </label>
    </div>
  );
}