"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  User,
  Phone,
  Ruler,
  Scale,
  Eye,
  X,
  ChevronRight,
  Target,
  Dumbbell,
  Utensils,
  ShieldCheck,
  Users,
  Loader2,
  Apple,
  Flame,
} from "lucide-react";

export default function PtClientList({ clients = [], onSelectClient }) {
  const [selectedPopupClient, setSelectedPopupClient] = useState(null);
  const [fetchedClients, setFetchedClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // LocalStorage üzerinden yetki token'ını okuma
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    try {
      return (
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("jwt") ||
        null
      );
    } catch (e) {
      console.error("Token okunurken hata:", e);
      return null;
    }
  };

  // LocalStorage üzerinden Uzman / Kullanıcı ID'sini okuma
  const getStoredSpecialistId = () => {
    if (typeof window === "undefined") return null;
    try {
      const directId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("specialist_id") ||
        localStorage.getItem("dietitian_id") ||
        localStorage.getItem("id");
      if (directId) return directId;

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return (
          userObj.id ||
          userObj.user_id ||
          userObj.specialist_id ||
          userObj.dietitian_id ||
          null
        );
      }
    } catch (e) {
      console.error("LocalStorage okunurken hata oluştu:", e);
    }
    return null;
  };

  useEffect(() => {
    const fetchClientsIfNeeded = async () => {
      const specId = getStoredSpecialistId();
      if (!specId) return;

      setIsLoading(true);
      try {
        const token = getAuthToken();
        const headers = {
          "Content-Type": "application/json",
        };

        // 401 Unauthorized hatasını engellemek için Bearer Token ekliyoruz
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const requestUrl = `${baseUrl.replace(/\/$/, "")}/api/expert-clients/dashboard/${specId}`;

        let res = await fetch(requestUrl, {
          method: "GET",
          headers: headers,
          credentials: "include",
        });

        if (!res.ok && res.status !== 401) {
          // Relatif path yedek isteği
          res = await fetch(`/api/expert-clients/dashboard/${specId}`, {
            method: "GET",
            headers: headers,
            credentials: "include",
          });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.active_clients) {
            setFetchedClients(data.active_clients);
          } else if (Array.isArray(data)) {
            setFetchedClients(data);
          }
        } else {
          console.error("Danışan verisi alınamadı. HTTP Status:", res?.status);
        }
      } catch (err) {
        console.error("Danışanlar otomatik getirilirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!clients || clients.length === 0) {
      fetchClientsIfNeeded();
    }
  }, [clients]);

  const dataSource = useMemo(() => {
    return Array.isArray(clients) && clients.length > 0 ? clients : fetchedClients;
  }, [clients, fetchedClients]);

  const groupedClients = useMemo(() => {
    if (!Array.isArray(dataSource) || dataSource.length === 0) return [];

    const map = new Map();

    const extractProgramNames = (c) => {
      const candidates = [
        c.assigned_programs,
        c.programs,
        c.program_name,
        c.diet_programs,
        c.nutrition_programs,
        c.nutrition_program,
        c.assigned_diets,
        c.diet_name,
        c.workout_name,
        c.template_name,
        c.diet_template,
      ];

      const list = [];

      candidates.forEach((raw) => {
        if (!raw) return;

        if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) list.push(...parsed);
            else if (typeof parsed === "object" && parsed !== null) list.push(parsed);
            else list.push(parsed);
          } catch {
            list.push(raw);
          }
        } else if (Array.isArray(raw)) {
          list.push(...raw);
        } else if (typeof raw === "object") {
          list.push(raw);
        } else {
          list.push(raw);
        }
      });

      return list
        .flat(Infinity)
        .map((p) => {
          if (!p) return "";
          if (typeof p === "string") return p.trim();
          if (typeof p === "object") {
            return (
              p.title ||
              p.name ||
              p.program_name ||
              p.diet_name ||
              p.workout_name ||
              p.template_name ||
              p.diet_template?.title ||
              p.diet_template?.name ||
              (typeof p.diet_template === "string" ? p.diet_template : "") ||
              p.program_details?.title ||
              p.program_details?.name ||
              ""
            ).trim();
          }
          return String(p).trim();
        })
        .filter((p) => p && p !== "Henüz Program Atanmadı");
    };

    const extractPackageNames = (c) => {
      const raw =
        c.active_packages ||
        c.active_package ||
        c.package_name ||
        c.requested_package;
      if (!raw) return [];

      let list = [];
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          list = Array.isArray(parsed) ? parsed : [raw];
        } catch {
          list = [raw];
        }
      } else if (Array.isArray(raw)) {
        list = raw;
      } else {
        list = [raw];
      }

      return list
        .flat(Infinity)
        .map((p) => {
          if (!p) return "";
          if (typeof p === "string") return p.trim();
          if (typeof p === "object")
            return (p.name || p.package_name || p.title || "").trim();
          return String(p).trim();
        })
        .filter(Boolean);
    };

    dataSource.forEach((c) => {
      const clientId = c.client_id || c.id || c.user_id;
      if (clientId === undefined || clientId === null) return;

      const currentPkgs = extractPackageNames(c);
      const currentProgs = extractProgramNames(c);

      if (!map.has(clientId)) {
        map.set(clientId, {
          ...c,
          id: clientId,
          client_id: c.client_id || clientId,
          active_packages:
            currentPkgs.length > 0 ? [...new Set(currentPkgs)] : ["Aktif Paket"],
          assigned_programs: [...new Set(currentProgs)],
        });
      } else {
        const existing = map.get(clientId);

        currentPkgs.forEach((pkgName) => {
          if (pkgName && !existing.active_packages.includes(pkgName)) {
            existing.active_packages.push(pkgName);
          }
        });

        currentProgs.forEach((progName) => {
          if (progName && !existing.assigned_programs.includes(progName)) {
            existing.assigned_programs.push(progName);
          }
        });

        if (
          (!existing.goal || existing.goal === "Belirtilmedi") &&
          c.goal &&
          c.goal !== "Belirtilmedi"
        ) {
          existing.goal = c.goal;
        }
      }
    });

    return Array.from(map.values());
  }, [dataSource]);

  const getFallbackAvatar = (firstName, lastName) => {
    const fullName = `${firstName || "Danışan"} ${lastName || ""}`.trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fullName
    )}&background=ea580c&color=fff&bold=true`;
  };

  if (isLoading && (!groupedClients || groupedClients.length === 0)) {
    return (
      <div className="relative overflow-hidden bg-[#1A1F45] border border-orange-500/30 rounded-3xl p-12 text-center space-y-4 backdrop-blur-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col items-center justify-center min-h-[250px]">
        <Loader2 size={36} className="text-orange-500 animate-spin" />
        <p className="text-sm font-heading font-bold text-slate-300">
          Aktif Danışan Verileri Yükleniyor...
        </p>
      </div>
    );
  }

  if (!groupedClients || groupedClients.length === 0) {
    return (
      <div className="relative overflow-hidden bg-[#1A1F45] border border-orange-500/30 rounded-3xl p-12 text-center space-y-4 backdrop-blur-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)]">
        <div className="w-16 h-16 bg-[#121633] text-slate-400 rounded-2xl border border-orange-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          <Users size={32} className="text-orange-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-black text-white">
            Aktif Danışan Bulunmuyor
          </h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto font-medium">
            Kabul ettiğiniz başvurular veya aktif aboneliği bulunan danışanlar
            burada listelenecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedClients.map((client) => {
          const fallback = getFallbackAvatar(
            client.first_name,
            client.last_name
          );
          const packages =
            Array.isArray(client.active_packages) &&
            client.active_packages.length > 0
              ? client.active_packages
              : ["Aktif Paket"];

          const programs =
            Array.isArray(client.assigned_programs) &&
            client.assigned_programs.length > 0
              ? client.assigned_programs
              : [];

          return (
            <div
              key={client.id || client.client_id}
              className="group relative bg-[#1B204A] border border-orange-500/30 hover:border-orange-500 rounded-3xl p-6 space-y-5 backdrop-blur-2xl shadow-[0_0_25px_rgba(249,115,22,0.15)] hover:shadow-[0_0_35px_rgba(249,115,22,0.3)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={
                        client.avatar &&
                        typeof client.avatar === "string" &&
                        client.avatar.trim() !== ""
                          ? client.avatar
                          : fallback
                      }
                      alt={`${client.first_name || ""} ${client.last_name || ""}`}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallback;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/60 p-0.5 bg-[#121633] shadow-[0_0_15px_rgba(249,115,22,0.2)] group-hover:border-orange-400 transition-colors"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="text-lg font-heading font-black text-white truncate group-hover:text-orange-400 transition-colors">
                      {client.first_name} {client.last_name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5">
                      {packages.map((pkg, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-[10px] font-heading font-black uppercase text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 truncate max-w-full shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                        >
                          {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 bg-[#121633] p-4 rounded-2xl border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.08)]">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Target size={14} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-slate-400">Amaç:</span>
                    <span className="text-slate-200 truncate font-medium">
                      {client.goal || "Belirtilmedi"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-orange-500/10">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Dumbbell size={14} className="text-amber-400 shrink-0" />
                      <span className="font-bold text-slate-400">Atanan Programlar:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pl-5">
                      {programs.length > 0 ? (
                        programs.map((prog, idx) => {
                          const isDietProg =
                            typeof prog === "string" &&
                            (prog.toLowerCase().includes("diet") ||
                              prog.toLowerCase().includes("diyet") ||
                              prog.toLowerCase().includes("beslenme"));
                          return (
                            <span
                              key={idx}
                              className={`text-[11px] font-heading font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                isDietProg
                                  ? "text-emerald-300 bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                                  : "text-amber-300 bg-amber-500/15 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                              }`}
                            >
                              {isDietProg ? (
                                <Utensils size={10} className="text-emerald-400 shrink-0" />
                              ) : (
                                <Dumbbell size={10} className="text-amber-400 shrink-0" />
                              )}
                              {prog}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Henüz Program Atanmadı
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPopupClient(client)}
                  className="px-3 py-2.5 bg-[#121633] hover:bg-[#1A1F45] text-slate-200 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 border border-orange-500/30 hover:border-orange-500 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                >
                  <Eye size={14} />
                  <span>Hızlı Detay</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const targetId = client.client_id || client.id || client.user_id;
                    if (typeof onSelectClient === "function") {
                      onSelectClient(targetId);
                    }
                  }}
                  className="px-3 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] cursor-pointer"
                >
                  <span>Dosyaya Git</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* POP-UP MODAL */}
      {selectedPopupClient && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPopupClient(null);
          }}
        >
          <div className="bg-[#1D234F] border border-orange-500/50 rounded-3xl max-w-md w-full p-6 md:p-7 space-y-6 shadow-[0_0_40px_rgba(249,115,22,0.35)] relative animate-in zoom-in-95 duration-150 backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setSelectedPopupClient(null)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-[#121633] hover:bg-orange-600/30 border border-orange-500/40 rounded-full transition-all cursor-pointer shadow-[0_0_10px_rgba(249,115,22,0.15)]"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4 pr-6">
              <img
                src={
                  selectedPopupClient.avatar &&
                  typeof selectedPopupClient.avatar === "string" &&
                  selectedPopupClient.avatar.trim() !== ""
                    ? selectedPopupClient.avatar
                    : getFallbackAvatar(
                        selectedPopupClient.first_name,
                        selectedPopupClient.last_name
                      )
                }
                alt={selectedPopupClient.first_name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackAvatar(
                    selectedPopupClient.first_name,
                    selectedPopupClient.last_name
                  );
                }}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 p-0.5 bg-[#121633] shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              />
              <div className="min-w-0">
                <h3 className="text-xl font-heading font-black text-white truncate">
                  {selectedPopupClient.first_name}{" "}
                  {selectedPopupClient.last_name}
                </h3>
                <p className="text-xs font-mono text-slate-300 truncate mt-0.5">
                  {selectedPopupClient.email || "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-[#121633] p-3 rounded-2xl border border-orange-500/20">
                  <span className="block text-[10px] text-slate-400 font-heading font-bold uppercase">Yaş</span>
                  <span className="text-sm font-mono font-black text-white">{selectedPopupClient.age || "-"}</span>
                </div>
                <div className="bg-[#121633] p-3 rounded-2xl border border-orange-500/20">
                  <span className="block text-[10px] text-slate-400 font-heading font-bold uppercase">Boy</span>
                  <span className="text-sm font-mono font-black text-white">{selectedPopupClient.height ? `${selectedPopupClient.height} cm` : "-"}</span>
                </div>
                <div className="bg-[#121633] p-3 rounded-2xl border border-orange-500/20">
                  <span className="block text-[10px] text-slate-400 font-heading font-bold uppercase">Kilo</span>
                  <span className="text-sm font-mono font-black text-white">{selectedPopupClient.weight || selectedPopupClient.current_weight ? `${selectedPopupClient.weight || selectedPopupClient.current_weight} kg` : "-"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-heading font-extrabold uppercase text-slate-300 flex items-center gap-1.5 tracking-wider">
                  <ShieldCheck size={14} className="text-emerald-400" /> Aktif Hizmetler
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedPopupClient.active_packages) && selectedPopupClient.active_packages.length > 0 ? (
                    selectedPopupClient.active_packages.map((pkg, idx) => (
                      <span key={idx} className="text-xs font-heading font-black uppercase text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-xl border border-emerald-500/40">
                        {pkg}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Aktif Hizmet Bulunmuyor</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-heading font-extrabold uppercase text-slate-300 flex items-center gap-1.5 tracking-wider">
                  <Dumbbell size={14} className="text-amber-400" /> Atanan Programlar
                </span>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(selectedPopupClient.assigned_programs) && selectedPopupClient.assigned_programs.length > 0 ? (
                    selectedPopupClient.assigned_programs.map((prog, idx) => (
                      <span key={idx} className="text-xs font-heading font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/40 flex items-center gap-1">
                        <Utensils size={11} className="text-amber-400" /> {prog}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">Program Atanmadı</span>
                  )}
                </div>
              </div>

              {selectedPopupClient.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#121633] p-3 rounded-2xl border border-orange-500/20">
                  <Phone size={14} className="text-orange-400 shrink-0" />
                  <span className="font-bold text-slate-400">Telefon:</span>
                  <span className="font-mono text-white">{selectedPopupClient.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const targetId = selectedPopupClient.client_id || selectedPopupClient.id || selectedPopupClient.user_id;
                  setSelectedPopupClient(null);
                  if (typeof onSelectClient === "function") {
                    onSelectClient(targetId);
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-heading font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] cursor-pointer"
              >
                <span>Danışan Dosyasını Aç</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}