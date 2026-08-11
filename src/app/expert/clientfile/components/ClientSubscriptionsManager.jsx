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
  Sparkles
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
            ? { ...sub, status: "completed", completed_at: new Date().toISOString().split("T")[0] }
            : sub
        )
      );
    }
  };

  // Abonelik veya Hizmeti Sil / İptal Et
  const handleDeleteSubscription = async (subId) => {
    if (!window.confirm("Bu hizmet/abonelik kaydını silmek istediğinize emin misiniz?")) return;

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
  const completedSubs = subscriptions.filter((s) => s.status === "completed" || s.status === "expired");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
      {/* ÜST BAŞLIK VE SEKME YÖNETİMİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Abonelikler & Alınan Hizmetler</h3>
            <p className="text-xs text-slate-400">
              Danışanın aktif paketleri, tek seferlik hizmetleri ve geçmişi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SEKMELER */}
          <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "active"
                  ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Aktif ({activeSubs.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-[#EA580C] text-white shadow-md shadow-[#EA580C]/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Geçmiş / Tamamlanan ({completedSubs.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
            title="Yeni Hizmet/Abonelik Tanımla"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* İÇERİK LİSTESİ */}
      <div className="space-y-3">
        {activeTab === "active" ? (
          activeSubs.length > 0 ? (
            activeSubs.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{sub.title}</span>
                    {sub.type === "one_time" ? (
                      <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Tek Seferlik Hizmet
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Sürekli Abonelik
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-slate-500" /> Başlangıç: {sub.start_date || "Belirtilmedi"}
                    </span>
                    {sub.remaining_days && (
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Clock size={12} /> Kalan: {sub.remaining_days} Gün
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  {sub.type === "one_time" && (
                    <button
                      onClick={() => handleMarkAsCompleted(sub.id)}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 size={14} /> Tamamlandı İşaretle
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteSubscription(sub.id)}
                    className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition-all"
                    title="Aboneliği/Hizmeti Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/50 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Danışanın şu an aktif bir hizmeti veya aboneliği yok.</p>
            </div>
          )
        ) : completedSubs.length > 0 ? (
          completedSubs.map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75 hover:opacity-100 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-300 line-through">{sub.title}</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Tamamlandı / Süresi Doldu
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Tamamlanma Tarihi: {sub.completed_at || sub.end_date || "Geçmiş Dönem"}
                </p>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => handleDeleteSubscription(sub.id)}
                  className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 rounded-xl transition-all"
                  title="Kaydı Temizle"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-slate-800/50 space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Geçmişe ait tamamlanan hizmet kaydı bulunamadı.</p>
          </div>
        )}
      </div>

      {/* MODAL: YENİ HİZMET EKLEME */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA580C]" /> Yeni Hizmet / Abonelik Tanımla
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Hizmet Adı</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Vücut Ölçümü veya 3 Aylık PT"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-[#EA580C]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Hizmet Tipi</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-[#EA580C]"
                >
                  <option value="one_time">Tek Seferlik (Örn: Vücut Ölçümü, Diyet Planı)</option>
                  <option value="recurring">Süreli Abonelik (Örn: Aylık PT)</option>
                </select>
              </div>

              {newType === "recurring" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Süre (Gün)</label>
                  <input
                    type="number"
                    value={newDays}
                    onChange={(e) => setNewDays(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-[#EA580C]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-[#EA580C]/20"
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