"use client";
import React, { useState } from 'react';
import { Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLogin({ setView, handleAccess }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await response.json();
      
      if (response.ok) {
        // Profesyonel panelinden sadece admin, dietitian ve trainer rolündekiler geçebilir
        if (data.role !== 'admin' && data.role !== 'dietitian' && data.role !== 'trainer') {
          setErrorMsg("Yetkisiz erişim. Sadece profesyoneller bu alandan girebilir.");
          return;
        }
        
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_id', data.user_id);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        
        // 🔀 Tamamen veritabanından dönen 'role' verisine dayalı dinamik yönlendirme
        if (data.role === 'admin') { 
          router.push('/admin');
        } else if (data.role === 'trainer' || data.role === 'dietitian') {
          router.push('/expert/dashboard');
        } else {
          router.push('/dashboard');
        }

      } else {
        setErrorMsg(data.detail || "Giriş bilgileri hatalı.");
      }
    } catch (err) {
      setErrorMsg("Sunucuyla bağlantı kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#16161C] border border-[#D4AF37]/30 rounded-[2.5rem] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl w-full max-w-md mx-auto relative overflow-hidden text-white">
      {/* Arka Plan Işıltı Efekti (Premium Görünüm) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-[18px] font-black tracking-widest text-white uppercase">UZMAN GİRİŞİ</h2>
        <button 
          type="button" 
          onClick={() => setView('set-role')} 
          className="text-white/50 hover:text-[#D4AF37] transition-colors p-2 rounded-xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold p-3.5 rounded-2xl mb-6 text-center shadow-[0_0_20px_rgba(244,63,94,0.15)] relative z-10">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        {/* Email Input */}
        <div className="relative">
          <input 
            type="email" 
            required
            placeholder="E-posta Adresi" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-4 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Mail className="text-[#D4AF37]" size={16} />
          </div>
        </div>

        {/* Password Input */}
        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'} 
            required
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#221F1C] text-white placeholder-white/30 text-xs font-bold px-6 py-4 rounded-2xl outline-none pr-12 shadow-inner border border-[#D4AF37]/20 focus:border-[#D4AF37] transition-all"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 inset-y-0 flex items-center text-[#D4AF37] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-2 text-[10px] font-bold text-white/50 tracking-wide mt-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#D4AF37] transition-colors">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#D4AF37]/30 bg-[#221F1C] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
            />
            <span>Beni Hatırla</span>
          </label>
          <a href="#" className="hover:text-[#D4AF37] transition-colors underline">Şifremi Unuttum?</a>
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-[#E5BF47] hover:to-amber-500 text-slate-950 text-xs font-black py-4 rounded-2xl tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] mt-6 disabled:opacity-50 border border-amber-400/40 active:scale-95"
        >
          {loading ? 'LÜTFEN BEKLEYİN...' : 'GİRİŞ YAP'}
        </button>
      </form>

      {/* Register Link */}
      <div className="text-center mt-8 relative z-10">
        <p className="text-[10px] text-white/50 font-bold tracking-wide">
          Hesabınız yok mu?{' '}
          <button 
            type="button" 
            onClick={() => setView('admin-register')} 
            className="text-[#D4AF37] hover:underline font-extrabold uppercase ml-1 transition-colors"
          >
            Kayıt Ol
          </button>
        </p>
      </div>
    </div>
  );
}