"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // ⭐ Eğer kök dizindeysek (localhost:3000 / giriş ve rol ekranı) footer'ı GÖSTERME
  // Sadece /dashboard veya alt sayfalarında göster
  if (pathname === '/' || pathname === '') {
    return null;
  }

  return <Footer />;
}