"use client";

import { PERSONAS } from "@/lib/constants";

interface PersonaSelectorProps {
  selectedPersona: string;
  onSelectPersona: (persona: string) => void;
  disabled?: boolean;
}

export default function PersonaSelector({ selectedPersona, onSelectPersona, disabled }: PersonaSelectorProps) {
  return (
    <div className="space-y-2">
      <select
        value={selectedPersona}
        onChange={(e) => onSelectPersona(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select a persona...</option>
        {PERSONAS.map((persona) => (
          <option key={persona.id} value={persona.id}>
            {persona.label}
          </option>
        ))}
      </select>
      {selectedPersona && (
        <p className="text-xs text-slate-500">
          {PERSONAS.find(p => p.id === selectedPersona)?.description}
        </p>
      )}
    </div>
  );
}
