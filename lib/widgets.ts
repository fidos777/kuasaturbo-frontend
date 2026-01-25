export type WidgetFieldType = "text" | "textarea" | "number" | "date" | "file" | "select";

export interface WidgetField {
  name: string;
  type: WidgetFieldType;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Widget {
  id: string;
  label: string;
  description: string;
  credits: [number, number];
  fields: WidgetField[];
  badge?: "OPS" | "SALES" | "CREATIVE";
}

export const WIDGETS: Record<"ops" | "sales" | "creative", Widget[]> = {
  ops: [
    {
      id: "ops.expense_categorize.v1",
      label: "Upload Resit → Categorize",
      description: "Categorize expense dari gambar resit",
      credits: [2, 3],
      badge: "OPS",
      fields: [
        { name: "image", type: "file", label: "Upload Resit", required: true },
        { name: "note", type: "text", label: "Nota", required: false, placeholder: "Contoh: lunch client / petrol / toll" },
      ],
    },
    {
      id: "ops.daily_sales_log.v1",
      label: "Daily Sales / Daily Log",
      description: "Log jualan atau aktiviti harian (simple & cepat)",
      credits: [1, 1],
      badge: "OPS",
      fields: [
        { name: "amount", type: "number", label: "Jumlah (RM)", required: true, placeholder: "Contoh: 350" },
        { name: "date", type: "date", label: "Tarikh", required: true },
        { name: "note", type: "textarea", label: "Nota ringkas", required: false, placeholder: "Apa jadi hari ni? ringkas je." },
      ],
    },
    {
      id: "ops.meeting_actionlist.v1",
      label: "Meeting Notes → Action List",
      description: "Convert meeting notes jadi action items + PIC + due date",
      credits: [2, 4],
      badge: "OPS",
      fields: [
        { name: "notes", type: "textarea", label: "Paste meeting notes", required: true, placeholder: "Paste notes kat sini..." },
        { name: "participants", type: "text", label: "Participants", required: false, placeholder: "Contoh: Ali, Siti, Megat" },
      ],
    },
    {
      id: "ops.shift_handover.v1",
      label: "Shift Handover / Summary",
      description: "Buat summary handover shift (apa siap, apa pending, apa risiko)",
      credits: [1, 2],
      badge: "OPS",
      fields: [
        { name: "shift_info", type: "textarea", label: "Info shift semasa", required: true, placeholder: "Apa berlaku dalam shift ni..." },
        { name: "pending_items", type: "textarea", label: "Pending items", required: false, placeholder: "Apa belum siap / follow up..." },
      ],
    },
  ],

  sales: [
    {
      id: "sales.follow_up_draft.v1",
      label: "Follow-up WhatsApp/Email",
      description: "Draft mesej follow-up untuk prospect (ikut stage & tone)",
      credits: [1, 1],
      badge: "SALES",
      fields: [
        { name: "context", type: "textarea", label: "Konteks customer", required: true, placeholder: "Apa cerita prospect ni? apa dia tanya?" },
        { name: "tone", type: "select", label: "Nada", required: true, options: ["Lembut", "Neutral", "Tegas"] },
        { name: "stage", type: "select", label: "Stage", required: true, options: ["Baru", "Warm", "Lama"] },
      ],
    },
    {
      id: "sales.proposal_draft.v1",
      label: "Draft Proposal / Quotation",
      description: "Draft proposal/quotation awal yang kemas & structured",
      credits: [3, 5],
      badge: "SALES",
      fields: [
        { name: "business_type", type: "text", label: "Jenis bisnes", required: true, placeholder: "Contoh: solar installer / training provider" },
        { name: "product", type: "text", label: "Produk/Servis", required: true, placeholder: "Contoh: website + automation + ads" },
        { name: "price_estimate", type: "text", label: "Anggaran harga", required: false, placeholder: "Contoh: RM8,000 - RM12,000" },
      ],
    },
    {
      id: "sales.objection_reply.v1",
      label: "Objection Reply",
      description: "Jawab bantahan pelanggan (price, trust, timing, compare)",
      credits: [2, 2],
      badge: "SALES",
      fields: [
        { name: "objection", type: "textarea", label: "Apa bantahan customer?", required: true, placeholder: "Contoh: Mahal la… saya nak fikir dulu." },
        { name: "product_context", type: "text", label: "Produk/servis kau", required: true, placeholder: "Contoh: CRM automation / solar package" },
      ],
    },
  ],

  creative: [
    {
      id: "creative.thumbnail.v1",
      label: "Thumbnail Generator",
      description: "Generate idea thumbnail (copy + layout direction)",
      credits: [3, 3],
      badge: "CREATIVE",
      fields: [
        { name: "title", type: "text", label: "Title", required: true, placeholder: "Contoh: 7 Cara Close Customer" },
        {
          name: "style",
          type: "select",
          label: "Style",
          required: true,
          options: ["energetic", "premium", "simple_clean", "modern", "vibrant"],
        },
      ],
    },
  ],
};

export function getWidgetById(id: string): Widget | undefined {
  for (const group of Object.values(WIDGETS)) {
    const found = group.find((w) => w.id === id);
    if (found) return found;
  }
  return undefined;
}

export function getCreditLabel(credits: [number, number]): string {
  const [min, max] = credits;
  return min === max ? `${min} credit` : `${min}–${max} credits`;
}
