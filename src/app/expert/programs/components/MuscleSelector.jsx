"use client";
// src/app/expert/programs/components/MuscleSelector.jsx
// Elit / premium anatomik kas hedefleme paneli.
// Sağdan hiyerarşik ağaçtan (Üst Vücut > Göğüs > Üst Göğüs ...) bir alt kas grubu seçildiğinde,
// solundaki insan figüründe sadece o bölge turuncu yanar. Many-to-many DB ilişkisi için
// `selectedMuscles` dizisi, muscleData.js içindeki `key` (örn. "chest_upper") değerlerini tutar.

import React, { useMemo, useState } from "react";
import { Activity, ChevronDown, Check } from "lucide-react";
import AnatomyFigure from "./AnatomyFigure";
import { MUSCLE_TREE, LEAF_BY_KEY, leafKeysToSvgIds } from "./muscleData";

export default function MuscleSelector({ selectedMuscles = [], onChange }) {
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(MUSCLE_TREE.flatMap((r) => r.groups.map((g) => [g.id, true])))
  );
  const [hoveredLeaf, setHoveredLeaf] = useState(null);
  const [activeView, setActiveView] = useState("both"); // "front" | "back" | "both"

  const toggleGroup = (groupId) => setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));

  const toggleLeaf = (key) => {
    if (selectedMuscles.includes(key)) {
      onChange(selectedMuscles.filter((k) => k !== key));
    } else {
      onChange([...selectedMuscles, key]);
    }
  };

  const highlightedIds = useMemo(() => leafKeysToSvgIds(selectedMuscles), [selectedMuscles]);
  const dimmedIds = useMemo(() => {
    if (!hoveredLeaf) return new Set();
    const leaf = LEAF_BY_KEY[hoveredLeaf];
    if (!leaf) return new Set();
    const ids = new Set(leaf.svgIds);
    // zaten seçili olanları dim etme, glow'da kalsın
    highlightedIds.forEach((id) => ids.delete(id));
    return ids;
  }, [hoveredLeaf, highlightedIds]);

  return (
    <div className="bg-[#111827] border border-slate-700 rounded-2xl p-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-500/10 rounded-lg">
            <Activity className="text-[#EA580C]" size={16} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white tracking-tight">Anatomik Hedefleme</h4>
            <p className="text-[11px] text-slate-400">Kas grubunu seç, figürde canlı olarak işaretlensin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />
          <span className="text-[11px] font-black bg-[#EA580C] text-white px-2.5 py-1 rounded-md shadow-[0_0_15px_rgba(234,88,12,0.4)] whitespace-nowrap">
            {selectedMuscles.length} Seçildi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)] gap-4 items-start">
        {/* Sol: Figür */}
        <div className="flex justify-center">
          <AnatomyFigure highlightedIds={highlightedIds} dimmedIds={dimmedIds} activeView={activeView} />
        </div>

        {/* Sağ: Hiyerarşik Ağaç */}
        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
          {MUSCLE_TREE.map((region) => (
            <div key={region.id}>
              <p className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase mb-1.5 pl-1">
                {region.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {region.groups.map((group) => (
                  <div
                    key={group.id}
                    className="bg-[#182134] border border-slate-700 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left group/head"
                    >
                      <span className="text-xs font-bold text-slate-200 group-hover/head:text-white transition-colors">
                        {group.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {countSelectedInGroup(group, selectedMuscles) > 0 && (
                          <span className="text-[9px] font-black text-[#EA580C] bg-[#EA580C]/10 border border-[#EA580C]/30 rounded-full px-1.5 py-0.5">
                            {countSelectedInGroup(group, selectedMuscles)}
                          </span>
                        )}
                        <ChevronDown
                          size={14}
                          className={`text-slate-500 transition-transform duration-300 ${
                            expanded[group.id] ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        expanded[group.id] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                          {group.leaves.map((leaf) => {
                            const isSelected = selectedMuscles.includes(leaf.key);
                            return (
                              <button
                                key={leaf.key}
                                type="button"
                                onClick={() => toggleLeaf(leaf.key)}
                                onMouseEnter={() => setHoveredLeaf(leaf.key)}
                                onMouseLeave={() => setHoveredLeaf(null)}
                                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-md border transition-all duration-200 ${
                                  isSelected
                                    ? "bg-[#EA580C]/15 text-white border-[#EA580C] shadow-[0_0_12px_rgba(234,88,12,0.2)]"
                                    : "bg-[#0B1120] text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                                }`}
                              >
                                {isSelected && <Check size={10} className="text-[#EA580C]" />}
                                {leaf.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function countSelectedInGroup(group, selectedMuscles) {
  return group.leaves.filter((leaf) => selectedMuscles.includes(leaf.key)).length;
}

function ViewToggle({ activeView, setActiveView }) {
  const options = [
    { id: "front", label: "Ön" },
    { id: "both", label: "İkisi" },
    { id: "back", label: "Arka" },
  ];
  return (
    <div className="flex items-center bg-[#0B1120] border border-slate-700 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setActiveView(opt.id)}
          className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
            activeView === opt.id
              ? "bg-[#EA580C] text-white shadow-[0_0_10px_rgba(234,88,12,0.4)]"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}