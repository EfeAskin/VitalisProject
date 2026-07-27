"use client";
import React, { useState } from 'react';
import { Bell, User, Menu, X, ChevronDown, Activity, Compass, Calendar, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Sol Bölüm: Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <span className="font-black text-2xl tracking-wider text-gray-900">
                VITALIS<span className="text-emerald-500">-OS</span>
              </span>
            </div>
            
            {/* Orta Bölüm: Masaüstü Navigasyon */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <a href="#" className="border-emerald-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </a>
              <div className="relative group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer gap-1">
                <span>Programlarım</span>
                <ChevronDown size={14} />
                {/* Dropdown Örneği */}
                <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg rounded-xl p-2 border border-gray-100 min-w-[160px] mt-1">
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-xs">Antrenman Planım</a>
                  <a href="#" className="block px-4 py-2 hover:bg-gray-50 rounded-lg text-xs">Beslenme Planım</a>
                </div>
              </div>
              <div className="relative group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer gap-1">
                <span>Marketplace</span>
                <ChevronDown size={14} />
              </div>
              <a href="#" className="text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                Randevularım
              </a>
            </div>
          </div>

          {/* Sağ Bölüm: Profil & Bildirim */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-emerald-500 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 border-l pl-4 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                KE
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">Kamil Efe</span>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>

          {/* Mobil Menü Butonu */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Navigasyon Menüsü */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1">
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium bg-emerald-50 text-emerald-700">Dashboard</a>
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600">Programlarım</a>
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600">Marketplace</a>
          <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600">Randevularım</a>
        </div>
      )}
    </nav>
  );
}
