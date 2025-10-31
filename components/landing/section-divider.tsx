"use client";

export function SectionDivider() {
  return (
    <div className="relative h-px w-full overflow-hidden">
      <div className="absolute inset-0 section-divider-glass" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-800/30 to-transparent" />
    </div>
  );
}

