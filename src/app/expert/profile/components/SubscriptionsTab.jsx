"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Users, 
  Package, 
  Sparkles, 
  X, 
  Clock, 
  AlertCircle 
} from "lucide-react";

export default function SubscriptionsTab({ user }) {
  const [packages, setPackages] = useState([
    {
      id: "1",
      title: "1 Aylık Birebir Online Koçluk",
      description: "Kişiye özel beslenme + antrenman programı, haftalık form takibi ve 7/24 WhatsApp desteği.",
      price: 1500,
      duration_months: 1,
      is_active: true,
      active_clients_count: 12,
      features: ["Özel Antrenman Programı", "Makro/Mikro Diyet Planı", "Haftalık Check-in", "WhatsApp Desteği"]
    },
    {
      id: "2",
      title: "3 Aylık Değişim Paketi (VIP)",
      description: "Uzun vadeli vücut geliştirme ve postür düzeltme hedefli VIP performans paketi.",
      price: 3800,
      duration_months: 3,
      is_active: true,
      active_clients_count: 8,
      features: ["Görüntülü Görüşme (Ayda 2)", "Video Form Analizi", "Tüm Güncellemeler Dahil"]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration_months: "1",
    features: ""
  });

  // Backend'den Paketleri Çekme
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/packages", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPackages(data);
        }
      }
    } catch (err) {
      console.error("Paketler çekilirken hata oluştu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Açma (Yeni veya Düzenleme)
  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        duration_months: pkg.duration_months,
        features: Array.isArray(pkg.features) ? pkg.features.join(", ") : pkg.features || ""
      });
    } else {
      setEditingPackage(null);
      setFormData({
        title: "",
        description: "",
        price: "",
        duration_months: "1",
        features: ""
      });
    }
    setIsModalOpen(true);
  };

  // Paket Kaydetme (Ekle / Güncelle)
  const handleSavePackage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formattedFeatures = formData.features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_months: parseInt(formData.duration_months),
      features: formattedFeatures,
      is_active: editingPackage ? editingPackage.is_active : true
    };

    try {
      if (editingPackage) {
        // Güncelleme
        const res = await fetch(`/api/expert/packages/${editingPackage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          setPackages(packages.map((p) => (p.id === editingPackage.id ? { ...p, ...payload } : p)));
        }
      } else {
        // Yeni Ekleme
        const res = await fetch("/api/expert/packages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const newPkg = await res.json();
          setPackages([...packages, { ...newPkg, active_clients_count: 0 }]);
        } else {
          // Fallback UI Simülasyonu
          const fakeNewPkg = {
            id: Date.now().toString(),
            ...payload,
            active_clients_count: 0
          };
          setPackages([...packages, fakeNewPkg]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Paket kaydedilirken hata oluştu:", err);
    }
  };

  // Aktif / Pasif Değiştirme
  const togglePackageStatus = async (pkgId) => {
    const updated = packages.map((p) => {
      if (p.id === pkgId) return { ...p, is_active: !p.is_active };
      return p;
    });
    setPackages(updated);

    try {
      const target = updated.find((p) => p.id === pkgId);
      const token = localStorage.getItem("token");
      await fetch(`/api/expert/packages/${pkgId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: target.is_active })
      });
    } catch (err) {
      console.error("Status değiştirilemedi:", err);
    }
  };

  // Paket Silme
  const handleDeletePackage = async (pkgId) => {
    if (!confirm("Bu hizmet paketini silmek istediğinize emin misiniz?")) return;

    setPackages(packages.filter((p) => p.id !== pkgId));

    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/expert/packages/${pkgId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Paket silinirken hata oluştu:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative">
      
      {/* Üst Başlık & Ekle Butonu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-[#EA580C]" />
            Danışan Hizmet Paketleri & Fiyatlandırma
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Pazaryerinde danışanlarınıza sunacağınız koçluk ve diyet paketlerini yönetin.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#EA580C]/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>YENİ PAKET OLUŞTUR</span>
        </button>
      </div>

      {/* İstatistik Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#EA580C] flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Toplam Paket</p>
            <p className="text-lg font-black text-white">{packages.length} Adet</p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Users size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Aktif Abone Danışan</p>
            <p className="text-lg font-black text-white">
              {packages.reduce((acc, p) => acc + (p.active_clients_count || 0), 0)} Kişi
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Aylık Tahmini Ciro</p>
            <p className="text-lg font-black text-white">
              ₺{packages.reduce((acc, p) => acc + (p.price * (p.active_clients_count || 0)), 0).toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* Paket Listesi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className={`bg-slate-950 border transition-all rounded-2xl p-6 flex flex-col justify-between space-y-6 ${
              pkg.is_active ? "border-slate-800 hover:border-slate-700" : "border-slate-800/40 opacity-60"
            }`}
          >
            <div className="space-y-4">
              {/* Kart Üst Başlık & Rozetler */}
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase ${
                  pkg.is_active 
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                    : "text-slate-500 bg-slate-900 border-slate-800"
                }`}>
                  {pkg.is_active ? "PAZARYERİNDE YAYINDA" : "PASİF / GİZLİ"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleOpenModal(pkg)}
                    className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-all"
                    title="Paketi Düzenle"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-2 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                    title="Paketi Sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Başlık ve Açıklama */}
              <div>
                <h4 className="text-lg font-black text-white">{pkg.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              {/* Fiyat ve Süre Bilgisi */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">PAKET ÜCRETİ</span>
                  <span className="text-xl font-black text-white">₺{pkg.price}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">TAAHHÜT / SÜRE</span>
                  <span className="text-xs font-bold text-[#EA580C] flex items-center gap-1">
                    <Clock size={12} /> {pkg.duration_months} Ay Paket
                  </span>
                </div>
              </div>

              {/* Özellik Listesi */}
              {pkg.features && pkg.features.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase">PAKET İÇERİĞİ:</span>
                  <ul className="space-y-1.5">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Alt İşlem Barı */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Users size={14} className="text-[#EA580C]" />
                <strong className="text-white">{pkg.active_clients_count || 0}</strong> Aktif Danışan
              </span>

              <button
                onClick={() => togglePackageStatus(pkg.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  pkg.is_active
                    ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {pkg.is_active ? "Yayından Kaldır" : "Yayınla"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🛠 MODAL: Yeni Paket Ekle / Düzenle */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#EA580C]" />
                {editingPackage ? "Paketi Düzenle" : "Yeni Paket Oluştur"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">PAKET BAŞLIĞI</label>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: 1 Aylık Birebir Online Koçluk"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">ÜCRET (₺)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="1500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">SÜRE (AY)</label>
                  <select
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] transition-all cursor-pointer font-medium"
                  >
                    <option value="1">1 Ay</option>
                    <option value="2">2 Ay</option>
                    <option value="3">3 Ay</option>
                    <option value="6">6 Ay</option>
                    <option value="12">12 Ay (Yıllık)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">PAKET AÇIKLAMASI</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Paketin kapsadığı detayları ve vaatlerinizi kısaca yazın..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 block">
                  ÖZELLİKLER (Virgül ile ayırarak yazın)
                </label>
                <input 
                  type="text" 
                  placeholder="Örn: Özel Diyet, Antrenman Programı, WhatsApp Desteği"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 transition-all"
                >
                  İPTAL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-[#EA580C]/20"
                >
                  {editingPackage ? "GÜNCELLE" : "KAYDET VE YAYINLA"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}