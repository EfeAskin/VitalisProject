"use client";
// src/app/expert/marketplace/components/ShowcasePanel.jsx
import React, { useState } from "react";
import {
  Star,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Power,
  Award,
  Trophy,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const EMPTY_LISTING = { title: "", price: "", period: "Aylık", description: "" };

export default function ShowcasePanel({ onNavigate }) {
  const [isAccepting, setIsAccepting] = useState(true);
  const [bio, setBio] = useState(
    "10 yıllık deneyimle hipertrofi ve güç antrenmanlarında uzmanlaşmış, veriye dayalı koçluk sunuyorum."
  );
  const [specialties, setSpecialties] = useState(["Hipertrofi", "Güç Antrenmanı", "Online Koçluk"]);
  const [newSpecialty, setNewSpecialty] = useState("");

  const [listings, setListings] = useState([
    { id: 1, title: "Online Aylık Koçluk", price: "1.500", period: "Aylık", description: "Haftalık program güncellemesi, sınırsız mesajlaşma.", active: true },
    { id: 2, title: "Kişiye Özel Tek Seferlik Program", price: "800", period: "Tek Seferlik", description: "4 haftalık detaylı antrenman programı.", active: true },
    { id: 3, title: "Yüz Yüze Seans Paketi (8 Seans)", price: "6.400", period: "Paket", description: "Stüdyoda birebir antrenman.", active: false },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LISTING);

  const stats = [
    { label: "Profil Görüntülenme", value: "1.284", icon: Eye },
    { label: "Gelen Talep", value: "37", icon: MessageSquare },
    { label: "Dönüşüm Oranı", value: "%12.4", icon: TrendingUp },
  ];

  const addSpecialty = () => {
    const val = newSpecialty.trim();
    if (val && !specialties.includes(val)) setSpecialties([...specialties, val]);
    setNewSpecialty("");
  };

  const removeSpecialty = (s) => setSpecialties(specialties.filter((x) => x !== s));

  const openNewForm = () => {
    setForm(EMPTY_LISTING);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (listing) => {
    setForm(listing);
    setEditingId(listing.id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_LISTING);
  };

  const saveListing = () => {
    if (!form.title.trim() || !form.price.trim()) return;
    if (editingId) {
      setListings(listings.map((l) => (l.id === editingId ? { ...l, ...form } : l)));
    } else {
      setListings([{ id: Date.now(), active: true, ...form }, ...listings]);
    }
    closeForm();
  };

  const toggleListingActive = (id) => {
    setListings(listings.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  };

  const deleteListing = (id) => {
    if (confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) {
      setListings(listings.filter((l) => l.id !== id));
      if (editingId === id) closeForm();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.4fr] gap-5">
      {/* SOL: Profil Vitrin Önizlemesi */}
      <div className="space-y-5">
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Danışan Görünümü</p>
            <span className="text-[9px] font-black bg-orange-500/10 text-[#EA580C] border border-orange-500/20 px-2 py-0.5 rounded-md uppercase">
              Önizleme
            </span>
          </div>

          <div className="bg-gradient-to-b from-[#182134] to-[#0B1120] border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#EA580C] flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] mb-3">
              ÖG
            </div>
            <h3 className="text-white font-extrabold text-base">Ömer Faruk Gürün</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">Personal Trainer</span>

            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-[#EA580C] text-[#EA580C]" />
              ))}
              <span className="text-xs text-slate-400 ml-1">4.9 (86)</span>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">{bio}</p>

            <div className="flex flex-wrap justify-center gap-1.5 mt-4">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="text-[10px] font-bold bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/30 px-2.5 py-1 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Kabul Durumu */}
          <div className="flex items-center justify-between mt-4 bg-[#182134] border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Power size={15} className={isAccepting ? "text-emerald-400" : "text-slate-500"} />
              <div>
                <p className="text-xs font-bold text-white">Yeni Danışan Kabulü</p>
                <p className="text-[10px] text-slate-500">{isAccepting ? "Aktif — havuzda görünüyorsun" : "Pasif — gizli moddasın"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAccepting(!isAccepting)}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                isAccepting ? "bg-emerald-500/80 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow" />
            </button>
          </div>
        </div>

        {/* Bio & Uzmanlık Düzenleme */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Profil Düzenle</p>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Kısa Tanıtım</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-[#182134] border border-slate-700 text-white text-xs rounded-lg p-3 focus:border-[#EA580C] outline-none resize-none placeholder:text-slate-600"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Uzmanlık Etiketleri</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 text-[11px] font-bold bg-[#182134] border border-slate-700 text-slate-300 px-2.5 py-1 rounded-full"
                >
                  {s}
                  <button onClick={() => removeSpecialty(s)} className="text-slate-500 hover:text-red-400">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSpecialty()}
                placeholder="Örn: Kilo Verme"
                className="flex-1 bg-[#182134] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
              />
              <button
                onClick={addSpecialty}
                className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Çapraz Navigasyon */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate?.("badges")}
            className="flex items-center justify-between bg-[#111827] border border-slate-800 hover:border-[#EA580C]/50 rounded-xl px-4 py-3 transition-colors group"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white">
              <Award size={14} className="text-[#EA580C]" /> Rozetlerim
            </span>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-[#EA580C]" />
          </button>
          <button
            onClick={() => onNavigate?.("leaderboard")}
            className="flex items-center justify-between bg-[#111827] border border-slate-800 hover:border-[#EA580C]/50 rounded-xl px-4 py-3 transition-colors group"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-slate-300 group-hover:text-white">
              <Trophy size={14} className="text-[#EA580C]" /> Sıralamam
            </span>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-[#EA580C]" />
          </button>
        </div>
      </div>

      {/* SAĞ: İstatistikler + İlan Yönetimi */}
      <div className="space-y-5">
        {/* İstatistik Şeridi */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Icon size={14} className="text-[#EA580C]" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
              </div>
              <p className="text-lg font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* İlan Yönetimi */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles size={15} className="text-[#EA580C]" /> İlanlarım
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Abonelik ve kiralama tekliflerini yönet</p>
            </div>
            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#EA580C] to-orange-500 hover:from-orange-600 hover:to-orange-500 px-3.5 py-2 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.3)] transition-all"
            >
              <Plus size={14} /> Yeni İlan
            </button>
          </div>

          {formOpen && (
            <div className="bg-[#182134] border border-[#EA580C]/40 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="İlan Başlığı"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Fiyat (₺)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-1/2 bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none placeholder:text-slate-600"
                  />
                  <select
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-1/2 bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-[#EA580C]"
                  >
                    <option>Aylık</option>
                    <option>Tek Seferlik</option>
                    <option>Paket</option>
                    <option>Haftalık</option>
                  </select>
                </div>
              </div>
              <textarea
                placeholder="İlan açıklaması..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-[#0B1120] border border-slate-700 text-white text-xs rounded-lg p-2.5 focus:border-[#EA580C] outline-none resize-none placeholder:text-slate-600"
              />
              <div className="flex justify-end gap-2">
                <button onClick={closeForm} className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button
                  onClick={saveListing}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-[#EA580C] hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Save size={13} /> Kaydet
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {listings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Henüz ilanın yok. Yukarıdan yeni bir ilan oluştur.</p>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`border rounded-xl p-4 transition-colors ${
                    listing.active ? "bg-[#182134] border-slate-700" : "bg-[#141b2c] border-slate-800 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{listing.title}</h4>
                        <span className="text-[9px] font-black uppercase tracking-wide bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                          {listing.period}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{listing.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-[#EA580C]">₺{listing.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => toggleListingActive(listing.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                        listing.active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-500 border-slate-700"
                      }`}
                    >
                      {listing.active ? "Yayında" : "Pasif"}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditForm(listing)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => deleteListing(listing.id)}
                        className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-md transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}