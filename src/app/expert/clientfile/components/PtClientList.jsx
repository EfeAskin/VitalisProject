"use client";

import React, { useState, useMemo } from "react";
import { User, Phone, Ruler, Scale, Eye, X, ChevronRight, Target, Dumbbell, ShieldCheck } from "lucide-react";

export default function PtClientList({ clients = [], onSelectClient }) {
  const [selectedPopupClient, setSelectedPopupClient] = useState(null);

  // Danışanları user_id / client_id / id bazında gruplayarak tekil kart haline getir
  const groupedClients = useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) return [];

    const map = new Map();

    clients.forEach((c) => {
      const clientId = c.client_id || c.id || c.user_id;
      if (!clientId) return;

      // Paket isimlerini diziye dönüştür
      let existingPkgs = [];
      if (Array.isArray(c.active_packages)) {
        existingPkgs = c.active_packages
          .map((p) => (typeof p === "string" ? p : p.name || p.package_name || ""))
          .filter(Boolean);
      } else if (c.active_package) {
        existingPkgs = [c.active_package];
      } else if (c.package_name) {
        existingPkgs = [c.package_name];
      }

      if (!map.has(clientId)) {
        map.set(clientId, {
          ...c,
          id: clientId,
          client_id: c.client_id || clientId,
          active_packages: existingPkgs.length > 0 ? existingPkgs : ["Aktif Paket"]
        });
      } else {
        const existing = map.get(clientId);

        // Paketleri mükerrer olmayacak şekilde birleştir
        existingPkgs.forEach((pkgName) => {
          if (pkgName && !existing.active_packages.includes(pkgName)) {
            existing.active_packages.push(pkgName);
          }
        });

        // Amaç veya Program eksikse diğer kayıttan tamamla
        if ((!existing.goal || existing.goal === "Belirtilmedi") && c.goal && c.goal !== "Belirtilmedi") {
          existing.goal = c.goal;
        }
        if (
          (!existing.program_name || existing.program_name === "Henüz Program Atanmadı") &&
          c.program_name &&
          c.program_name !== "Henüz Program Atanmadı"
        ) {
          existing.program_name = c.program_name;
        }
      }
    });

    return Array.from(map.values());
  }, [clients]);

  const getFallbackAvatar = (firstName, lastName) => {
    const fullName = `${firstName || "Danışan"} ${lastName || ""}`.trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ea580c&color=fff&bold=true`;
  };

  if (!groupedClients || groupedClients.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <User size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Aktif Danışan Bulunmuyor</h3>
        <p className="text-xs text-slate-400">
          Kabul ettiğiniz başvurular veya aktif aboneliği bulunan danışanlar burada listelenecektir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedClients.map((client) => {
          const fallback = getFallbackAvatar(client.first_name, client.last_name);
          const packages =
            Array.isArray(client.active_packages) && client.active_packages.length > 0
              ? client.active_packages
              : [client.active_package || "Aktif Paket"];

          return (
            <div
              key={client.id || client.client_id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 hover:border-slate-700 transition-all shadow-xl relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Profil Üst Başlığı */}
                <div className="flex items-start gap-4">
                  <img
                    src={client.avatar && client.avatar.trim() !== "" ? client.avatar : fallback}
                    alt={`${client.first_name || ""} ${client.last_name || ""}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallback;
                    }}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#EA580C]/40 p-0.5 bg-slate-950 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-lg font-black text-white truncate">
                      {client.first_name} {client.last_name}
                    </h3>

                    {/* Aktif Paket Rozetleri (Yan yana Çoklu Gösterim) */}
                    <div className="flex flex-wrap gap-1.5">
                      {packages.map((pkg, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20 truncate max-w-full"
                        >
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Amaç ve Takip Ettiği Program */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Target size={14} className="text-[#EA580C] shrink-0" />
                    <span className="font-bold text-slate-400">Amaç:</span>
                    <span className="text-white truncate font-medium">{client.goal || "Belirtilmedi"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Dumbbell size={14} className="text-amber-400 shrink-0" />
                    <span className="font-bold text-slate-400">Program:</span>
                    <span className="text-amber-400 font-medium truncate">
                      {client.program_name || "Henüz Program Atanmadı"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Butonları */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPopupClient(client)}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye size={14} />
                  <span>Hızlı Detay</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectClient(client.client_id || client.id)}
                  className="px-3 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#EA580C]/20"
                >
                  <span>Dosyaya Git</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- POPUP / MODAL (Hızlı Detay) --- */}
      {selectedPopupClient && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPopupClient(null);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setSelectedPopupClient(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={
                  selectedPopupClient.avatar && selectedPopupClient.avatar.trim() !== ""
                    ? selectedPopupClient.avatar
                    : getFallbackAvatar(selectedPopupClient.first_name, selectedPopupClient.last_name)
                }
                alt={selectedPopupClient.first_name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackAvatar(
                    selectedPopupClient.first_name,
                    selectedPopupClient.last_name
                  );
                }}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#EA580C] shrink-0"
              />
              <div className="min-w-0">
                <h3 className="text-xl font-black text-white truncate">
                  {selectedPopupClient.first_name} {selectedPopupClient.last_name}
                </h3>
                <p className="text-xs text-slate-400 truncate">{selectedPopupClient.email || "-"}</p>
              </div>
            </div>

            {/* Aktif Hizmetler Listesi (Popup) */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> Aktif Hizmetler
              </span>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(selectedPopupClient.active_packages) && selectedPopupClient.active_packages.length > 0
                  ? selectedPopupClient.active_packages
                  : [selectedPopupClient.active_package || "Aktif Paket"]
                ).map((pkg, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20"
                  >
                    {pkg}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Yaş / Cinsiyet:</span>
                <p className="text-white font-extrabold">
                  {selectedPopupClient.age ? `${selectedPopupClient.age} Yaş` : "-"} / {selectedPopupClient.gender || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Telefon:</span>
                <p className="text-emerald-400 font-extrabold flex items-center gap-1 truncate">
                  <Phone size={12} className="shrink-0" /> {selectedPopupClient.phone || "-"}
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-bold">Boy:</span>
                <p className="text-white font-extrabold flex items-center gap-1">
                  <Ruler size={12} className="shrink-0" />{" "}
                  {selectedPopupClient.height ? `${selectedPopupClient.height} cm` : "-"}
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-bold">Mevcut Kilo:</span>
                <p className="text-amber-400 font-extrabold flex items-center gap-1">
                  <Scale size={12} className="shrink-0" />{" "}
                  {selectedPopupClient.current_weight || selectedPopupClient.weight
                    ? `${selectedPopupClient.current_weight || selectedPopupClient.weight} kg`
                    : "-"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const targetId = selectedPopupClient.client_id || selectedPopupClient.id;
                setSelectedPopupClient(null);
                onSelectClient(targetId);
              }}
              className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-[#EA580C]/20"
            >
              Tam Danışan Dosyasını Aç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}