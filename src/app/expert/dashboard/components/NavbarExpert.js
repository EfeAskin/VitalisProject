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
  Sparkles,
  Store,
  Award,
  Trophy,
  FileText,
  Database,
  Utensils,
  Users,
  UserPlus,
  Calendar,
  MessageSquare,
  Headphones
} from 'lucide-react';

export default function NavbarExpert() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Neon DB'den dinamik olarak çekilecek kullanıcı bilgileri
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "trainer", // 'trainer' veya 'dietitian'
    profilePhoto: ""
  });

  // Veritabanından oturum açan uzman bilgilerini çekme
  useEffect(() => {
    async function fetchUserData() {
      const cachedFirst = localStorage.getItem("first_name") || localStorage.getItem("firstName");
      const cachedLast = localStorage.getItem("last_name") || localStorage.getItem("lastName") || "";
      const cachedPhoto = localStorage.getItem("profile_photo") || localStorage.getItem("profilePhoto") || "";
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      if (cachedFirst) {
        setUserData({
          firstName: cachedFirst,
          lastName: cachedLast,
          role: localStorage.getItem("role") || "trainer",
          profilePhoto: cachedPhoto
        });
      }

      try {
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
          const userObj = data.user || data;

          const firstName = userObj.first_name || userObj.firstName || "";
          const lastName = userObj.last_name || userObj.lastName || "";
          
          const profilePhoto = 
            userObj.profile_photo || 
            userObj.profilePhoto || 
            userObj.profileImage || 
            userObj.avatar || 
            userObj.image || 
            "";

          if (firstName) {
            setUserData({
              firstName: firstName,
              lastName: lastName,
              role: userObj.role || "trainer",
              profilePhoto: profilePhoto
            });

            localStorage.setItem("first_name", firstName);
            localStorage.setItem("last_name", lastName);
            if (profilePhoto) {
              localStorage.setItem("profile_photo", profilePhoto);
            } else {
              localStorage.removeItem("profile_photo");
            }
          }
        } else {
          console.warn("Auth me başarısız oldu:", res.status);
        }
      } catch (error) {
        console.error("Kullanıcı verisi çekilemedi:", error);
      }
    }

    fetchUserData();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error("Çıkış isteği sırasında hata:", err);
    }

    localStorage.clear();
    router.push("/");
  };

  const getInitials = () => {
    if (!userData.firstName) return "E";

    const cleanFirst = userData.firstName.trim();
    const cleanLast = userData.lastName ? userData.lastName.trim() : "";

    const firstInitial = cleanFirst.charAt(0);
    let lastInitial = "";

    if (cleanLast) {
      lastInitial = cleanLast.charAt(0);
    } else {
      const parts = cleanFirst.split(/\s+/);
      if (parts.length > 1) {
        lastInitial = parts[1].charAt(0);
      }
    }

    return (firstInitial + lastInitial).toUpperCase();
  };

  const isDashboardActive = pathname === "/expert/dashboard";
  const isProgramsActive = pathname.startsWith("/expert/programs");
  const isClientsActive = pathname.startsWith("/expert/clientfile") || pathname.startsWith("/expert/clients");
  const isMarketplaceActive = pathname.startsWith("/expert/marketplace");
  const isContactActive = pathname.startsWith("/expert/iletisim");
  const isProfileActive = pathname.startsWith("/expert/profile");

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
                <div className="absolute top-full left-0 pt-2 w-60 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {userData.role === 'trainer' ? (
                      <>
                        <Link href="/expert/programs?tab=workout-templates" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                          <FileText size={15} className="text-slate-400" />
                          <span>Antrenman Şablonları (PT)</span>
                        </Link>
                        <Link href="/expert/programs?tab=exercise-library" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                          <Database size={15} className="text-slate-400" />
                          <span>Egzersiz Veritabanı</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/expert/programs?tab=diet-templates" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                          <Utensils size={15} className="text-slate-400" />
                          <span>Beslenme & Diyet Planları</span>
                        </Link>
                        <Link href="/expert/programs?tab=food-database" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                          <Database size={15} className="text-slate-400" />
                          <span>Besin & Kalori Veritabanı</span>
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
                <div className="absolute top-full left-0 pt-2 w-64 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link href="/expert/clientfile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      <Users size={15} className="text-slate-400" />
                      <span>{userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi & Kalori"}</span>
                    </Link>
                    <Link href="/expert/clientfile?tab=requests" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-[#EA580C] font-medium hover:bg-slate-50 transition-colors">
                      <UserPlus size={15} className="text-[#EA580C]" />
                      <span>Yeni Danışan İstekleri</span>
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
                <div className="absolute top-full left-0 pt-2 w-60 z-50">
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link 
                      href="/expert/marketplace?tab=showcase" 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-orange-100 group-hover:text-[#EA580C] text-slate-500 transition-colors">
                        <Store size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Vitrin & İlan Panom</span>
                        <span className="text-[10px] text-slate-400 font-normal">Abonelik & profil yönetimi</span>
                      </div>
                    </Link>

                    <Link 
                      href="/expert/marketplace?tab=badges" 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-orange-100 group-hover:text-[#EA580C] text-slate-500 transition-colors">
                        <Award size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Rozetlerim & Puanım</span>
                        <span className="text-[10px] text-slate-400 font-normal">Kişisel başarılar & seviye</span>
                      </div>
                    </Link>

                    <Link 
                      href="/expert/marketplace?tab=leaderboard" 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-orange-100 group-hover:text-[#EA580C] text-slate-500 transition-colors">
                        <Trophy size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">Liderlik Tablosu</span>
                        <span className="text-[10px] text-slate-400 font-normal">Uzman sıralaması & rekabet</span>
                      </div>
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
                <div className="absolute top-full left-0 pt-2 w-60 z-50">
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
                    <Link href="/expert/iletisim?tab=appointments" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      <Calendar size={15} className="text-slate-400" />
                      <span>Randevularım</span>
                    </Link>
                    <Link href="/expert/iletisim?tab=messages" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      <MessageSquare size={15} className="text-slate-400" />
                      <span>Mesajlar (AI & Danışan)</span>
                    </Link>
                    <Link href="/expert/iletisim?tab=support" className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                      <Headphones size={15} className="text-slate-400" />
                      <span>Canlı Destek</span>
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
              {/* Profil Butonu (Fotoğraf + Ad Soyad) */}
              <button className={`flex items-center gap-2.5 border rounded-full pl-1.5 pr-3 py-1.5 transition-all ${isProfileActive ? 'border-[#EA580C] bg-orange-50/30' : 'border-slate-200/60 bg-slate-50 hover:bg-slate-100'}`}>
                <div className="w-8 h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0">
                  {userData.profilePhoto ? (
                    <img 
                      src={userData.profilePhoto} 
                      alt={`${userData.firstName} ${userData.lastName}`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                {/* Ad & Soyad Görünür Alanı */}
                <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
                  {userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : "Uzman"}
                </span>
                <ChevronDown size={14} className="text-slate-400 shrink-0" />
              </button>
              
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 pt-2 w-64 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Menü İçi İsim & Rol Kartı */}
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : "Uzman Hesabı"}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize font-medium">
                        {userData.role === 'trainer' ? 'Kişisel Antrenör' : 'Diyetisyen'}
                      </p>
                    </div>

                    <Link 
                      href="/expert/profile" 
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]"
                    >
                      <Settings size={14} /> Profil & Sertifikalar
                    </Link>
                    <Link href="#" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]">
                      <BarChart3 size={14} /> Danışan Analitikleri
                    </Link>
                    <Link href="#" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]">
                      <CreditCard size={14} /> Kazançlar & Uzman Paketleri
                    </Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left font-medium">
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
                <Link href="/expert/programs?tab=workout-templates" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                  <FileText size={14} className="text-slate-400" />
                  <span>Antrenman Şablonları (PT)</span>
                </Link>
                <Link href="/expert/programs?tab=exercise-library" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                  <Database size={14} className="text-slate-400" />
                  <span>Egzersiz Veritabanı</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/expert/programs?tab=diet-templates" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                  <Utensils size={14} className="text-slate-400" />
                  <span>Beslenme & Diyet Planları</span>
                </Link>
                <Link href="/expert/programs?tab=food-database" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                  <Database size={14} className="text-slate-400" />
                  <span>Besin & Kalori Veritabanı</span>
                </Link>
              </>
            )}
          </div>

          {/* Danışanlarım */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danışanlarım</p>
            <Link href="/expert/clientfile" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
              <Users size={14} className="text-slate-400" />
              <span>{userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi & Kalori"}</span>
            </Link>
            <Link href="/expert/clientfile?tab=requests" className="flex items-center gap-2 text-xs text-[#EA580C] font-medium" onClick={() => setMobileMenuOpen(false)}>
              <UserPlus size={14} className="text-[#EA580C]" />
              <span>Yeni Danışan İstekleri</span>
            </Link>
          </div>

          {/* Uzman Vitrini */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-3 my-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Uzman Vitrini</p>
            
            <Link 
              href="/expert/marketplace?tab=showcase" 
              className="flex items-center gap-2.5 text-xs font-medium text-slate-600 hover:text-[#EA580C] transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Store size={14} className="text-slate-400" />
              <span>Vitrin & İlan Panom</span>
            </Link>
            
            <Link 
              href="/expert/marketplace?tab=badges" 
              className="flex items-center gap-2.5 text-xs font-medium text-slate-600 hover:text-[#EA580C] transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Award size={14} className="text-slate-400" />
              <span>Rozetlerim & Puanım</span>
            </Link>
            
            <Link 
              href="/expert/marketplace?tab=leaderboard" 
              className="flex items-center gap-2.5 text-xs font-medium text-slate-600 hover:text-[#EA580C] transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Trophy size={14} className="text-slate-400" />
              <span>Liderlik Tablosu</span>
            </Link>
          </div>

          {/* İletişim & Randevu */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">İletişim & Randevu</p>
            <Link href="/expert/iletisim?tab=appointments" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
              <Calendar size={14} className="text-slate-400" />
              <span>Randevularım</span>
            </Link>
            <Link href="/expert/iletisim?tab=messages" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
              <MessageSquare size={14} className="text-slate-400" />
              <span>Mesajlar (AI & Danışan)</span>
            </Link>
            <Link href="/expert/iletisim?tab=support" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
              <Headphones size={14} className="text-slate-400" />
              <span>Canlı Destek</span>
            </Link>
          </div>

          {/* Profil & Çıkış (Mobil) */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2 pt-1 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Profil ({userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : "Uzman"})
            </p>
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