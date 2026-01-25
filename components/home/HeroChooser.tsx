"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { WIDGETS, getCreditLabel } from "@/lib/widgets";
import { trackEvent } from "@/lib/track";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-black/70">
      {children}
    </span>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FE4800] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99]"
      onClick={() => trackEvent("conversion_click", { href })}
    >
      {children}
    </Link>
  );
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-black/80 shadow-sm transition hover:bg-black/5 active:scale-[0.99]"
      onClick={() => trackEvent("conversion_click", { href })}
    >
      {children}
    </Link>
  );
}

export default function HeroChooser() {
  const [mode, setMode] = useState<"ops" | "sales">("ops");

  const opsTop = useMemo(() => WIDGETS.ops.slice(0, 4), []);
  const salesTop = useMemo(() => WIDGETS.sales.slice(0, 3), []);

  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-white to-black/[0.02]">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Ops-first</Pill>
            <Pill>Harga ikut kerja</Pill>
            <Pill>
              <span className="text-[#0B1B3A] font-semibold">Certified by Qontrek</span>
            </Pill>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight text-black md:text-5xl">
              Kerja apa nak settle hari ni?
            </h1>
            <p className="mt-4 text-pretty text-base text-black/70 md:text-lg">
              Start dengan kerja harian dulu (Ops). Bila dah nampak pattern & proof, baru upgrade ke Sales + sistem.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PrimaryButton href="/playground">Try Playground</PrimaryButton>
              <GhostButton href="/pricing">View Pricing</GhostButton>
            </div>
          </div>

          {/* chooser */}
          <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-black">Pilih mode</div>
                <div className="text-xs text-black/60">Ops default sebab paling senang start & paling cepat nampak value.</div>
              </div>

              <div className="inline-flex rounded-xl border border-black/10 bg-black/[0.02] p-1">
                <button
                  type="button"
                  className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                    mode === "ops" ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black"
                  }`}
                  onClick={() => {
                    setMode("ops");
                    trackEvent("tab_view", { tab: "ops" });
                  }}
                >
                  Ops (Daily)
                </button>
                <button
                  type="button"
                  className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                    mode === "sales" ? "bg-white text-black shadow-sm" : "text-black/60 hover:text-black"
                  }`}
                  onClick={() => {
                    setMode("sales");
                    trackEvent("tab_view", { tab: "sales" });
                  }}
                >
                  Sales (Growth)
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(mode === "ops" ? opsTop : salesTop).map((w) => (
                <Link
                  key={w.id}
                  href={`/playground?work=${encodeURIComponent(w.id)}`}
                  className="group rounded-2xl border border-black/10 bg-white p-4 transition hover:bg-black/[0.02] active:scale-[0.997]"
                  onClick={() => trackEvent("work_start", { widget_id: w.id, category: mode })}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-black">{w.label}</div>
                      <div className="mt-1 text-xs text-black/60">{w.description}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/70">
                      {getCreditLabel(w.credits)}
                    </span>
                  </div>

                  <div className="mt-3 text-xs font-semibold text-[#FE4800] opacity-0 transition group-hover:opacity-100">
                    Buka di Playground →
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-black/60">
              <span>Tip: Ops widgets naturally ada &quot;proof&quot; (resit, log, handover) → senang jadi witness.</span>
              <Link className="font-semibold text-black/70 hover:underline" href="/docs">
                Learn how it works
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
