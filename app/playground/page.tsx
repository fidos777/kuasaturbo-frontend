"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WIDGETS, getWidgetById, getCreditLabel, type Widget, type WidgetField } from "@/lib/widgets";
import { trackEvent } from "@/lib/track";

type TabType = "ops" | "sales" | "creative";

function TabButton({ 
  active, 
  onClick, 
  children,
  color 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 px-5 rounded-xl text-sm font-semibold transition ${
        active 
          ? `bg-white text-black shadow-sm border-b-2 ${color}` 
          : "text-black/60 hover:text-black hover:bg-black/5"
      }`}
    >
      {children}
    </button>
  );
}

function WidgetCard({ 
  widget, 
  selected, 
  onSelect 
}: { 
  widget: Widget; 
  selected: boolean; 
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition ${
        selected 
          ? "border-[#FE4800] bg-orange-50" 
          : "border-black/10 bg-white hover:bg-black/[0.02]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-black">{widget.label}</div>
          <div className="mt-1 text-xs text-black/60">{widget.description}</div>
        </div>
        <span className="shrink-0 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/70">
          {getCreditLabel(widget.credits)}
        </span>
      </div>
    </button>
  );
}

function DynamicField({ field, value, onChange }: { 
  field: WidgetField; 
  value: string; 
  onChange: (val: string) => void;
}) {
  const baseClass = "w-full rounded-xl border border-black/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FE4800]/20 focus:border-[#FE4800]";
  
  switch (field.type) {
    case "textarea":
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={baseClass}
        />
      );
    case "select":
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">Pilih...</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    case "number":
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );
    case "file":
      return (
        <div className={`${baseClass} bg-black/[0.02]`}>
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
            className="w-full text-sm"
          />
        </div>
      );
    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      );
  }
}

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const workParam = searchParams.get("work");
  
  const [activeTab, setActiveTab] = useState<TabType>("ops");
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (workParam) {
      const widget = getWidgetById(workParam);
      if (widget) {
        setSelectedWidget(widget);
        if (workParam.startsWith("ops.")) setActiveTab("ops");
        else if (workParam.startsWith("sales.")) setActiveTab("sales");
        else if (workParam.startsWith("creative.")) setActiveTab("creative");
        trackEvent("work_start", { widget_id: workParam, source: "deeplink" });
      }
    }
  }, [workParam]);

  const currentWidgets = useMemo(() => WIDGETS[activeTab] || [], [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedWidget(null);
    setFormData({});
    setOutput("");
    trackEvent("tab_view", { tab });
  };

  const handleWidgetSelect = (widget: Widget) => {
    setSelectedWidget(widget);
    setFormData({});
    setOutput("");
    trackEvent("work_start", { widget_id: widget.id, category: activeTab });
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerate = async () => {
    if (!selectedWidget) return;
    setIsGenerating(true);
    trackEvent("work_run", { widget_id: selectedWidget.id, category: activeTab });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockOutputs: Record<string, string> = {
      "ops.expense_categorize.v1": `📋 Expense Categorized\n\nKategori: Perbelanjaan Perniagaan\nJumlah: RM ${formData.amount || "0"}\nNota: ${formData.note || "Tiada nota"}\n\n✅ Sedia untuk report`,
      "ops.daily_sales_log.v1": `📊 Daily Log Recorded\n\nTarikh: ${formData.date || "Hari ini"}\nJumlah: RM ${formData.amount || "0"}\nNota: ${formData.note || "Tiada nota"}\n\n✅ Log disimpan`,
      "ops.meeting_actionlist.v1": `📝 Action Items\n\n1. [ ] Follow up dengan client\n2. [ ] Prepare proposal draft\n3. [ ] Schedule next meeting\n\nPIC: ${formData.participants || "TBD"}\nDue: End of week`,
      "ops.shift_handover.v1": `🔄 Shift Handover Summary\n\n✅ Completed:\n- Customer inquiries handled\n- Inventory checked\n\n⏳ Pending:\n${formData.pending_items || "- Tiada pending items"}\n\n⚠️ Notes:\n${formData.shift_info || "Tiada nota"}`,
      "sales.follow_up_draft.v1": `💬 Follow-up Draft (${formData.tone || "Neutral"})\n\nHi [Nama],\n\nTerima kasih atas masa anda semalam. Saya nak follow up berkenaan ${formData.context || "perbincangan kita"}.\n\nBoleh kita schedule call minggu ni?\n\nBest regards`,
      "sales.proposal_draft.v1": `📄 Proposal Draft\n\n${formData.business_type || "Business"} - ${formData.product || "Product/Service"}\n\nAnggaran: ${formData.price_estimate || "TBD"}\n\n[Sections to add: Scope, Timeline, Terms]`,
      "sales.objection_reply.v1": `💡 Objection Response\n\nCustomer: "${formData.objection || "..."}"\n\nResponse:\nSaya faham concern tu. Untuk ${formData.product_context || "produk kami"}, sebenarnya...\n\n[Continue with value proposition]`,
      "creative.thumbnail.v1": `🎨 Thumbnail Concept\n\nTitle: ${formData.title || "..."}\nStyle: ${formData.style || "modern"}\n\nLayout:\n- Bold text center\n- Contrasting background\n- Clear CTA element`,
    };

    setOutput(mockOutputs[selectedWidget.id] || "Draft generated. Review and edit as needed.");
    setIsGenerating(false);
  };

  const handleSaveDraft = () => {
    if (!selectedWidget) return;
    trackEvent("work_save_draft", { widget_id: selectedWidget.id });
    alert("Draft saved! (In production, this would save to your account)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-black/[0.02]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Playground</h1>
          <p className="mt-2 text-black/60">Pilih kerja, isi konteks, dapat draft. Simple.</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl border border-black/10 bg-black/[0.02] p-1 gap-1">
            <TabButton active={activeTab === "ops"} onClick={() => handleTabChange("ops")} color="border-blue-500">🔧 Ops (Daily)</TabButton>
            <TabButton active={activeTab === "sales"} onClick={() => handleTabChange("sales")} color="border-purple-500">💼 Sales</TabButton>
            <TabButton active={activeTab === "creative"} onClick={() => handleTabChange("creative")} color="border-orange-500">🎨 Creative</TabButton>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Pilih Kerja</h2>
              <div className="space-y-2">
                {currentWidgets.map((widget) => (
                  <WidgetCard key={widget.id} widget={widget} selected={selectedWidget?.id === widget.id} onSelect={() => handleWidgetSelect(widget)} />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">{selectedWidget ? selectedWidget.label : "Pilih kerja untuk mula"}</h2>
              {selectedWidget ? (
                <div className="space-y-4">
                  {selectedWidget.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-black mb-2">
                        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <DynamicField field={field} value={formData[field.name] || ""} onChange={(val) => handleFieldChange(field.name, val)} />
                    </div>
                  ))}
                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-sm text-black/60">Anggaran: {getCreditLabel(selectedWidget.credits)}</span>
                    <button onClick={handleGenerate} disabled={isGenerating} className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FE4800] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50">
                      {isGenerating ? "Generating..." : "Generate Draft"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-black/40"><p>← Pilih kerja dari senarai</p></div>
              )}
            </div>

            {output && (
              <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-black">Draft Output</h2>
                  <button onClick={handleSaveDraft} className="text-sm font-semibold text-[#FE4800] hover:underline">Save Draft</button>
                </div>
                <textarea value={output} onChange={(e) => setOutput(e.target.value)} rows={10} className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#FE4800]/20" />
                <p className="mt-3 text-xs text-black/50">💡 Edit as needed. Drafts are starting points, not final answers.</p>
              </div>
            )}

            <div className="rounded-xl bg-black/[0.02] p-4 text-xs text-black/60">
              <strong>Nota:</strong> Output ini adalah draft sahaja. Sentiasa review sebelum guna. Sistem boleh buat kesilapan — keputusan akhir adalah tanggungjawab anda.
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-semibold text-black/60 hover:text-black">← Kembali ke Homepage</Link>
        </div>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
