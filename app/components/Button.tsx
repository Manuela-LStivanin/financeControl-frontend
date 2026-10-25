import Icon, { IconName } from "./Icon";


type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
  size?: "md" | "sm";
  icon?: IconName;
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = ["fc-btn", `fc-btn-${variant}`, size === "sm" ? "fc-btn-sm" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" {...rest} className={classes}>
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}