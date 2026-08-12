"use client";

import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";

const EMPTY_LISTING = { title: "", price: "", period: "Aylık", description: "" };

const STAT_ICONS = {
  views: Eye,
  requests: MessageSquare,
  conversion: TrendingUp,
};

export default function ShowcasePanel({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile States
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [newSpecialty, setNewSpecialty] = useState("");
  const [isAccepting, setIsAccepting] = useState(true);
  const [rating, setRating] = useState(5.0);
  const [reviewCount, setReviewCount] = useState(0);

  // Stats State
  const [stats, setStats] = useState([]);

  // Listings States
  const [listings, setListings] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LISTING);

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    setLoading(true);
    try {
      const [profileRes, listingsRes] = await Promise.all([
        fetch("http://localhost:8000/api/expert/marketplace/profile"),
        fetch("http://localhost:8000/api/expert/marketplace/listings"),
      ]);

      if (profileRes.ok) {
        const data = await profileRes.json();
        setFullName(data.profile.full_name || "Uzman");
        setTitle(data.profile.title || "Personal Trainer");
        setBio(data.profile.bio || "");
        setSpecialties(data.profile.specialties || []);
        setIsAccepting(data.profile.is_accepting_clients);
        setRating(data.profile.rating || 5.0);
        setReviewCount(data.profile.review_count || 0);
        setStats(data.stats || []);
      }

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedBio, updatedSpecialties, updatedAccepting) => {
    setSavingProfile(true);
    try {
      const res = await fetch("http://localhost:8000/api/expert/marketplace/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: updatedBio !== undefined ? updatedBio : bio,
          specialties: updatedSpecialties !== undefined ? updatedSpecialties : specialties,
          is_accepting_clients: updatedAccepting !== undefined ? updatedAccepting : isAccepting,
        }),
      });

      if (!res.ok) throw new Error("Profil güncellenemedi");
    } catch (err) {
      console.error("Profil kaydetme hatası:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleAccepting = async () => {
    const nextVal = !isAccepting;
    setIsAccepting(nextVal);
    await handleSaveProfile(bio, specialties, nextVal);
  };

  const addSpecialty = async () => {
    const val = newSpecialty.trim();
    if (val && !specialties.includes(val)) {
      const nextList = [...specialties, val];
      setSpecialties(nextList);
      setNewSpecialty("");
      await handleSaveProfile(bio, nextList, isAccepting);
    }
  };

  const removeSpecialty = async (s) => {
    const nextList = specialties.filter((x) => x !== s);
    setSpecialties(nextList);
    await handleSaveProfile(bio, nextList, isAccepting);
  };

  const openNewForm = () => {
    setForm(EMPTY_LISTING);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEditForm = (listing) => {
    setForm({
      title: listing.title,
      price: listing.price,
      period: listing.period,
      description: listing.description || "",
    });
    setEditingId(listing.id);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_LISTING);
  };

  const saveListing = async () => {
    if (!form.title.trim() || !form.price.toString().trim()) return;

    try {
      const numericPrice = parseFloat(form.price.toString().replace(".", "").replace(",", "."));

      if (editingId) {
        const res = await fetch(`http://localhost:8000/api/expert/marketplace/listings/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            price: numericPrice,
            period: form.period,
            description: form.description,
          }),
        });

        if (res.ok) {
          const updated = await res.json();
          setListings(listings.map((l) => (l.id === editingId ? updated : l)));
        }
      } else {
        const res = await fetch("http://localhost:8000/api/expert/marketplace/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            price: numericPrice,
            period: form.period,
            description: form.description,
          }),
        });

        if (res.ok) {
          const created = await res.json();
          setListings([created, ...listings]);
        }
      }

      closeForm();
    } catch (err) {
      console.error("İlan kaydetme hatası:", err);
    }
  };

  const toggleListingActive = async (id, currentActive) => {
    try {
      const res = await fetch(`http://localhost:8000/api/expert/marketplace/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });

      if (res.ok) {
        const updated = await res.json();
        setListings(listings.map((l) => (l.id === id ? updated : l)));
      }
    } catch (err) {
      console.error("Durum değiştirme hatası:", err);
    }
  };

  const deleteListing = async (id) => {
    if (!confirm("Bu ilanı kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/expert/marketplace/listings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setListings(listings.filter((l) => l.id !== id));
        if (editingId === id) closeForm();
      }
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "ÖG";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-300 gap-3 font-medium">
        <Loader2 className="animate-spin text-orange-500" size={24} />
        <span>Vitrin bilgileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.4fr] gap-6">
      {/* SOL TARAF */}
      <div className="space-y-6">
        {/* DANIŞAN GÖRÜNÜMÜ ANA KİMLİK KARTI */}
        <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-orange-500/35 rounded-3xl p-6 shadow-[0_0_20px_rgba(234,88,12,0.10),0_0_55px_rgba(234,88,12,0.08)] hover:border-orange-400/55 hover:shadow-[0_0_25px_rgba(234,88,12,0.18),0_0_70px_rgba(234,88,12,0.10)] transition-all duration-500">
          {/* Ambient Işık Efektleri */}
          <div className="absolute -top-28 -left-28 w-72 h-72 bg-orange-500/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-28 -right-28 w-72 h-72 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Danışan Görünümü (Kimlik Kartı)
            </p>
            <span className="text-[9px] font-black bg-gradient-to-r from-orange-500/15 to-amber-500/15 text-orange-300 border border-orange-500/35 px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_14px_rgba(234,88,12,0.18)]">
              Önizleme
            </span>
          </div>

          {/* İç Kart */}
          <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-md border border-orange-400/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-[0_0_18px_rgba(234,88,12,0.07)] group z-10 hover:border-orange-400/35 hover:shadow-[0_0_25px_rgba(234,88,12,0.13)] transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-500/8 blur-3xl pointer-events-none" />

            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white font-heading font-black text-2xl shadow-[0_0_25px_rgba(234,88,12,0.35)] mb-4 ring-1 ring-orange-300/40 group-hover:scale-105 transition-transform duration-300">
              {getInitials(fullName)}
            </div>

            <h3 className="font-heading text-white font-extrabold text-lg tracking-tight">{fullName}</h3>

            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest mt-1 bg-orange-500/10 px-3 py-0.5 rounded-full border border-orange-500/20 shadow-[0_0_10px_rgba(234,88,12,0.08)]">
              {title}
            </span>

            <div className="flex items-center gap-1.5 mt-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400 drop-shadow-[0_0_7px_rgba(251,191,36,0.45)]" />
              ))}
              <span className="text-xs font-heading font-extrabold text-slate-200 ml-1.5">
                {rating} <span className="text-slate-400 font-normal">({reviewCount})</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-md font-normal">
              {bio || "Henüz bir tanıtım yazısı eklenmedi."}
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {specialties.map((s) => (
                <span key={s} className="text-[10px] font-bold bg-slate-800/90 text-orange-300 border border-orange-500/25 px-3 py-1 rounded-xl shadow-[0_0_10px_rgba(234,88,12,0.06)] backdrop-blur-md">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Kabul Durumu */}
          <div className="flex items-center justify-between mt-5 bg-slate-900/70 backdrop-blur-md border border-emerald-500/20 rounded-2xl px-5 py-3.5 shadow-[0_0_18px_rgba(16,185,129,0.07)] relative z-10 hover:border-emerald-400/35 hover:shadow-[0_0_25px_rgba(16,185,129,0.12)] transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isAccepting ? "bg-emerald-500/15 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.30)] border border-emerald-500/25" : "bg-slate-800 text-slate-500"}`}>
                <Power size={16} />
              </div>
              <div>
                <p className="text-xs font-heading font-extrabold text-white tracking-wide">Yeni Danışan Kabulü</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isAccepting ? "Aktif — pazaryerinde görünüyorsun" : "Pasif — gizli moddasın"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleAccepting}
              disabled={savingProfile}
              className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-all duration-300 ${
                isAccepting ? "bg-gradient-to-r from-emerald-500 to-teal-400 justify-end shadow-[0_0_14px_rgba(16,185,129,0.45)]" : "bg-slate-800 justify-start border border-slate-700"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* PROFİL DETAYLARINI DÜZENLE */}
        <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-6 shadow-[0_0_22px_rgba(139,92,246,0.08)] hover:border-violet-400/35 hover:shadow-[0_0_30px_rgba(139,92,246,0.13)] transition-all duration-300 space-y-4">
          <div className="absolute -bottom-28 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-[85px] pointer-events-none" />

          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase relative z-10">
            Profil Detaylarını Düzenle
          </p>

          <div className="space-y-1.5 relative z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kısa Tanıtım</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => handleSaveProfile(bio, specialties, isAccepting)}
              rows={3}
              placeholder="Kendinizden ve sunduğunuz koçluk hizmetinden bahsedin..."
              className="w-full bg-slate-900/80 border border-slate-700/80 text-white text-xs rounded-xl p-3 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/25 outline-none resize-none placeholder:text-slate-600 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-1.5 relative z-10">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uzmanlık Etiketleri</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {specialties.map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-[11px] font-bold bg-slate-900/90 border border-violet-500/20 text-slate-200 px-3 py-1 rounded-xl shadow-[0_0_10px_rgba(139,92,246,0.05)]">
                  {s}
                  <button onClick={() => removeSpecialty(s)} className="text-slate-400 hover:text-red-400 transition-colors">
                    <X size={12} />
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
                placeholder="Örn: Hipertrofi"
                className="flex-1 bg-slate-900/80 border border-slate-700/80 text-white text-xs rounded-xl p-2.5 focus:border-violet-500/70 focus:ring-1 focus:ring-violet-500/25 outline-none placeholder:text-slate-600 transition-all shadow-inner"
              />
              <button
                onClick={addSpecialty}
                className="px-4 bg-slate-800 hover:bg-slate-700 border border-violet-500/20 text-slate-200 rounded-xl transition-all duration-200 active:scale-95 shadow-md hover:shadow-[0_0_15px_rgba(139,92,246,0.12)]"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ÇAPRAZ HIZLI NAVİGASYON */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate?.("badges")}
            className="relative overflow-hidden flex items-center justify-between bg-slate-800/40 backdrop-blur-2xl border border-amber-500/20 hover:border-amber-400/40 shadow-[0_0_18px_rgba(245,158,11,0.06)] hover:shadow-[0_0_25px_rgba(245,158,11,0.14)] rounded-2xl p-4 transition-all duration-300 group"
          >
            <span className="flex items-center gap-2 text-xs font-heading font-extrabold text-slate-300 group-hover:text-white transition-colors">
              <Award size={16} className="text-amber-400 drop-shadow-[0_0_7px_rgba(245,158,11,0.45)]" />
              Rozetlerim
            </span>
            <ChevronRight size={15} className="text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => onNavigate?.("leaderboard")}
            className="relative overflow-hidden flex items-center justify-between bg-slate-800/40 backdrop-blur-2xl border border-cyan-500/20 hover:border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.06)] hover:shadow-[0_0_25px_rgba(34,211,238,0.14)] rounded-2xl p-4 transition-all duration-300 group"
          >
            <span className="flex items-center gap-2 text-xs font-heading font-extrabold text-slate-300 group-hover:text-white transition-colors">
              <Trophy size={16} className="text-cyan-400 drop-shadow-[0_0_7px_rgba(34,211,238,0.45)]" />
              Sıralamam
            </span>
            <ChevronRight size={15} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* SAĞ TARAF */}
      <div className="space-y-6">
        {/* İSTATİSTİKLER */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ label, value, key }, index) => {
            const Icon = STAT_ICONS[key] || Eye;
            const statTheme = [
              {
                border: "border-cyan-500/25 hover:border-cyan-400/50",
                glow: "shadow-[0_0_20px_rgba(34,211,238,0.07)] hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]",
                icon: "text-cyan-400 drop-shadow-[0_0_7px_rgba(34,211,238,0.45)]",
                line: "via-cyan-400/60",
                number: "from-white via-slate-100 to-cyan-400",
              },
              {
                border: "border-violet-500/25 hover:border-violet-400/50",
                glow: "shadow-[0_0_20px_rgba(139,92,246,0.07)] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
                icon: "text-violet-400 drop-shadow-[0_0_7px_rgba(139,92,246,0.45)]",
                line: "via-violet-400/60",
                number: "from-white via-slate-100 to-violet-400",
              },
              {
                border: "border-emerald-500/25 hover:border-emerald-400/50",
                glow: "shadow-[0_0_20px_rgba(16,185,129,0.07)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
                icon: "text-emerald-400 drop-shadow-[0_0_7px_rgba(16,185,129,0.45)]",
                line: "via-emerald-400/60",
                number: "from-white via-slate-100 to-emerald-400",
              },
            ][index % 3];

            return (
              <div
                key={label}
                className={`relative overflow-hidden bg-slate-800/50 backdrop-blur-2xl border ${statTheme.border} rounded-2xl p-4.5 ${statTheme.glow} transition-all duration-300 group`}
              >
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-white/[0.025] blur-3xl pointer-events-none" />
                <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${statTheme.line} to-transparent`} />

                <div className="flex items-center gap-1.5 text-slate-400 mb-2 relative z-10">
                  <Icon size={14} className={statTheme.icon} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                </div>

                <p className={`relative z-10 font-heading text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${statTheme.number} tracking-tight`}>
                  {value}
                </p>
              </div>
            );
          })}
        </div>

        {/* İLAN YÖNETİM PANELİ */}
        <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-violet-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(139,92,246,0.08)] hover:border-violet-400/40 hover:shadow-[0_0_35px_rgba(139,92,246,0.13)] transition-all duration-500">
          <div className="absolute -top-32 right-0 w-80 h-80 bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 -left-28 w-64 h-64 bg-orange-500/7 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex items-center justify-between mb-5 relative z-10">
            <div>
              <h3 className="font-heading text-base font-extrabold text-white flex items-center gap-2 tracking-tight">
                <Sparkles size={16} className="text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.65)]" />
                İlanlarım & Paketlerim
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Abonelik ve kiralama tekliflerini yönet</p>
            </div>

            <button
              onClick={openNewForm}
              className="flex items-center gap-1.5 text-xs font-heading font-bold text-white bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 px-4 py-2.5 rounded-xl shadow-[0_0_18px_rgba(234,88,12,0.30)] hover:shadow-[0_0_28px_rgba(234,88,12,0.45)] transition-all duration-300 active:scale-95"
            >
              <Plus size={15} /> Yeni İlan Ekle
            </button>
          </div>

          {/* İLAN OLUŞTURMA / DÜZENLEME FORMU */}
          {formOpen && (
            <div className="relative overflow-hidden bg-slate-900/90 border border-orange-500/35 shadow-[0_0_25px_rgba(234,88,12,0.10)] backdrop-blur-2xl rounded-2xl p-5 mb-5 space-y-3.5 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="İlan Başlığı"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 text-white text-xs rounded-xl p-3 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none placeholder:text-slate-600 transition-all shadow-inner"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Fiyat (₺)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-1/2 bg-slate-950/80 border border-slate-700 text-white text-xs rounded-xl p-3 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none placeholder:text-slate-600 transition-all shadow-inner"
                  />

                  <select
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-1/2 bg-slate-950/80 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 transition-all"
                  >
                    <option className="bg-slate-900 text-white">Aylık</option>
                    <option className="bg-slate-900 text-white">Tek Seferlik</option>
                    <option className="bg-slate-900 text-white">Paket</option>
                    <option className="bg-slate-900 text-white">Haftalık</option>
                  </select>
                </div>
              </div>

              <textarea
                placeholder="İlan açıklaması..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-950/80 border border-slate-700 text-white text-xs rounded-xl p-3 focus:border-orange-500/70 focus:ring-1 focus:ring-orange-500/20 outline-none resize-none placeholder:text-slate-600 transition-all shadow-inner"
              />

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={closeForm} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button
                  onClick={saveListing}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl shadow-[0_0_15px_rgba(234,88,12,0.30)] transition-all active:scale-95"
                >
                  <Save size={14} /> Kaydet
                </button>
              </div>
            </div>
          )}

          {/* İLAN LİSTESİ */}
          <div className="space-y-4 relative z-10">
            {listings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 font-medium">
                Henüz ilanın yok. Yukarıdaki düğmeden hemen ilk paketini sergile.
              </p>
            ) : (
              listings.map((listing, index) => {
                const listingGlow =
                  index % 2 === 0
                    ? {
                        border: "border-cyan-500/20 hover:border-cyan-400/40",
                        shadow: "shadow-[0_0_18px_rgba(34,211,238,0.05)] hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]",
                        price: "from-cyan-300 to-blue-400",
                      }
                    : {
                        border: "border-violet-500/20 hover:border-violet-400/40",
                        shadow: "shadow-[0_0_18px_rgba(139,92,246,0.05)] hover:shadow-[0_0_25px_rgba(139,92,246,0.12)]",
                        price: "from-violet-300 to-fuchsia-400",
                      };

                return (
                  <div
                    key={listing.id}
                    className={`rounded-2xl p-5 transition-all duration-300 relative overflow-hidden ${
                      listing.active
                        ? `bg-slate-900/70 backdrop-blur-xl border ${listingGlow.border} ${listingGlow.shadow}`
                        : "bg-slate-950/40 backdrop-blur-md border border-slate-800/60 opacity-60"
                    }`}
                  >
                    {listing.active && (
                      <div
                        className={`absolute -right-16 -top-16 w-36 h-36 rounded-full ${
                          index % 2 === 0 ? "bg-cyan-400/6" : "bg-violet-400/6"
                        } blur-3xl pointer-events-none`}
                      />
                    )}

                    <div className="flex items-start justify-between gap-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h4 className="font-heading text-sm font-extrabold text-white tracking-tight">{listing.title}</h4>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-300 px-3 py-0.5 rounded-full border border-slate-700">
                            {listing.period}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-normal">{listing.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`font-heading text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${listingGlow.price} drop-shadow-sm`}>
                          ₺{listing.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-slate-800/80 relative z-10">
                      <button
                        onClick={() => toggleListingActive(listing.id, listing.active)}
                        className={`text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full border transition-all duration-300 ${
                          listing.active
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/35 shadow-[0_0_10px_rgba(16,185,129,0.22)]"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {listing.active ? "Yayında" : "Pasif"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(listing)}
                          className="p-2 bg-slate-800/90 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-300 rounded-xl transition-all border border-slate-700 hover:border-cyan-500/30 hover:shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          className="p-2 bg-slate-800/90 hover:bg-red-500/10 text-slate-300 hover:text-red-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/30 hover:shadow-[0_0_12px_rgba(239,68,68,0.12)]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}