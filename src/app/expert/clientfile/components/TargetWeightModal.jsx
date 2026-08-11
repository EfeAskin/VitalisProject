"use client";

import React from "react";
import { Target, X } from "lucide-react";

export default function TargetWeightModal({
  isOpen,
  onClose,
  targetWeightInput,
  setTargetWeightInput,
  client,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-[#EA580C]" /> Hedef Kilo Belirle
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Danışanın sistemce hesaplanan en güncel ideal kilosu:{" "}
          <strong className="text-white">
            {client?.ideal_weight ? `${client.ideal_weight} kg` : "Ölçüm Yok"}
          </strong>
        </p>
        <input
          type="number"
          step="0.1"
          value={targetWeightInput}
          onChange={(e) => setTargetWeightInput(e.target.value)}
          placeholder="Hedef Kilo (Örn: 76)"
          className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-[#EA580C]"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
          >
            İptal
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}