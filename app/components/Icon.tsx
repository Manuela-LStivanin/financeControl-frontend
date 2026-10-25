const paths = {
  home: "M3 10.5 12 3l9 7.5M5.5 9v11h13V9",
  wallet: "M3 7.5A2.5 2.5 0 0 1 5.5 5H18v3M3 7.5V18a2 2 0 0 0 2 2h15V8H5.5A2.5 2.5 0 0 1 3 5.5M16 14h.01",
  swap: "M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7",
  tag: "M3 12V4h8l10 10-8 8L3 12ZM7.5 7.5h.01",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  close: "M6 6l12 12M18 6 6 18",
  check: "M5 12.5 10 17l9-10",
  in: "M17 7 7 17M7 9v8h8",
  out: "M7 17 17 7M9 7h8v8",
  chevron: "M9 6l6 6-6 6",
  lock: "M6 11h12v9H6v-9ZM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  calendar: "M4 6h16v14H4V6ZM4 10h16M8 3v4M16 3v4",
  repeat: "M4 12V9a3 3 0 0 1 3-3h12l-3-3M20 12v3a3 3 0 0 1-3 3H5l3 3",
  bank: "M3 9 12 4l9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18",
  alert: "M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
  coins: "M9 10c3.3 0 6-1.3 6-3s-2.7-3-6-3-6 1.3-6 3 2.7 3 6 3ZM3 7v5c0 1.7 2.7 3 6 3M3 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3M15 11.5c3.3 0 6 1.3 6 3s-2.7 3-6 3",
};

// O tipo IconName só aceita os nomes que existem no objeto acima
export type IconName = keyof typeof paths;

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export default function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className ? `fc-icon ${className}` : "fc-icon"}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}