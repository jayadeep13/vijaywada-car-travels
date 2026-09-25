"use client";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Saving…", variant = "primary", confirm }: { children: React.ReactNode; pendingText?: string; variant?: "primary" | "ghost" | "danger"; confirm?: string }) {
  const { pending } = useFormStatus();
  const cls =
    variant === "danger"
      ? "btn !min-h-10 !text-sm border border-danger/30 text-danger hover:bg-[#fdecea]"
      : variant === "ghost"
        ? "btn btn-ghost !min-h-10 !text-sm"
        : "btn btn-primary !min-h-10 !text-sm";
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${cls} disabled:opacity-60`}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
