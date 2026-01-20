import Link from "next/link";
import { WIDGETS, getCreditLabel } from "@/lib/widgets";

export default function TopKerja() {
  const popular = [
    WIDGETS.ops[0],
    WIDGETS.ops[1],
    WIDGETS.ops[2],
    WIDGETS.sales[0],
    WIDGETS.sales[2],
  ].filter(Boolean);

  return (
    <section className="border-b border-black/5 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-black md:text-2xl">Kerja Paling Popular</h2>
            <p className="mt-2 text-sm text-black/65">Yang paling common untuk SME: cepat, repeatable, dan senang nampak ROI.</p>
          </div>
          <Link href="/playground" className="hidden text-sm font-semibold text-black/70 hover:underline md:inline">
            Explore semua →
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {popular.map((w) => (
            <Link
              key={w.id}
              href={`/playground?work=${encodeURIComponent(w.id)}`}
              className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:bg-black/[0.02]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-black">{w.label}</div>
                  <div className="mt-1 text-xs text-black/60">{w.description}</div>
                </div>
                <div className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/70">
                  {getCreditLabel(w.credits)}
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#FE4800]">Try now →</div>
            </Link>
          ))}
        </div>

        <div className="mt-5 md:hidden">
          <Link href="/playground" className="text-sm font-semibold text-black/70 hover:underline">
            Explore semua →
          </Link>
        </div>
      </div>
    </section>
  );
}
