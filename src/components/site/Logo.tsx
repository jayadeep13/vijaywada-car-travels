import Image from "next/image";
import Link from "next/link";

export function Logo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label={`${name} home`}>
      <Image
        src={logoUrl || "/vctlogo.webp"}
        alt={name}
        width={1774}
        height={522}
        sizes="(min-width: 768px) 190px, 150px"
        className="h-11 w-auto sm:h-12 md:h-14"
        priority
      />
    </Link>
  );
}
