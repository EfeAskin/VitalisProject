"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Search, ChevronRight, Eye, X, 
  Target, Loader2, Weight 
} from "lucide-react";

export default function ClientPortfolio({ clients = [], onSelectClient }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPopupClient, setSelectedPopupClient] = useState(null);
  const [fetchedClients, setFetchedClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      return null;
    }
  };

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
        return userObj.id || userObj.user_id || userObj.specialist_id || userObj.dietitian_id || null;
      }
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    const fetchClientsIfNeeded = async () => {
      const specId = getStoredSpecialistId();
      if (!specId) return;

      setIsLoading(true);
      try {
        const token = getAuthToken();
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const requestUrl = `${baseUrl.replace(/\/$/, "")}/api/expert-clients/dashboard/${specId}`;

        let res = await fetch(requestUrl, { method: "GET", headers: headers, credentials: "include" });
        if (!res.ok && res.status !== 401) {
          res = await fetch(`/api/expert-clients/dashboard/${specId}`, { method: "GET", headers: headers, credentials: "include" });
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.active_clients) {
            setFetchedClients(data.active_clients);
          } else if (Array.isArray(data)) {
            setFetchedClients(data);
          }
        }
      } catch (err) {
        console.error("Danışanlar getirilirken hata:", err);
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

  const getFallbackAvatar = (firstName, lastName) => {
    const fullName = `${firstName || "Danışan"} ${lastName || ""}`.trim();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=ea580c&color=fff&bold=true`;
  };

  const filteredClients = useMemo(() => {
    if (!Array.isArray(dataSource)) return [];
    return dataSource.filter(client => {
      const fullName = `${client.first_name || ""} ${client.last_name || ""}`.toLowerCase();
      const goal = (client.subscription_goal || client.goal || "").toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || goal.includes(searchTerm.toLowerCase());
    });
  }, [dataSource, searchTerm]);

  // Sayfaya ve URL parametresine tam yönlendirme sağlayan fonksiyon
  const handleNavigateToFile = (targetId) => {
    if (!targetId) return;
    
    if (typeof onSelectClient === "function") {
      try {
        onSelectClient(targetId);
      } catch (e) {
        console.error("onSelectClient çalıştırma hatası:", e);
      }
    }
    
    router.push(`/expert/clientfile?tab=detail&id=${targetId}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-[#171c48]/95 to-[#11142D]/95 border border-orange-500/35 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_35px_rgba(249,115,22,0.15)] h-full flex flex-col justify-between">
      
      <div>
        {/* Üst Başlık & Arama Çubuğu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow">
              <Users className="w-5 h-5 text-orange-400" /> Danışan Portföyü & Uyum Takibi
            </h3>
            <p className="text-xs text-slate-300 font-medium">Aktif danışanlarınızın listesi ve performans detayları</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-orange-400" />
            <input 
              type="text"
              placeholder="Danışan veya amaç ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121633] border border-orange-500/30 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/55 transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>
        </div>

        {/* İçerik Durumları & Kaydırma Çubuğu (Scroll) Kontrolü */}
        {isLoading ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-xs text-slate-300 font-bold">Danışanlar yükleniyor...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-[#121633]/60 rounded-2xl border border-orange-500/20">
            <Users className="w-10 h-10 text-orange-400 mx-auto opacity-60" />
            <p className="text-sm font-bold text-white">Aktif danışan bulunamadı.</p>
            <p className="text-xs text-slate-400">Onaylanan başvurularınız burada listelenir.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredClients.map((client) => {
              const fallback = getFallbackAvatar(client.first_name, client.last_name);
              const targetId = client.client_id ?? client.id ?? client.user_id;

              return (
                <div 
                  key={targetId} 
                  className="bg-[#121633] border border-orange-500/20 hover:border-orange-500/60 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                >
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={client.avatar || client.profile_photo || fallback} 
                      alt={client.first_name}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = fallback; }}
                      className="w-11 h-11 rounded-xl object-cover border-2 border-orange-500/50 p-0.5 bg-[#171c48] group-hover:border-orange-400 transition-colors shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                          {client.first_name} {client.last_name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          AKTİF
                        </span>
                        {(client.weight || client.current_weight) && (
                          <span className="text-[11px] font-mono text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                            {client.weight || client.current_weight} kg
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                        {client.subscription_goal || client.goal || "Hedef Belirtilmedi"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-orange-500/10">
                    <button 
                      onClick={() => setSelectedPopupClient(client)}
                      className="px-3 py-2 bg-[#171c48] hover:bg-orange-600/20 text-slate-200 border border-orange-500/30 hover:border-orange-500 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-400" />
                      <span>Hızlı Detay</span>
                    </button>

                    <button 
                      onClick={() => handleNavigateToFile(targetId)}
                      className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)] active:scale-95 cursor-pointer"
                    >
                      <span>Dosyaya Git</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* HIZLI DETAY MODAL (POP-UP) */}
      {selectedPopupClient && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedPopupClient(null); }}
        >
          <div className="bg-[#171c48] border border-orange-500/50 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-[0_0_40px_rgba(249,115,22,0.35)] relative animate-in zoom-in-95 duration-150 backdrop-blur-2xl">
            <button 
              onClick={() => setSelectedPopupClient(null)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white bg-[#121633] hover:bg-orange-600/30 border border-orange-500/40 rounded-full transition-all cursor-pointer shadow-[0_0_10px_rgba(249,115,22,0.15)]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 pr-6">
              <img 
                src={selectedPopupClient.avatar || selectedPopupClient.profile_photo || getFallbackAvatar(selectedPopupClient.first_name, selectedPopupClient.last_name)} 
                alt={selectedPopupClient.first_name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 p-0.5 bg-[#121633] shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              />
              <div>
                <h3 className="text-lg font-black text-white">
                  {selectedPopupClient.first_name} {selectedPopupClient.last_name}
                </h3>
                <p className="text-xs text-slate-300 font-mono">{selectedPopupClient.email || "E-posta yok"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#121633] p-2.5 rounded-xl border border-orange-500/20">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Yaş</span>
                <span className="text-xs font-mono font-black text-white">{selectedPopupClient.age || "-"}</span>
              </div>
              <div className="bg-[#121633] p-2.5 rounded-xl border border-orange-500/20">
                <span className="block text-[9px] text-slate-400 font-bold uppercase">Boy</span>
                <span className="text-xs font-mono font-black text-white">{selectedPopupClient.height ? `${selectedPopupClient.height} cm` : "-"}</span>
              </div>
              <div className="bg-[#121633] p-2.5 rounded-xl border border-orange-500/20 flex flex-col items-center justify-center">
                <span className="block text-[9px] text-orange-400 font-bold uppercase flex items-center gap-0.5">
                  <Weight className="w-3 h-3 inline" /> Kilo
                </span>
                <span className="text-xs font-mono font-black text-white">
                  {selectedPopupClient.weight || selectedPopupClient.current_weight || selectedPopupClient.starting_weight ? 
                    `${selectedPopupClient.weight || selectedPopupClient.current_weight || selectedPopupClient.starting_weight} kg` : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-orange-400 tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Danışan Amacı
              </span>
              <p className="text-xs text-slate-200 bg-[#121633] p-3 rounded-xl border border-orange-500/20 font-medium">
                {selectedPopupClient.subscription_goal || selectedPopupClient.goal || "Amaç belirtilmemiş."}
              </p>
            </div>

            <button 
              onClick={() => {
                const targetId = selectedPopupClient.client_id ?? selectedPopupClient.id ?? selectedPopupClient.user_id;
                setSelectedPopupClient(null);
                handleNavigateToFile(targetId);
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              <span>Tam Danışan Dosyasını Aç</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}