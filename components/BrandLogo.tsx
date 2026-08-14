import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link href={href} className={`brandLogo${compact ? " brandLogoCompact" : ""}`} aria-label="Volt & Vroom">
      <Image src="/brand/vv-symbol.svg" alt="" width={58} height={28} priority />
      {!compact && <span aria-hidden="true">VOLT &amp; VROOM</span>}
    </Link>
  );
}
