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
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function Navbar({ userData: propUserData }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    role: "client",
    profilePhoto: ""
  });

  useEffect(() => {
    if (propUserData && propUserData.firstName) {
      setUserData({
        firstName: propUserData.firstName || "",
        lastName: propUserData.lastName || "",
        role: propUserData.role || "client",
        profilePhoto: propUserData.profile_photo || propUserData.profilePhoto || ""
      });
      return;
    }

    async function fetchUserData() {
      const cachedFirst = localStorage.getItem("first_name") || localStorage.getItem("firstName");
      const cachedLast = localStorage.getItem("last_name") || localStorage.getItem("lastName") || "";
      const cachedPhoto = localStorage.getItem("profile_photo") || localStorage.getItem("profilePhoto") || "";
      const token = localStorage.getItem("access_token");
      
      if (cachedFirst) {
        setUserData({
          firstName: cachedFirst,
          lastName: cachedLast,
          role: localStorage.getItem("role") || "client",
          profilePhoto: cachedPhoto
        });
      }

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: headers,
        });
        
        if (res.ok) {
          const data = await res.json();
          const userObj = data.user || data;

          const firstName = userObj.first_name || userObj.firstName || "";
          const lastName = userObj.last_name || userObj.lastName || "";
          const profilePhoto = userObj.profile_photo || userObj.profilePhoto || "";

          if (firstName) {
            setUserData({
              firstName: firstName,
              lastName: lastName,
              role: userObj.role || "client",
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
        }
      } catch (error) {
        console.error("Kullanıcı verisi çekilemedi:", error);
      }
    }

    fetchUserData();
  }, [propUserData]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error("Çıkış hatası:", err);
    }

    localStorage.clear();
    router.push("/");
  };

  const getInitials = () => {
    if (!userData.firstName) return "V";

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

  const isDashboardActive = pathname === "/dashboard";
  const isProgramsActive = pathname === "/dashboard/programs" || pathname.startsWith("/dashboard/programs/");
  const isMarketplaceActive = pathname === "/dashboard/marketplace" || pathname.startsWith("/dashboard/marketplace/");
  const isContactActive = pathname === "/dashboard/iletisim" || pathname.startsWith("/dashboard/iletisim/");

  const renderClientBadge = () => (
    <div className="flex items-center gap-1.5 ml-3 select-none">
      <span className="bg-[#C5A880] text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
        <Sparkles size={10} /> MEMBER
      </span>
      <div className="w-6 h-6 rounded-full bg-[#C5A880]/10 text-[#C5A880] flex items-center justify-center shadow-sm" title="Doğrulanmış Üye">
        <ShieldCheck size={13} />
      </div>
    </div>
  );

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-3 group">
              <img
                src="/icon.png"
                alt="Vitalis-OS Logo"
                className="w-12 h-12 object-contain transition-transform duration-500 group-hover:rotate-12"
              />
              <div className="flex items-center font-black tracking-wider">
                <span className="text-slate-950">VITALIS</span>
                <span className="text-[#C5A880] font-light">-OS</span>
              </div>
            </Link>
            {renderClientBadge()}
          </div>

          <div className="hidden lg:flex space-x-8 items-center h-full">
            <Link
              href="/dashboard"
              className={`text-sm font-semibold h-full flex items-center transition-colors ${
                isDashboardActive
                  ? "text-[#C5A880] border-b-2 border-[#C5A880]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
            
            {/* PROGRAMLARIM (HUB) DROPDOWN */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('program')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/dashboard/programs"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isProgramsActive
                    ? "text-[#C5A880]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Programlarım (Hub)</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'program' && (
                <div className="absolute top-full left-0 pt-2 w-48 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link href="/dashboard/programs?tab=workout" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      Antrenmanlar
                    </Link>
                    <Link href="/dashboard/programs?tab=diet" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      Beslenme Planım (Diyet)
                    </Link>
                    <Link href="/dashboard/programs?tab=hub" className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                      Günlük Görevler
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* MARKETPLACE (KEŞFET) DROPDOWN */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('market')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/dashboard/marketplace"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isMarketplaceActive
                    ? "text-[#C5A880]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Marketplace (Keşfet)</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'market' && (
                <div className="absolute top-full left-0 pt-2 w-52 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link 
                      href="/dashboard/marketplace" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      Tüm Marketplace
                    </Link>
                    <Link 
                      href="/dashboard/marketplace?tab=trainer" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Antrenör Bul
                    </Link>
                    <Link 
                      href="/dashboard/marketplace?tab=dietitian" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Diyetisyen Bul
                    </Link>
                    <Link 
                      href="/dashboard/marketplace?tab=supplement" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Supplement & Ekipmanlar
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* İLETİŞİM & RANDEVU DROPDOWN */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('contact')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href="/dashboard/iletisim"
                className={`flex items-center gap-1 text-sm font-semibold transition-colors py-2 ${
                  isContactActive
                    ? "text-[#C5A880]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>İletişim & Randevu</span> <ChevronDown size={14} />
              </Link>
              {activeDropdown === 'contact' && (
                <div className="absolute top-full left-0 pt-2 w-52 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link 
                      href="/dashboard/iletisim?tab=appointments" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Randevularım
                    </Link>
                    <Link 
                      href="/dashboard/iletisim?tab=messages" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Mesajlar (AI & Danışman)
                    </Link>
                    <Link 
                      href="/dashboard/iletisim?tab=support" 
                      onClick={() => setActiveDropdown(null)}
                      className="block px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Canlı Destek
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <button className="p-2.5 bg-slate-50 rounded-full text-slate-500 hover:text-[#C5A880] relative transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#C5A880] border-2 border-white rounded-full animate-pulse"></span>
            </button>
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown('profile')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-3 border border-slate-200/60 rounded-full pl-2 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100 transition-all">
                <div className="w-8 h-8 rounded-full bg-[#C5A880] text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                  {userData.profilePhoto ? (
                    <img 
                      src={userData.profilePhoto} 
                      alt="Profil Fotoğrafı" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : ""}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {activeDropdown === 'profile' && (
                <div className="absolute top-full right-0 pt-2 w-56 z-50">
                  <div className="bg-white border border-slate-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"><Settings size={14} /> Profil Ayarları</Link>
                    <Link href="/profile?tab=subscriptions" className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50"><CreditCard size={14} /> Abonelik & Ödemeler</Link>
                    <hr className="my-1 border-slate-100" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left">
                      <LogOut size={14} /> Güvenli Çıkış
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center lg:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 px-6 pt-3 pb-6 space-y-4 shadow-inner w-full">
          <Link
            href="/dashboard"
            className={`block font-semibold text-sm ${isDashboardActive ? 'text-[#C5A880]' : 'text-slate-600'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Programlarım</p>
            <Link href="/dashboard/programs?tab=workout" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Antrenmanlar</Link>
            <Link href="/dashboard/programs?tab=diet" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Beslenme Planım</Link>
            <Link
              href="/dashboard/programs"
              className={`block text-xs font-semibold ${isProgramsActive ? 'text-[#C5A880]' : 'text-slate-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tüm Programlar (Hub)
            </Link>
          </div>
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketplace</p>
            <Link
              href="/dashboard/marketplace"
              className={`block text-xs font-semibold ${isMarketplaceActive && pathname === '/dashboard/marketplace' ? 'text-[#C5A880]' : 'text-slate-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Tüm Marketplace (Keşfet)
            </Link>
            <Link href="/dashboard/marketplace?tab=trainer" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Antrenör Bul</Link>
            <Link href="/dashboard/marketplace?tab=dietitian" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Diyetisyen Bul</Link>
            <Link href="/dashboard/marketplace?tab=supplement" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Supplement & Ekipmanlar</Link>
          </div>
          
          {/* MOBİL İLETİŞİM & RANDEVU MENÜSÜ */}
          <div className="border-l-2 border-slate-100 pl-3 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">İletişim & Randevu</p>
            <Link
              href="/dashboard/iletisim"
              className={`block text-xs font-semibold ${isContactActive && pathname === '/dashboard/iletisim' ? 'text-[#C5A880]' : 'text-slate-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              İletişim Merkezi Ana Sayfa
            </Link>
            <Link href="/dashboard/iletisim?tab=appointments" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Randevularım</Link>
            <Link href="/dashboard/iletisim?tab=messages" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Mesajlar (AI & Danışman)</Link>
            <Link href="/dashboard/iletisim?tab=support" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Canlı Destek</Link>
          </div>

          <div className="border-l-2 border-slate-100 pl-3 space-y-2 pt-1 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Profil ({userData.firstName ? `${userData.firstName} ${userData.lastName}`.trim() : ""})
            </p>
            <Link href="/profile" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Profil Ayarları</Link>
            <Link href="/profile?tab=subscriptions" className="block text-xs text-slate-600 hover:text-[#C5A880]" onClick={() => setMobileMenuOpen(false)}>Abonelik & Ödemeler</Link>
            <hr className="my-1 border-slate-100" />
            <button onClick={handleLogout} className="block text-xs text-red-600 font-medium text-left pt-1">
              Güvenli Çıkış
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}