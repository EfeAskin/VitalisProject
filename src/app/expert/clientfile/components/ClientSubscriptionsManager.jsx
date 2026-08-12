"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  CheckCircle2,
  Trash2,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  X,
  Layers,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function ClientSubscriptionsManager({ clientId, client }) {
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'completed'
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Yeni Paket/Hizmet Ekleme Modalı
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("one_time"); // 'one_time' | 'recurring'
  const [newDays, setNewDays] = useState(30);

  // Varsayılan / API Verisi Çekimi
  useEffect(() => {
    if (!clientId) return;

    const fetchSubscriptions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/expert-clients/${clientId}/subscriptions`);
        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data.subscriptions || data || []);
        } else {
          // Fallback Varsayılan Demo Verisi
          setSubscriptions([
            {
              id: 101,
              title: client?.active_package || "Aylık Uzman PT Danışmanlığı",
              type: "recurring",
              status: "active",
              start_date: "2026-08-01",
              end_date: "2026-08-31",
              remaining_days: client?.package_days_left || 20,
            },
            {
              id: 102,
              title: "Postür & Vücut Ölçümü",
              type: "one_time",
              status: "active",
              start_date: "2026-08-10",
              end_date: null,
            },
            {
              id: 100,
              title: "Deneme Biyo-Analiz Paketi",
              type: "one_time",
              status: "completed",
              completed_at: "2026-07-15",
            },
          ]);
        }
      } catch (err) {
        console.error("Abonelikler çekilirken hata oluştu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptions();
  }, [clientId, client]);

  // Tek Seferlik Hizmeti Tamamlandı Olarak İşaretle
  const handleMarkAsCompleted = async (subId) => {
    try {
      await fetch(`/api/expert-clients/subscriptions/${subId}/complete`, {
        method: "PATCH",
      });
    } catch (err) {
      console.warn("API çağrısı simüle ediliyor:", err);
    } finally {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === subId
            ? {
                ...sub,
                status: "completed",
                completed_at: new Date().toISOString().split("T")[0],
              }
            : sub
        )
      );
    }
  };

  // Abonelik veya Hizmeti Sil / İptal Et
  const handleDeleteSubscription = async (subId) => {
    if (
      !window.confirm(
        "Bu hizmet/abonelik kaydını silmek istediğinize emin misiniz?"
      )
    )
      return;

    try {
      await fetch(`/api/expert-clients/subscriptions/${subId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("API silme simüle ediliyor:", err);
    } finally {
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== subId));
    }
  };

  // Yeni Hizmet/Abonelik Tanımla
  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSub = {
      id: Date.now(),
      title: newTitle,
      type: newType,
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      end_date: newType === "recurring" ? `+${newDays} Gün` : null,
      remaining_days: newType === "recurring" ? Number(newDays) : null,
    };

    setSubscriptions((prev) => [newSub, ...prev]);
    setNewTitle("");
    setIsAddModalOpen(false);
  };

  const activeSubs = subscriptions.filter((s) => s.status === "active");
  const completedSubs = subscriptions.filter(
    (s) => s.status === "completed" || s.status === "expired"
  );

  return (
    <div className="relative overflow-hidden bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(79,70,229,0.15)] space-y-6 transition-all duration-300">
      {/* ÜST BAŞLIK VE SEKME YÖNETİMİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500/30 to-amber-500/20 text-orange-300 rounded-2xl border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)] flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-heading font-black text-white tracking-tight drop-shadow-md">
              Abonelikler & Alınan Hizmetler
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Danışanın aktif paketleri, tek seferlik hizmetleri ve geçmişi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SEKMELER */}
          <div className="bg-[#11142D] p-1 rounded-2xl border border-slate-700/80 flex items-center gap-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all duration-300 ${
                activeTab === "active"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/50"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Aktif ({activeSubs.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all duration-300 ${
                activeTab === "completed"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/50"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Geçmiş ({completedSubs.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-2xl border border-slate-600/80 text-xs font-heading font-extrabold flex items-center gap-1 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            title="Yeni Hizmet/Abonelik Tanımla"
          >
            <Plus size={16} className="text-orange-400 drop-shadow" />
          </button>
        </div>
      </div>

      {/* İÇERİK LİSTESİ */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-[#11142D] rounded-2xl border border-slate-700/80 text-center space-y-3 shadow-inner">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            <p className="text-xs text-slate-300 font-medium">
              Abonelikler yükleniyor...
            </p>
          </div>
        ) : activeTab === "active" ? (
          activeSubs.length > 0 ? (
            activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="group bg-[#11142D] hover:bg-slate-900/90 p-4 md:p-5 rounded-2xl border border-slate-700/80 hover:border-orange-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-heading font-black text-white drop-shadow">
                      {sub.title}
                    </span>
                    {sub.type === "one_time" ? (
                      <span className="text-[10px] font-heading font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
                        Tek Seferlik Hizmet
                      </span>
                    ) : (
                      <span className="text-[10px] font-heading font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
                        Sürekli Abonelik
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar size={13} className="text-slate-400" />
                      Başlangıç: {sub.start_date || "Belirtilmedi"}
                    </span>
                    {sub.remaining_days && (
                      <span className="flex items-center gap-1.5 text-amber-300 font-mono font-bold drop-shadow">
                        <Clock size={13} /> Kalan: {sub.remaining_days} Gün
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end flex-shrink-0">
                  {sub.type === "one_time" && (
                    <button
                      onClick={() => handleMarkAsCompleted(sub.id)}
                      className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 text-xs font-heading font-extrabold rounded-xl flex items-center gap-1.5 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                    >
                      <CheckCircle2 size={14} className="text-emerald-300" /> Tamamlandı İşaretle
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="p-2 bg-slate-900/90 hover:bg-rose-500/30 text-slate-300 hover:text-rose-200 border border-slate-700/80 hover:border-rose-500/50 rounded-xl transition-all duration-200 shadow-sm"
                    title="Aboneliği/Hizmeti Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-[#11142D] rounded-2xl border border-dashed border-slate-700/80 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                <AlertCircle className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Danışanın şu an aktif bir hizmeti veya aboneliği yok.
              </p>
            </div>
          )
        ) : completedSubs.length > 0 ? (
          completedSubs.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#11142D]/70 p-4 md:p-5 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-85 hover:opacity-100 transition-all duration-300 shadow-inner"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-heading font-bold text-slate-300 line-through">
                    {sub.title}
                  </span>
                  <span className="text-[10px] font-heading font-black uppercase tracking-wider text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-600/80">
                    Tamamlandı / Süresi Doldu
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Tamamlanma Tarihi:{" "}
                  {sub.completed_at || sub.end_date || "Geçmiş Dönem"}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-end flex-shrink-0">
                <button
                  onClick={() => handleDeleteSubscription(sub.id)}
                  className="p-2 bg-slate-900/90 hover:bg-rose-500/30 text-slate-400 hover:text-rose-200 border border-slate-700/80 hover:border-rose-500/50 rounded-xl transition-all duration-200"
                  title="Kaydı Temizle"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 bg-[#11142D] rounded-2xl border border-dashed border-slate-700/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400">
              <Layers className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Geçmişe ait tamamlanan hizmet kaydı bulunamadı.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: YENİ HİZMET EKLEME */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#11142D] border border-slate-700/90 rounded-3xl p-6 md:p-8 w-full max-w-md space-y-5 shadow-[0_0_50px_rgba(79,70,229,0.3)] relative overflow-hidden backdrop-blur-xl">
            <div className="flex justify-between items-center border-b border-slate-700/80 pb-4">
              <h3 className="text-base font-heading font-black text-white flex items-center gap-2 drop-shadow">
                <Sparkles className="w-4 h-4 text-orange-400" /> Yeni Hizmet / Abonelik Tanımla
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/80"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-extrabold text-slate-200 block">
                  Hizmet Adı
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Vücut Ölçümü veya 3 Aylık PT"
                  className="w-full bg-[#11142D] border border-slate-700/80 text-white text-xs p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all duration-200 placeholder:text-slate-500 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-heading font-extrabold text-slate-200 block">
                  Hizmet Tipi
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-[#11142D] border border-slate-700/80 text-white text-xs p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all duration-200 shadow-inner"
                >
                  <option value="one_time" className="bg-[#11142D] text-white">
                    Tek Seferlik (Örn: Vücut Ölçümü, Diyet Planı)
                  </option>
                  <option value="recurring" className="bg-[#11142D] text-white">
                    Süreli Abonelik (Örn: Aylık PT)
                  </option>
                </select>
              </div>

              {newType === "recurring" && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-heading font-extrabold text-slate-200 block">
                    Süre (Gün)
                  </label>
                  <input
                    type="number"
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                    className="w-full bg-[#11142D] border border-slate-700/80 text-white text-xs p-3.5 rounded-xl outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all duration-200 shadow-inner"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-heading font-bold rounded-xl transition-all duration-200 border border-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-heading font-black rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.35)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] border border-orange-400/50 transition-all duration-200"
                >
                  Tanımla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}