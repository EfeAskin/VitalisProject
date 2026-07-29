"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  Menu,
  X,
  Settings,
  BarChart3,
  CreditCard,
  LogOut,
  Dumbbell,
  Apple,
  Sparkles
} from 'lucide-react';

export default function NavbarExpert() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Neon DB'den dinamik olarak çekilecek kullanıcı bilgileri
  const [userData, setUserData] = useState({
    firstName: "Yükleniyor...",
    lastName: "",
    role: "trainer" // 'trainer' veya 'dietitian'
  });

  // Veritabanından oturum açan uzman bilgilerini çekme
  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        
        const headers = {
          "Content-Type": "application/json"
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: headers,
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setUserData({
            firstName: data.first_name,
            lastName: data.last_name,
            role: data.role,
            profilePhoto: data.profile_photo
          });
        } else {
          console.warn("Auth me başarısız oldu:", res.status);
        }
      } catch (error) {
        console.error("Kullanıcı verisi çekilemedi:", error);
      }
    }

    fetchUserData();
  }, []);

  // --- GÜVENLİ ÇIKIŞ FONKSİYONU ---
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error("Çıkış isteği sırasında hata:", err);
    }

    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    router.push("/");
  };

  // İsmin baş harflerini dinamik hesaplama
  const getInitials = () => {
    const first = userData.firstName ? userData.firstName[0] : "";
    const last = userData.lastName ? userData.lastName[0] : "";
    return (first + last).toUpperCase();
  };

  const isDashboardActive = pathname === "/expert/dashboard";
  const isProgramsActive = pathname.startsWith("/expert/programs");
  const isClientsActive = pathname.startsWith("/expert/clientfile") || pathname.startsWith("/expert/clients");
  const isMarketplaceActive = pathname.startsWith("/expert/marketplace");
  const isContactActive = pathname.startsWith("/expert/iletisim");
  const isProfileActive = pathname.startsWith("/expert/profile");

  // Rol bazlı dinamik rozet
  const renderRoleBadge = () => {
    if (userData.role === 'trainer') {
      return (
        <div className="flex items-center gap-1.5 ml-3 select-none">
          <span className="bg-[#EA580C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={10} /> EXPERT PT
          </span>
          <div className="w-6 h-6 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shadow-sm" title="Kişisel Antrenör">
            <Dumbbell size={12} className="rotate-45" />
          </div>
        </div>
      );
    }
    if (userData.role === 'dietitian') {
      return (
        <div className="flex items-center gap-1.5 ml-3 select-none">
          <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={10} /> EXPERT DİYETİSYEN
          </span>
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm" title="Diyetisyen">
            <Apple size={12} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm w-full">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo ve Dinamik Rol Rozeti */}
          <div className="flex items-center">
            <Link href="/expert/dashboard" className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-3 group">
              <img
                src="/icon.png"
                alt="Vitalis-OS Logo"
                className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-12"
              />
              <div className="flex items-center font-black tracking-wider">
                <span className="text-slate-950">VITALIS</span>
                <span className="text-[#EA580C] font-light">-OS</span>
              </div>
            </Link>
            {renderRoleBadge()}
          </div>

          {/* Masaüstü Orta Bölüm */}
          <div className="hidden lg:flex space-x-8 items-center h-full">
            <Link
              href="/expert/dashboard"
              className={`text-sm font-semibold h-full flex items-center transition-colors ${
                isDashboardActive
                  ? "text-[#EA580C] border-b-2 border-[#EA580C]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>

            {/* Program Yönetimi */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('program')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/expert/programs"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isProgramsActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Program Yönetimi</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'program' && (
                <div className="absolute top-full left-0 pt-2 w-52 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {userData.role === 'trainer' ? (
                      <>
                        <Link href="/expert/programs?tab=workout-templates" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                          Antrenman Şablonları (PT)
                        </Link>
                        <Link href="/expert/programs?tab=exercise-library" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                          Egzersiz Veritabanı
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/expert/programs?tab=diet-templates" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                          Beslenme & Diyet Planları
                        </Link>
                        <Link href="/expert/programs?tab=food-database" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                          Besin & Kalori Veritabanı
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Danışanlarım */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('clients')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/expert/clientfile"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isClientsActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Danışanlarım</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'clients' && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link href="/expert/clientfile" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      {userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi & Kalori"}
                    </Link>
                    <Link href="/expert/clientfile?tab=requests" className="block px-4 py-2.5 text-xs text-[#EA580C] font-medium hover:bg-slate-50 transition-colors">
                      Yeni Danışan İstekleri
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Uzman Vitrini */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('market')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/expert/marketplace"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isMarketplaceActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Uzman Vitrini</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'market' && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link href="/expert/marketplace" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      Eşleşme Havuzu
                    </Link>
                    <Link href="/expert/marketplace" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      Rozet & Skor Durumu
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* İletişim & Randevu */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('contact')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                href="/expert/iletisim" 
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isContactActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>İletişim & Randevu</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'contact' && (
                <div className="absolute top-full left-0 pt-2 w-56 z-50">
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                    <Link href="/expert/iletisim?tab=appointments" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      Randevularım
                    </Link>
                    <Link href="/expert/iletisim?tab=messages" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      Mesajlar (AI & Danışan)
                    </Link>
                    <Link href="/expert/iletisim?tab=support" className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      Canlı Destek
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Masaüstü Sağ Bölüm */}
          <div className="hidden lg:flex items-center space-x-4">
            <button className="p-2.5 bg-slate-50 rounded-full text-slate-500 hover:text-[#EA580C] relative transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EA580C] border-2 border-white rounded-full animate-pulse"></span>
            </button>
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('profile')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`flex items-center gap-3 border rounded-full pl-2 pr-4 py-1.5 transition-all ${isProfileActive ? 'border-[#EA580C] bg-orange-50/30' : 'border-slate-200/60 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {getInitials()}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {userData.firstName} {userData.lastName}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 pt-2 w-60 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link 
                      href="/expert/profile" 
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Settings size={14} /> Profil & Sertifikalar
                    </Link>
                    <Link href="#" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50">
                      <BarChart3 size={14} /> Danışan Analitikleri
                    </Link>
                    <Link href="#" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50">
                      <CreditCard size={14} /> Kazançlar & Uzman Paketleri
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left">
                      <LogOut size={14} /> Güvenli Çıkış
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobil Menü Butonu */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Dropdown Menü */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 pt-3 pb-6 space-y-4 shadow-inner w-full">
          <Link
            href="/expert/dashboard"
            className={`block font-semibold text-sm ${isDashboardActive ? 'text-[#EA580C]' : 'text-slate-600'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>

          {/* Program Yönetimi */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Program Yönetimi</p>
            {userData.role === 'trainer' ? (
              <>
                <Link href="/expert/programs?tab=workout-templates" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Antrenman Şablonları (PT)</Link>
                <Link href="/expert/programs?tab=exercise-library" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Egzersiz Veritabanı</Link>
              </>
            ) : (
              <>
                <Link href="/expert/programs?tab=diet-templates" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Beslenme & Diyet Planları</Link>
                <Link href="/expert/programs?tab=food-database" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Besin & Kalori Veritabanı</Link>
              </>
            )}
          </div>

          {/* Danışanlarım */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danışanlarım</p>
            <Link href="/expert/clientfile" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
              {userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi & Kalori"}
            </Link>
            <Link href="/expert/clientfile?tab=requests" className="block text-xs text-[#EA580C] font-medium" onClick={() => setMobileMenuOpen(false)}>Yeni Danışan İstekleri</Link>
          </div>

          {/* Uzman Vitrini */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uzman Vitrini</p>
            <Link href="/expert/marketplace" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Eşleşme Havuzu</Link>
            <Link href="/expert/marketplace" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Rozet & Skor Durumu</Link>
          </div>

          {/* İletişim & Randevu */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">İletişim & Randevu</p>
            <Link href="/expert/iletisim?tab=appointments" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Randevularım</Link>
            <Link href="/expert/iletisim?tab=messages" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Mesajlar (AI & Danışan)</Link>
            <Link href="/expert/iletisim?tab=support" className="block text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>Canlı Destek</Link>
          </div>

          {/* Profil & Çıkış (Mobil) */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2 pt-1 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profil ({userData.firstName})</p>
            <Link 
              href="/expert/profile" 
              className="block text-xs text-slate-600 hover:text-[#EA580C]" 
              onClick={() => setMobileMenuOpen(false)}
            >
              Profil & Sertifikalar
            </Link>
            <button onClick={handleLogout} className="block text-xs text-red-600 font-medium text-left pt-1">
              Güvenli Çıkış
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}