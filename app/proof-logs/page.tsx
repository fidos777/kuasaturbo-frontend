"use client";

import Link from "next/link";

export default function ProofLogsPage() {
  // Sample proof data for demo
  const proofs = [
    {
      id: "qpf_20260125_vtk147_z2block_a1b2c3d4",
      timestamp: "2026-01-25 14:32:01",
      type: "Z2-TRIGGER",
      status: "BLOCKED",
      description: "Deposit threshold not met (13% < 30%)",
      workflow: "Solar Lead Validation",
    },
    {
      id: "qpf_20260125_ops001_complete_e5f6g7h8",
      timestamp: "2026-01-25 12:15:33",
      type: "WORKFLOW",
      status: "COMPLETED",
      description: "Expense categorization completed",
      workflow: "Upload Resit → Categorize",
    },
    {
      id: "qpf_20260124_mtg003_draft_i9j0k1l2",
      timestamp: "2026-01-24 16:45:12",
      type: "WORKFLOW",
      status: "COMPLETED",
      description: "Meeting notes processed",
      workflow: "Meeting Notes → Action List",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-b from-slate-100 to-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-black">Proof Logs</h1>
          <p className="mt-2 text-sm text-black/60">
            Immutable audit trail of all workflow executions and governance events.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-black/5 bg-black/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-black">Recent Proofs</span>
              <span className="text-xs text-black/50">Append-only registry</span>
            </div>
          </div>

          <div className="divide-y divide-black/5">
            {proofs.map((proof) => (
              <div key={proof.id} className="px-6 py-4 hover:bg-black/[0.01] transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          proof.status === "BLOCKED"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {proof.status}
                      </span>
                      <span className="text-xs text-black/40">{proof.type}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-black">{proof.description}</p>
                    <p className="mt-0.5 text-xs text-black/50">{proof.workflow}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/40">{proof.timestamp}</p>
                    <p className="mt-1 text-xs font-mono text-black/30 truncate max-w-[200px]">
                      {proof.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-black/5 bg-black/[0.02]">
            <p className="text-xs text-black/50 text-center">
              Powered by KuasaTurbo — Human decides. System records.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-black/[0.02] p-4 text-xs text-black/60">
          <strong>Nota:</strong> Proof logs are immutable and cryptographically sealed. No DELETE, no UPDATE.
          Each entry includes Blake3 hash and Ed25519 signature for verification.
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-semibold text-black/60 hover:text-black">
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
