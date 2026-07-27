"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Save, CheckCircle2, Edit3, Lock, Camera, Activity, Target, Calendar, Ruler, Weight 
} from "lucide-react";

export default function PersonalInfoTab({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || 23,
    gender: user?.gender || "erkek",
    height: user?.height || 180,
    weight: user?.weight || 75.2,
    activity_level: user?.activity_level || "Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.",
    goal: user?.goal || "Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı bir şekilde zayıflamak istiyorum."
  });

  // 🔥 CANLI VERİ SENKRONİZASYONU: Backend'den (efe@example.com) verisi geldiğinde formu günceller
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || 23,
        gender: user.gender || "erkek",
        height: user.height || 180,
        weight: user.weight || 75.2,
        activity_level: user.activity_level || "Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.",
        goal: user.goal || "Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı bir şekilde zayıflamak istiyorum."
      });
    }
  }, [user]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen geçerli bir resim dosyası seçiniz (.jpg, .png, .webp).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Resim boyutu maksimum 5MB olabilir.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/client/profile/upload-photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (res.ok) {
        const result = await res.json();
        onUpdateUser({ profile_photo: result.photo_url });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Fotoğraf yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Fotoğraf yükleme hatası:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/client/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onUpdateUser(updatedUser);
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Bilgiler güncellenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-400" />
            Kişisel Bilgiler & Biyometrik Hedefler
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Hesap bilgilerinizi, fiziksel ölçümlerinizi ve metabolik hedeflerinizi yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/30 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Değişiklikler Kaydedildi
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black tracking-wider transition-all duration-300 flex items-center gap-2 border ${
              isEditing
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg"
                : "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{isEditing ? "DÜZENLEMEYİ KAPAT" : "BİLGİLERİ DÜZENLE"}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/png, image/jpeg, image/jpg, image/webp" 
          className="hidden" 
        />

        <div 
          className={`relative group ${isEditing ? "cursor-pointer" : "cursor-default"}`}
          onClick={() => {
            if (isEditing) fileInputRef.current?.click();
          }}
        >
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#C5A880] via-emerald-500 to-slate-800 shadow-xl overflow-hidden">
            <img 
              src={user?.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {isEditing && (
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-950 flex items-center justify-center shadow-lg group-hover:bg-emerald-400 transition-colors">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-extrabold text-white">Profil Fotoğrafı (/public/fotos/)</h4>
          <p className="text-xs text-slate-400">
            {isEditing ? "Resmi değiştirmek için üzerine tıklayın." : "Fotoğraf değiştirmek için 'Bilgileri Düzenle' butonuna basın."}
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Desteklenen formatlar: JPG, PNG, WEBP. Maksimum 5MB.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">AD</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">SOYAD</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                required
              />
            </div>
          </div>

          {/* E-posta Adresi (Neon DB Canlı Veri Gösterimi) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 block">E-POSTA ADRESİ</label>
              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Değiştirilemez
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                disabled={true}
                value={formData.email}
                className="w-full bg-slate-950/80 border border-slate-800/80 text-slate-400 text-xs pl-10 pr-4 py-3 rounded-2xl outline-none opacity-50 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block">TELEFON NUMARASI</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C5A880]" /> YAŞ
            </label>
            <input 
              type="number"
              disabled={!isEditing}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> CİNSİYET
            </label>
            <select
              disabled={!isEditing}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              <option value="erkek">Erkek</option>
              <option value="kadın">Kadın</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-cyan-400" /> BOY (CM)
            </label>
            <input 
              type="number"
              disabled={!isEditing}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-amber-400" /> GÜNCEL KİLO (KG)
            </label>
            <input 
              type="number"
              step="0.1"
              disabled={!isEditing}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-black tracking-wider text-slate-300 block flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              AKTİVİTE DÜZEYİ (ULUSLARARASI STANDART)
            </label>
            <select
              disabled={!isEditing}
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3.5 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              <option value="Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.">Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.</option>
              <option value="Az Hareketli (Hafif Aktif): Gün içinde ayaktayım veya ev işi yaparım. Haftada 1-3 gün hafif spor.">Az Hareketli (Hafif Aktif): Gün içinde ayaktayım / Haftada 1-3 gün hafif spor.</option>
              <option value="Orta Derecede Aktif: Gün boyu hareketli iş VEYA haftada 3-5 gün tempolu spor.">Orta Derecede Aktif: Gün boyu hareketli iş VEYA haftada 3-5 gün tempolu spor.</option>
              <option value="Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.">Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.</option>
              <option value="Ekstrem Aktif (Profesyonel): Günde çift idman yapan sporcu veya ağır inşaat/maden işçisi.">Ekstrem Aktif (Profesyonel): Günde çift idman veya ağır inşaat/maden işçisi.</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-wider text-slate-300 block flex items-center gap-2">
              <Target className="w-4 h-4 text-[#C5A880]" />
              DİYET & SPOR BİRLEŞİK HEDEF
            </label>
            <select
              disabled={!isEditing}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3.5 rounded-2xl outline-none focus:border-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              <option value="Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı bir şekilde zayıflamak istiyorum.">Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı zayıflama.</option>
              <option value="Hızlı Kilo Vermek: Doktor gözetiminde, kısa sürede maksimum yağ kaybı hedefliyorum.">Hızlı Kilo Vermek: Doktor gözetiminde maksimum yağ kaybı.</option>
              <option value="Formu Korumak (Diyet ağırlıklı): Mevcut kilomu korumak ve sağlıklı beslenmeyi alışkanlık edinmek istiyorum.">Formu Korumak: Mevcut kiloyu koruma ve sağlıklı beslenme.</option>
              <option value="Kondisyon & Sıkılaşmak (Spor ağırlıklı): Kilomu korurken vücudumu şekillendirmek ve dayanıklılığımı artırmak istiyorum.">Kondisyon & Sıkılaşmak: Kiloyu korurken vücudu şekillendirme.</option>
              <option value="Kas Kazanmak (Hacim/Bulking): Kas kütlemi artırmak ve daha yapılı bir vücuda sahip olmak istiyorum.">Kas Kazanmak (Bulking): Kas kütlesini artırma ve hacim kazanma.</option>
              <option value="Sağlıklı Kilo Almak: Temiz beslenerek, hacim kazanarak ve kilo alarak ideal kiloma ulaşmak istiyorum.">Sağlıklı Kilo Almak: Temiz beslenerek hacim kazanma.</option>
              <option value="Güç & Performans Artışı: Atletik performansımı, gücümü ve hızımı geliştirmek istiyorum.">Güç & Performans Artışı: Atletik performans ve güç geliştirme.</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4 animate-fadeIn">
            <button 
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>TÜM DEĞİŞİKLİKLERİ VE HEDEFLERİ KAYDET</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}