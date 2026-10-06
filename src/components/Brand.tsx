export function Logo({ height = 16, className = "" }: { height?: number; className?: string }) {
  return <span role="img" aria-label="QUART" className={`logo ${className}`} style={{ height }} />;
}

export function Symbol({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <span role="img" aria-label="QUART" className={`symbol ${className}`} style={style} />;
}

export const INSTAGRAM = { handle: "@quart_hub", url: "https://instagram.com/quart_hub" };
