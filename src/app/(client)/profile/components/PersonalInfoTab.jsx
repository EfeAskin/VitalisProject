"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Save, CheckCircle2, Edit3, Lock, Camera, Activity, Target, Calendar, Ruler, Weight 
} from "lucide-react";

export default function PersonalInfoTab({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || 23,
    gender: user?.gender || "Belirtilmedi",
    height: user?.height || 180,
    weight: user?.weight || 75.2,
    activity_level: user?.activity_level || "Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.",
    goal: user?.goal || "Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı bir şekilde zayıflamak istiyorum."
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || 23,
        gender: user.gender || "Belirtilmedi",
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
    <div className="bg-[#1A1816] border border-[#D4AF37]/30 rounded-[2.5rem] p-6 md:p-8 space-y-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-[120px] pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/30">
               <User className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Kişisel Bilgiler
          </h3>
          <p className="text-[11px] font-medium text-white/60 tracking-[0.2em] mt-2 uppercase">
            Biyometrik Veri Yönetimi & Metabolik Hedefler
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/30 animate-pulse">
              <CheckCircle2 className="w-3.5 h-3.5" /> DEĞİŞİKLİKLER KAYDEDİLDİ
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] transition-all duration-300 flex items-center gap-2 border ${
              isEditing
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10 hover:border-white/20"
            }`}
          >
            <Edit3 className="w-3 h-3 text-[#D4AF37]" />
            {isEditing ? "DÜZENLEMEYİ KAPAT" : "PROFİLİ DÜZENLE"}
          </button>
        </div>
      </div>

      <div className="bg-[#221F1C] p-6 rounded-3xl border border-[#D4AF37]/20 flex flex-col sm:flex-row items-center gap-6 shadow-inner">
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
          <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-[#D4AF37] to-amber-600 shadow-2xl overflow-hidden">
            <img 
              src={user?.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {isEditing && (
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#D4AF37] text-black border-2 border-[#221F1C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 stroke-[3]" />
            </div>
          )}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-black text-white">Profil Fotoğrafı</h4>
          <p className="text-[10px] text-white/60 uppercase tracking-widest">
            {isEditing ? "Resmi değiştirmek için üzerine tıklayın." : "Fotoğraf değiştirmek için düzenleme modunu açın."}
          </p>
          <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-[#D4AF37] font-bold tracking-wider">
            JPG, PNG, WEBP • MAX 5MB
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "AD", key: "first_name", icon: User },
            { label: "SOYAD", key: "last_name", icon: User },
          ].map((item, idx) => (
            <div key={idx} className="space-y-2">
              <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1">{item.label}</label>
              <div className="relative group">
                <item.icon className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#D4AF37] transition-colors" />
                <input 
                  type="text"
                  disabled={!isEditing}
                  value={formData[item.key]}
                  onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                  className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em]">E-POSTA ADRESİ</label>
              <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Değiştirilemez
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="email"
                disabled={true}
                value={formData.email}
                className="w-full bg-[#181614] border border-white/10 text-white/50 text-xs pl-12 pr-4 py-4 rounded-2xl outline-none cursor-not-allowed font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1">TELEFON NUMARASI</label>
            <div className="relative group">
              <Phone className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#D4AF37] transition-colors" />
              <input 
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> YAŞ
            </label>
            <input 
              type="number"
              disabled={!isEditing}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#D4AF37]" /> CİNSİYET
            </label>
            <select
              disabled={!isEditing}
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all cursor-pointer font-medium"
            >
              <option value="Belirtilmedi">Belirtilmedi</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" /> BOY (CM)
            </label>
            <input 
              type="number"
              disabled={!isEditing}
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <Weight className="w-3.5 h-3.5 text-[#D4AF37]" /> GÜNCEL KİLO (KG)
            </label>
            <input 
              type="number"
              step="0.1"
              disabled={!isEditing}
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" /> AKTİVİTE DÜZEYİ
            </label>
            <select
              disabled={!isEditing}
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all cursor-pointer font-medium"
            >
              <option value="Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.">Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.</option>
              <option value="Az Hareketli (Hafif Aktif): Gün içinde ayaktayım veya ev işi yaparım. Haftada 1-3 gün hafif spor.">Az Hareketli (Hafif Aktif): Gün içinde ayaktayım / Haftada 1-3 gün hafif spor.</option>
              <option value="Orta Derecede Aktif: Gün boyu hareketli iş VEYA haftada 3-5 gün tempolu spor.">Orta Derecede Aktif: Gün boyu hareketli iş VEYA haftada 3-5 gün tempolu spor.</option>
              <option value="Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.">Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.</option>
              <option value="Ekstrem Aktif (Profesyonel): Günde çift idman yapan sporcu veya ağır inşaat/maden işçisi.">Ekstrem Aktif (Profesyonel): Günde çift idman veya ağır inşaat/maden işçisi.</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-[#D4AF37] tracking-[0.2em] px-1 flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#D4AF37]" /> DİYET & SPOR HEDEFİ
            </label>
            <select
              disabled={!isEditing}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full bg-[#221F1C] border border-[#D4AF37]/20 text-white text-xs px-4 py-4 rounded-2xl outline-none focus:border-[#D4AF37] disabled:opacity-60 transition-all cursor-pointer font-medium"
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
              className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-[#E5BF47] hover:to-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-amber-[#D4AF37]/20 active:scale-95"
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