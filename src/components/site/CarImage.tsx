import Image from "next/image";

/** Car photo with a neutral silhouette fallback when no image has been uploaded yet. */
export function CarImage({ src, alt, sizes, priority = false, className = "" }: { src: string | null | undefined; alt: string; sizes: string; priority?: boolean; className?: string }) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-contain ${className}`} />;
  }
  return (
    <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#f1f1ee] to-[#e8e7e3]" role="img" aria-label={alt}>
      <svg viewBox="0 0 240 90" className="w-3/5 text-line-strong" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 62c0-7 3-11 10-13l30-7 26-17c6-4 12-6 20-6h46c8 0 14 2 20 7l20 16 22 4c9 2 14 7 14 15v5c0 4-3 6-7 6h-13a19 19 0 0 0-37 0H82a19 19 0 0 0-37 0H27c-4 0-7-2-7-6Zm76-35-17 13h46V21h-11c-7 0-12 2-18 6Zm39-6v19h50l-15-12c-5-5-10-7-17-7Z"
        />
        <circle cx="63" cy="73" r="13" fill="currentColor" />
        <circle cx="182" cy="73" r="13" fill="currentColor" />
      </svg>
    </div>
  );
}
