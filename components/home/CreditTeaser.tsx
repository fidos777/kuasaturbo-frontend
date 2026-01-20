import Link from "next/link";

export default function CreditTeaser() {
  return (
    <section className="border-b border-black/5 bg-gradient-to-b from-white to-black/[0.02]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-black md:text-2xl">Harga ikut kerja, bukan langganan</h2>
            <p className="mt-2 text-sm text-black/65">
              SME tak suka komitmen awal. So kita buat pay-per-work: kerja kecil pun boleh start.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">Ops: 1–4 credits</span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">Sales: 1–5 credits</span>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70">Creative: ~3 credits</span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-semibold text-black/80 shadow-sm transition hover:bg-black/[0.03]"
              >
                Tengok pricing
              </Link>
              <Link href="/api-access" className="text-sm font-semibold text-black/70 hover:underline">
                Nak integrate API? →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-black">Contoh &quot;Ops-first&quot;</div>
            <ul className="mt-3 space-y-2 text-sm text-black/65">
              <li>• Upload resit → AI categorize → auto-ready for report</li>
              <li>• Daily sales log → track trend → nampak leakage</li>
              <li>• Meeting notes → action list → reduce &quot;lost follow-up&quot;</li>
              <li>• Shift handover → team alignment → less chaos</li>
            </ul>

            <div className="mt-5 rounded-xl bg-black/[0.03] p-4 text-xs text-black/60">
              Unexpected insight: Ops bukan &quot;boring&quot; — Ops lah yang paling senang create proof + habit.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
