"use client";
import React, { useState } from 'react';
import { Mail, Lock, Phone, ArrowLeft } from 'lucide-react';

export default function ClientRegister({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName, 
          phone, 
          role: 'client' 
        })
      });
      const data = await response.json();

      if (response.ok) {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
        setView('client-login');
      } else {
        setErrorMsg(data.detail || "Kayıt işlemi başarısız.");
      }
    } catch (err) {
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16161C] border border-[#D4AF37]/30 rounded-[2.5rem] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl w-full max-w-md mx-auto relative overflow-hidden text-white">
      {/* Arka Plan Işıltı Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-[18px] font-black tracking-widest text-white uppercase">KAYIT OL</h2>
        <button onClick={() => setView('client-login')} className="text-white/50 hover:text-[#D4AF37] transition-colors p-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold p-3.5 rounded-2xl mb-6 text-center shadow-[0_0_20px_rgba(244,63,94,0.15)] relative z-10">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5 relative z-10">
        <div className="relative">
          <input 
            type="email" 
            required
            placeholder="E-posta Adresi" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Mail className="text-[#D4AF37]" size={15} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="password" 
            required
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Lock className="text-[#D4AF37]" size={15} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="password" 
            required
            placeholder="Şifre Tekrar" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Lock className="text-[#D4AF37]" size={15} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            required
            placeholder="Ad" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <input 
            type="text" 
            required
            placeholder="Soyad" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
        </div>

        <div className="relative">
          <input 
            type="tel" 
            required
            placeholder="Telefon Numarası" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-3.5 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Phone className="text-[#D4AF37]" size={15} />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-[#E5BF47] hover:to-amber-500 text-slate-950 text-xs font-black py-4 rounded-2xl tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-4 disabled:opacity-50 border border-amber-400/40 active:scale-95"
        >
          {loading ? 'YÜKLENİYOR...' : 'KAYIT OL'}
        </button>
      </form>
    </div>
  );
}