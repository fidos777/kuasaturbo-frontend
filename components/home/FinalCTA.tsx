import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-14">
        <div className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-black/[0.03] p-8 shadow-sm md:p-10">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-black md:text-3xl">
            Kerja harian dulu. Sistem ikut.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-black/65 md:text-base">
            Start kecil, repeat, kumpul signal. Bila request makin banyak, baru kita tambah feature yang betul-betul diperlukan.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/playground"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FE4800] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Open Playground
            </Link>
            <Link
              href="/partners"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-6 text-sm font-semibold text-black/80 shadow-sm transition hover:bg-black/[0.03]"
            >
              Partner Program
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
