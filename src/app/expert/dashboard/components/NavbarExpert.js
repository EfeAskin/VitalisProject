"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [isLoaded, setIsLoaded] = useState(false);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "trainer",
    profilePhoto: ""
  });

  useEffect(() => {
    async function fetchUserData() {
      const cachedFirst = localStorage.getItem("first_name") || localStorage.getItem("firstName");
      const cachedLast = localStorage.getItem("last_name") || localStorage.getItem("lastName") || "";
      const cachedPhoto = localStorage.getItem("profile_photo") || localStorage.getItem("profilePhoto") || "";
      const cachedRole = localStorage.getItem("role") || "trainer";
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      if (cachedFirst) {
        setUserData({
          firstName: cachedFirst,
          lastName: cachedLast,
          role: cachedRole,
          profilePhoto: cachedPhoto
        });
      }

      setIsLoaded(true);

      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

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
          const role = userObj.role || "trainer";
          const profilePhoto = 
            userObj.profile_photo || 
            userObj.profilePhoto || 
            userObj.profileImage || 
            userObj.avatar || 
            userObj.image || 
            "";

          if (firstName) {
            setUserData({ firstName, lastName, role, profilePhoto });

            localStorage.setItem("first_name", firstName);
            localStorage.setItem("last_name", lastName);
            localStorage.setItem("role", role);
            if (profilePhoto) {
              localStorage.setItem("profile_photo", profilePhoto);
            } else {
              localStorage.removeItem("profile_photo");
            }
          }
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

    const authKeys = ["first_name", "firstName", "last_name", "lastName", "profile_photo", "profilePhoto", "role", "token", "access_token"];
    authKeys.forEach(key => localStorage.removeItem(key));

    router.push("/");
  };

  const getInitials = () => {
    if (!userData.firstName) return "E";
    const cleanFirst = userData.firstName.trim();
    const cleanLast = userData.lastName ? userData.lastName.trim() : "";

    const firstInitial = cleanFirst.charAt(0);
    let lastInitial = cleanLast ? cleanLast.charAt(0) : "";

    if (!lastInitial) {
      const parts = cleanFirst.split(/\s+/);
      if (parts.length > 1) lastInitial = parts[1].charAt(0);
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
    if (!isLoaded) return null;

    if (userData.role === 'trainer') {
      return (
        <div className="hidden sm:flex items-center gap-1.5 ml-2.5 select-none shrink-0">
          <span className="bg-[#EA580C] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={9} /> Antrenör
          </span>
          <div className="w-6 h-6 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center shadow-sm" title="Kişisel Antrenör">
            <Dumbbell size={10} className="rotate-45" />
          </div>
        </div>
      );
    }
    if (userData.role === 'dietitian') {
      return (
        <div className="hidden sm:flex items-center gap-1.5 ml-2.5 select-none shrink-0">
          <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={9} /> DİYETİSYEN
          </span>
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm" title="Diyetisyen">
            <Apple size={10} />
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px] sm:h-[72px] items-center">
            
            {/* Logo ve Rozet */}
            <div className="flex items-center shrink-0 min-w-0">
              <Link href="/expert/dashboard" className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2 group shrink-0">
                <Image
                  src="/icon.png"
                  alt="Vitalis-OS Logo"
                  width={36}
                  height={36}
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-500 group-hover:rotate-12 shrink-0"
                />
                <div className="flex items-center font-black tracking-wider whitespace-nowrap shrink-0">
                  <span className="text-slate-950">VITALIS</span>
                  <span className="text-[#EA580C] font-light">-OS</span>
                </div>
              </Link>
              {renderRoleBadge()}
            </div>

            {/* Masaüstü Menü */}
            <div className="hidden lg:flex space-x-6 xl:space-x-8 items-center h-full">
              <Link
                href="/expert/dashboard"
                className={`text-xs xl:text-sm font-semibold h-full flex items-center transition-colors ${
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
                  className={`flex items-center gap-1 text-xs xl:text-sm font-semibold transition-colors py-2 ${
                    isProgramsActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Program Yönetimi</span> <ChevronDown size={13} />
                </Link>
                {activeDropdown === 'program' && (
                  <div className="absolute top-full left-0 pt-1 w-56 z-50">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {userData.role === 'trainer' ? (
                        <>
                          <Link href="/expert/programs?tab=workout-templates" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                            <FileText size={14} className="text-slate-400" />
                            <span>Antrenman Şablonları (PT)</span>
                          </Link>
                          <Link href="/expert/programs?tab=exercise-library" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                            <Database size={14} className="text-slate-400" />
                            <span>Egzersiz Veritabanı</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href="/expert/programs?tab=diet-templates" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                            <Utensils size={14} className="text-slate-400" />
                            <span>Beslenme & Diyet Planları</span>
                          </Link>
                          <Link href="/expert/programs?tab=food-database" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                            <Database size={14} className="text-slate-400" />
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
                  className={`flex items-center gap-1 text-xs xl:text-sm font-semibold transition-colors py-2 ${
                    isClientsActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Danışanlarım</span> <ChevronDown size={13} />
                </Link>
                {activeDropdown === 'clients' && (
                  <div className="absolute top-full left-0 pt-1 w-60 z-50">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link href="/expert/clientfile" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                        <Users size={14} className="text-slate-400" />
                        <span>{userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi"}</span>
                      </Link>
                      <Link href="/expert/clientfile?tab=requests" className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#EA580C] font-medium hover:bg-slate-50 transition-colors">
                        <UserPlus size={14} className="text-[#EA580C]" />
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
                  className={`flex items-center gap-1 text-xs xl:text-sm font-semibold transition-colors py-2 ${
                    isMarketplaceActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Uzman Vitrini</span> <ChevronDown size={13} />
                </Link>
                {activeDropdown === 'market' && (
                  <div className="absolute top-full left-0 pt-1 w-56 z-50">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link 
                        href="/expert/marketplace?tab=showcase" 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all"
                      >
                        <Store size={14} className="text-slate-400" />
                        <span>Vitrin & İlan Panom</span>
                      </Link>

                      <Link 
                        href="/expert/marketplace?tab=badges" 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all"
                      >
                        <Award size={14} className="text-slate-400" />
                        <span>Rozetlerim & Puanım</span>
                      </Link>

                      <Link 
                        href="/expert/marketplace?tab=leaderboard" 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#EA580C] hover:bg-orange-50/60 transition-all"
                      >
                        <Trophy size={14} className="text-slate-400" />
                        <span>Liderlik Tablosu</span>
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
                  className={`flex items-center gap-1 text-xs xl:text-sm font-semibold transition-colors py-2 ${
                    isContactActive ? "text-[#EA580C]" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>İletişim & Randevu</span> <ChevronDown size={13} />
                </Link>
                {activeDropdown === 'contact' && (
                  <div className="absolute top-full left-0 pt-1 w-56 z-50">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link href="/expert/iletisim?tab=appointments" className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                        <Calendar size={14} className="text-slate-400" />
                        <span>Randevularım</span>
                      </Link>
                      <Link href="/expert/iletisim?tab=messages" className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                        <MessageSquare size={14} className="text-slate-400" />
                        <span>Mesajlar (AI & Danışan)</span>
                      </Link>
                      <Link href="/expert/iletisim?tab=support" className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#EA580C] transition-colors">
                        <Headphones size={14} className="text-slate-400" />
                        <span>Canlı Destek</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Masaüstü Sağ Profil Bölümü */}
            <div className="hidden lg:flex items-center space-x-3">
              <button aria-label="Bildirimler" className="p-2 bg-slate-50 rounded-full text-slate-500 hover:text-[#EA580C] relative transition-all">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EA580C] border-2 border-white rounded-full animate-pulse"></span>
              </button>
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown('profile')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button 
                  aria-expanded={activeDropdown === 'profile'}
                  className={`flex items-center gap-2 border rounded-full pl-1 pr-2.5 py-1 transition-all ${isProfileActive ? 'border-[#EA580C] bg-orange-50/30' : 'border-slate-200/60 bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#EA580C] text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden shrink-0 relative">
                    {userData.profilePhoto ? (
                      <Image 
                        src={userData.profilePhoto} 
                        alt={`${userData.firstName} ${userData.lastName}`} 
                        fill
                        sizes="28px"
                        className="object-cover" 
                      />
                    ) : (
                      getInitials()
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                    {userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : "Uzman"}
                  </span>
                  <ChevronDown size={12} className="text-slate-400 shrink-0" />
                </button>
                
                {activeDropdown === 'profile' && (
                  <div className="absolute top-full right-0 pt-1 w-60 z-50">
                    <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : "Uzman Hesabı"}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize font-medium">
                          {userData.role === 'trainer' ? 'Kişisel Antrenör' : 'Diyetisyen'}
                        </p>
                      </div>

                      <Link 
                        href="/expert/profile" 
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]"
                      >
                        <Settings size={14} /> Profil & Sertifikalar
                      </Link>
                      <Link href="/expert/analytics" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]">
                        <BarChart3 size={14} /> Danışan Analitikleri
                      </Link>
                      <Link href="/expert/earnings" className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#EA580C]">
                        <CreditCard size={14} /> Kazançlar & Uzman Paketleri
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium">
                        <LogOut size={14} /> Güvenli Çıkış
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobil Menü Butonu */}
            <div className="flex items-center lg:hidden gap-2">
              <button aria-label="Bildirimler" className="p-1.5 bg-slate-50 rounded-full text-slate-500 relative">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA580C] rounded-full"></span>
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-1.5 text-slate-700 hover:text-slate-900"
                aria-label="Menüyü aç/kapat"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil Dropdown Menü */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 backdrop-blur-lg border-t border-slate-100 px-5 pt-3 pb-5 space-y-3 shadow-lg w-full max-h-[85vh] overflow-y-auto">
            <Link
              href="/expert/dashboard"
              className={`block font-semibold text-xs ${isDashboardActive ? 'text-[#EA580C]' : 'text-slate-700'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>

            {/* Program Yönetimi */}
            <div className="border-l-2 border-slate-100 pl-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Yönetimi</p>
              {userData.role === 'trainer' ? (
                <>
                  <Link href="/expert/programs?tab=workout-templates" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                    <FileText size={13} className="text-slate-400" />
                    <span>Antrenman Şablonları (PT)</span>
                  </Link>
                  <Link href="/expert/programs?tab=exercise-library" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                    <Database size={13} className="text-slate-400" />
                    <span>Egzersiz Veritabanı</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/expert/programs?tab=diet-templates" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                    <Utensils size={13} className="text-slate-400" />
                    <span>Beslenme & Diyet Planları</span>
                  </Link>
                  <Link href="/expert/programs?tab=food-database" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                    <Database size={13} className="text-slate-400" />
                    <span>Besin & Kalori Veritabanı</span>
                  </Link>
                </>
              )}
            </div>

            {/* Danışanlarım */}
            <div className="border-l-2 border-slate-100 pl-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Danışanlarım</p>
              <Link href="/expert/clientfile" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                <Users size={13} className="text-slate-400" />
                <span>{userData.role === 'trainer' ? "PT Danışan Listesi & Gelişim" : "Diyetisyen Danışan Listesi"}</span>
              </Link>
              <Link href="/expert/clientfile?tab=requests" className="flex items-center gap-2 text-xs text-[#EA580C] font-medium" onClick={() => setMobileMenuOpen(false)}>
                <UserPlus size={13} className="text-[#EA580C]" />
                <span>Yeni Danışan İstekleri</span>
              </Link>
            </div>

            {/* Uzman Vitrini */}
            <div className="border-l-2 border-slate-100 pl-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uzman Vitrini</p>
              <Link 
                href="/expert/marketplace?tab=showcase" 
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Store size={13} className="text-slate-400" />
                <span>Vitrin & İlan Panom</span>
              </Link>
              <Link 
                href="/expert/marketplace?tab=badges" 
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Award size={13} className="text-slate-400" />
                <span>Rozetlerim & Puanım</span>
              </Link>
              <Link 
                href="/expert/marketplace?tab=leaderboard" 
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy size={13} className="text-slate-400" />
                <span>Liderlik Tablosu</span>
              </Link>
            </div>

            {/* İletişim & Randevu */}
            <div className="border-l-2 border-slate-100 pl-2.5 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">İletişim & Randevu</p>
              <Link href="/expert/iletisim?tab=appointments" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                <Calendar size={13} className="text-slate-400" />
                <span>Randevularım</span>
              </Link>
              <Link href="/expert/iletisim?tab=messages" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                <MessageSquare size={13} className="text-slate-400" />
                <span>Mesajlar (AI & Danışan)</span>
              </Link>
              <Link href="/expert/iletisim?tab=support" className="flex items-center gap-2 text-xs text-slate-600 hover:text-[#EA580C]" onClick={() => setMobileMenuOpen(false)}>
                <Headphones size={13} className="text-slate-400" />
                <span>Canlı Destek</span>
              </Link>
            </div>

            {/* Profil & Çıkış */}
            <div className="border-l-2 border-slate-100 pl-2.5 space-y-1.5 pt-1 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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

      {/* Navbar sabit (fixed) hale getirildiği için altındaki sayfa içeriğinin arkada kalmaması adına gereken boşluk */}
      <div className="h-[72px] sm:h-[72px] w-full shrink-0" />
    </>
  );
}