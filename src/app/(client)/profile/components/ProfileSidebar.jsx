"use client";

import React, { useRef } from "react";
import { 
  User, 
  Activity, 
  Lock, 
  CreditCard, 
  LogOut, 
  ArrowLeft, 
  Camera, 
  ShieldCheck 
} from "lucide-react";

export default function ProfileSidebar({ activeTab, setActiveTab, user, onUpdateUser }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateUser({ profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full lg:w-80 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md">
      
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
          
          {/* Avatar Container (CypInVest Tarzı) */}
          <div 
            className="relative group cursor-pointer mb-4" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#C5A880] via-emerald-500 to-slate-800 shadow-xl overflow-hidden">
              <img 
                src={user.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Kamera Rozeti */}
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-950 flex items-center justify-center shadow-lg group-hover:bg-emerald-400 transition-colors">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <h3 className="text-lg font-black text-white">{user.first_name} {user.last_name}</h3>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          
          <span className="mt-3 text-[10px] font-black tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-3 py-1 rounded-full border border-[#C5A880]/20 uppercase">
            VIP MEMBER (CLIENT)
          </span>
        </div>

        {/* Dikey Tab Navigasyon Menüsü */}
        <div className="space-y-2 pt-4 border-t border-slate-800">
          {[
            { id: "personal", label: "Kişisel Bilgiler", icon: User },
            { id: "subscriptions", label: "Abonelikler & Ödemeler", icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-950/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-[#C5A880]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alt Aksiyon Butonları */}
      <div className="pt-6 border-t border-slate-800 space-y-2 mt-8">
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>DASHBOARD'A DÖN</span>
        </button>

        <button 
          onClick={() => window.location.href = "/"}
          className="w-full py-2.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-rose-900/30"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>GÜVENLİ ÇIKIŞ</span>
        </button>
      </div>

    </div>
  );
}