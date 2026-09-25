import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-24 text-center md:py-32">
      <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">This page does not exist</h1>
      <p className="mx-auto mt-4 max-w-md text-graphite">The link may be old or mistyped. Try one of these instead.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/cars" className="btn btn-primary">See cars and rates</Link>
        <Link href="/book" className="btn btn-ghost">Book a car</Link>
      </div>
    </div>
  );
}
