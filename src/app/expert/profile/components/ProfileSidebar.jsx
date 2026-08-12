"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Award,
  Package,
  Lock,
  LogOut,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Sparkles,
  Apple,
} from "lucide-react";

export default function ProfileSidebar({
  activeTab,
  setActiveTab,
  user,
  onUpdateUser,
}) {
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Profil fotoğrafı değiştirme
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Güvenli Çıkış İşlemi
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Çıkış yapılırken hata oluştu:", err);
    }
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    router.push("/");
  };

  // Rol Rozeti Oluşturucu
  const renderExpertBadge = () => {
    if (user?.role === "dietitian") {
      return (
        <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-heading font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
          <Apple size={12} className="shrink-0" /> EXPERT DİYETİSYEN
        </span>
      );
    }
    return (
      <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-heading font-black tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20 uppercase">
        <Sparkles size={11} className="shrink-0 text-amber-400" /> EXPERT PT
      </span>
    );
  };

  // Sekme Tanımları
  const tabs = [
    { id: "personal", label: "Kişisel Bilgiler", icon: User },
    { id: "certificates", label: "Sertifikalar & Uzmanlık", icon: Award },
    {
      id: "subscriptions",
      alias: "pricing",
      label: "Paketler & Abonelikler",
      icon: Package,
    },
    { id: "security", label: "Güvenlik & Şifre", icon: Lock },
  ];

  const firstName = user?.first_name || user?.firstName || "Uzman";
  const lastName = user?.last_name || user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName
  )}&background=ea580c&color=fff&bold=true`;

  return (
    <div className="w-full lg:w-80 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-2xl shrink-0">
      {/* Gizli Dosya Inputu */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Üst Profil Kartı & Dosya Yükleme */}
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar Container */}
          <div
            className="relative group cursor-pointer mb-4"
            onClick={() => fileInputRef.current?.click()}
            title="Profil Fotoğrafını Değiştir"
          >
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-orange-600 via-amber-500 to-slate-800 shadow-xl overflow-hidden relative">
              <img
                src={user?.profile_photo || user?.avatar || fallbackAvatar}
                alt={fullName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Kamera Rozeti */}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-orange-600 text-white border-2 border-slate-950 flex items-center justify-center shadow-lg group-hover:bg-orange-500 transition-colors">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-center max-w-full px-2">
            <h3 className="text-lg font-heading font-black text-white truncate">
              {fullName}
            </h3>
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
          </div>

          <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-full px-2">
            {user?.email || "E-posta Belirtilmedi"}
          </p>

          {renderExpertBadge()}
        </div>

        {/* Dikey Tab Navigasyon Menüsü */}
        <div className="space-y-2 pt-5 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || activeTab === tab.alias;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-heading font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-950/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-orange-500"
                  }`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Aksiyon Butonları */}
      <div className="pt-6 border-t border-slate-800/80 space-y-2.5 mt-8">
        <button
          type="button"
          onClick={() => router.push("/expert/dashboard")}
          className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-heading font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
          <span>DASHBOARD'A DÖN</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 font-heading font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-rose-900/30 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>GÜVENLİ ÇIKIŞ</span>
        </button>
      </div>
    </div>
  );
}