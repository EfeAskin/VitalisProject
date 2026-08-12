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
    <div className="w-full lg:w-80 bg-[#1A1816] border border-[#D4AF37]/30 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] opacity-80"></div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, image/jpg, image/webp" 
        className="hidden" 
      />

      <div className="space-y-8">
        <div className="flex flex-col items-center text-center">
          
          <div 
            className="relative group cursor-pointer mb-6" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-br from-[#D4AF37] via-amber-300 to-[#997A15] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              <img 
                src={user.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300"} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500 brightness-110"
              />
            </div>
            
            <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#11142D] text-[#D4AF37] border border-[#D4AF37]/60 flex items-center justify-center shadow-lg group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <h3 className="text-xl font-black text-white tracking-wide">{user.first_name} {user.last_name}</h3>
            <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase font-bold">{user.email}</p>
            </div>
          </div>
          
          <span className="mt-4 text-[9px] font-black tracking-[0.3em] text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 uppercase shadow-sm">
            VIP ELITE MEMBER
          </span>
        </div>

        <div className="space-y-3 pt-6 border-t border-white/10">
          {[
            { id: "personal", label: "Kişisel Bilgiler", icon: User },
            { id: "subscriptions", label: "Abonelikler & Ödeme", icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-500 ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B89728] text-black font-black shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[#D4AF37]"
                    : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-[#D4AF37]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-8 border-t border-white/10 space-y-3">
        <button 
          onClick={() => window.location.href = "/dashboard"}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white/80 font-bold rounded-2xl text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all border border-white/10 hover:border-white/20"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => window.location.href = "/"}
          className="w-full py-4 bg-transparent hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-bold rounded-2xl text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all border border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Oturumu Kapat</span>
        </button>
      </div>

    </div>
  );
}