import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    { n: "1", title: "Pilih kerja", desc: "Ops / Sales / Creative — ikut apa yang kau nak settle." },
    { n: "2", title: "Isi konteks", desc: "Letak info minimum je. Lagi jelas, lagi padu output." },
    { n: "3", title: "AI draft siap", desc: "Dapat draft yang boleh terus copy-paste, edit sikit, jalan." },
  ];

  return (
    <section className="border-b border-black/5 bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-black md:text-2xl">Macam mana dia jalan?</h2>
          <p className="mt-2 text-sm text-black/65">
            Konsep dia simple: kerja → konteks → draft. Start kecil, repeat, kumpul signal.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FE4800] text-sm font-extrabold text-white">
                {s.n}
              </div>
              <div className="mt-3 text-sm font-semibold text-black">{s.title}</div>
              <div className="mt-1 text-sm text-black/60">{s.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/playground"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FE4800] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Start sekarang
          </Link>
          <Link href="/docs" className="text-sm font-semibold text-black/70 hover:underline">
            Baca docs →
          </Link>
        </div>
      </div>
    </section>
  );
}
