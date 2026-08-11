"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, Mail, Phone, Save, CheckCircle2, Edit3, Lock, Camera, Activity, Target, Calendar, Ruler, Weight, FileText, Upload, ExternalLink, FileCheck 
} from "lucide-react";

export default function PersonalInfoTab({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const fileInputRef = useRef(null);
  const certificateInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    age: user?.age || 28,
    gender: user?.gender || "erkek",
    height: user?.height || 180,
    weight: user?.weight || 78.5,
    activity_level: user?.activity_level || "Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.",
    goal: user?.goal || "Güç & Performans Artışı: Atletik performansımı, gücümü ve hızımı geliştirmek istiyorum.",
    certificate_url: user?.certificate_url || ""
  });

  // Backend Veri Senkronizasyonu
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        age: user.age || 28,
        gender: user.gender || "erkek",
        height: user.height || 180,
        weight: user.weight || 78.5,
        activity_level: user.activity_level || "Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.",
        goal: user.goal || "Güç & Performans Artışı: Atletik performansımı, gücümü ve hızımı geliştirmek istiyorum.",
        certificate_url: user.certificate_url || ""
      });
    }
  }, [user]);

  // Profil Fotoğrafı Yükleme
  const handlePhotoChange = async (e) => {
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
      const res = await fetch("/api/expert/profile/upload-photo", {
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

  // E-Devlet Diploma / Sertifika Yükleme (PDF, JPG, PNG)
  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Lütfen yalnızca PDF, JPG, PNG veya WEBP formatında belge yükleyin.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Sertifika/Diploma dosya boyutu maksimum 10MB olabilir.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("certificate", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/profile/upload-certificate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (res.ok) {
        const result = await res.json();
        const updatedCertUrl = result.certificate_url;
        setFormData(prev => ({ ...prev, certificate_url: updatedCertUrl }));
        onUpdateUser({ certificate_url: updatedCertUrl });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Sertifika yüklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Sertifika yükleme hatası:", err);
    }
  };

  // Form Gönderme
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/expert/profile", {
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
      
      {/* Üst Başlık & Aksiyon */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <User className="w-6 h-6 text-[#EA580C]" />
            Uzman Profil & Kişisel Biyometrik Bilgiler
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Hesap bilgilerinizi, resmi belgelerinizi ve kendi kişisel fiziksel takip verilerinizi yönetin.
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
            <Edit3 className="w-3.5 h-3.5 text-[#EA580C]" />
            <span>{isEditing ? "DÜZENLEMEYİ KAPAT" : "BİLGİLERİ DÜZENLE"}</span>
          </button>
        </div>
      </div>

      {/* Profil Fotoğrafı Alanı */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoChange} 
          accept="image/png, image/jpeg, image/jpg, image/webp" 
          className="hidden" 
        />

        <div 
          className={`relative group ${isEditing ? "cursor-pointer" : "cursor-default"}`}
          onClick={() => {
            if (isEditing) fileInputRef.current?.click();
          }}
        >
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#EA580C] via-amber-500 to-slate-800 shadow-xl overflow-hidden">
            <img 
              src={user?.profile_photo || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs33WR1InDySZnLpJ1Y7tiE__x5WesLB0knwzwo1URcSkjeQk3utpD9GAn&s=10"} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {isEditing && (
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#EA580C] text-white border-2 border-slate-950 flex items-center justify-center shadow-lg group-hover:bg-orange-600 transition-colors">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>

        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-extrabold text-white">Uzman Profil Fotoğrafı</h4>
          <p className="text-xs text-slate-400">
            {isEditing ? "Resmi değiştirmek için üzerine tıklayın." : "Fotoğraf değiştirmek için 'Bilgileri Düzenle' butonuna basın."}
          </p>
          <p className="text-[10px] font-bold text-slate-500">
            Desteklenen formatlar: JPG, PNG, WEBP. Maksimum 5MB.
          </p>
        </div>
      </div>

      {/* 📜 YENİ EKLENEN ALAN: E-Devlet Onaylı Sertifika & Diploma Yükleme */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <input 
          type="file" 
          ref={certificateInputRef} 
          onChange={handleCertificateUpload} 
          accept=".pdf, image/png, image/jpeg, image/jpg, image/webp" 
          className="hidden" 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#EA580C]" />
              E-Devlet Onaylı Diploma / Uzmanlık Sertifikası
            </h4>
            <p className="text-xs text-slate-400">
              Sisteme kayıtlı uzmanlığınızı doğrulamak için E-Devlet veya üniversite onaylı belgenizi yükleyin.
            </p>
            <p className="text-[10px] font-bold text-slate-500">
              Kabul edilen formatlar: PDF, JPG, PNG, WEBP. Maksimum 10MB.
            </p>
          </div>

          <button
            type="button"
            disabled={!isEditing}
            onClick={() => certificateInputRef.current?.click()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all shrink-0"
          >
            <Upload className="w-4 h-4 text-[#EA580C]" />
            <span>BELGE YÜKLE</span>
          </button>
        </div>

        {/* Yüklenmiş Belge Durumu */}
        {formData.certificate_url ? (
          <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">Yüklendi ve Doğrulama Bekliyor / Onaylandı</span>
            </div>
            <a 
              href={formData.certificate_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Görüntüle <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="mt-2 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">Henüz herhangi bir diploma/sertifika yüklenmedi.</span>
          </div>
        )}
      </div>

      {/* Form Alanları */}
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
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                required
              />
            </div>
          </div>

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
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-10 pr-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#EA580C]" /> YAŞ
            </label>
            <input 
              type="number"
              disabled={!isEditing}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
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
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-xs font-black tracking-wider text-slate-300 block flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              KİŞİSEL AKTİVİTE DÜZEYİ
            </label>
            <select
              disabled={!isEditing}
              value={formData.activity_level}
              onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3.5 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              <option value="Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım, masa başı işim var.">Sedanter (Çok Hareketsiz): Tüm gün oturarak çalışırım.</option>
              <option value="Az Hareketli (Hafif Aktif): Gün içinde ayaktayım / Haftada 1-3 gün hafif spor.">Az Hareketli (Hafif Aktif): Haftada 1-3 gün hafif spor.</option>
              <option value="Orta Derecede Aktif: Gün boyu hareketli iş VEYA haftada 3-5 gün tempolu spor.">Orta Derecede Aktif: Haftada 3-5 gün tempolu spor.</option>
              <option value="Çok Aktif (Yüksek Aktivite): Yoğun fiziksel iş VEYA haftada 6-7 gün ağır antrenman.">Çok Aktif (Yüksek Aktivite): Haftada 6-7 gün ağır antrenman.</option>
              <option value="Ekstrem Aktif (Profesyonel): Günde çift idman yapan sporcu veya ağır inşaat/maden işçisi.">Ekstrem Aktif (Profesyonel): Günde çift idman yapan sporcu.</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black tracking-wider text-slate-300 block flex items-center gap-2">
              <Target className="w-4 h-4 text-[#EA580C]" />
              KİŞİSEL FİTNESS / BESLENME HEDEFİ
            </label>
            <select
              disabled={!isEditing}
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs px-4 py-3.5 rounded-2xl outline-none focus:border-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            >
              <option value="Kilo Vermek (Yağ Yakımı): Kalori açığı yaratarak sağlıklı bir şekilde zayıflamak istiyorum.">Kilo Vermek (Yağ Yakımı)</option>
              <option value="Formu Korumak (Diyet ağırlıklı): Mevcut kilomu korumak ve sağlıklı beslenmeyi alışkanlık edinmek istiyorum.">Formu Korumak</option>
              <option value="Kondisyon & Sıkılaşmak (Spor ağırlıklı): Kilomu korurken vücudumu şekillendirmek ve dayanıklılığımı artırmak istiyorum.">Kondisyon & Sıkılaşmak</option>
              <option value="Kas Kazanmak (Hacim/Bulking): Kas kütlemi artırmak ve daha yapılı bir vücuda sahip olmak istiyorum.">Kas Kazanmak (Bulking)</option>
              <option value="Güç & Performans Artışı: Atletik performansımı, gücümü ve hızımı geliştirmek istiyorum.">Güç & Performans Artışı</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4 animate-fadeIn">
            <button 
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-[#EA580C] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-[#EA580C]/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>DEĞİŞİKLİKLERİ VE BELGELERİ KAYDET</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}