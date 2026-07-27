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
          router.push('/admin'); // Sen db'ye admin olarak kaydolunca buraya uçacaksın
        } else if (data.role === 'trainer' || data.role === 'dietitian') {
          router.push('/expert/dashboard'); // Diğer hocalar buraya gidecek
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
    <div className="bg-[#EAEAEA]/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[22px] font-black tracking-widest text-[#1c1c1c] uppercase">LOGIN</h2>
        <button type="button" onClick={() => setView('set-role')} className="text-slate-600 hover:text-[#A80000] transition-colors">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 text-xs font-bold p-3.5 rounded-2xl mb-4 text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input 
            type="email" 
            required
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-4 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Mail className="text-slate-400" size={16} />
          </div>
        </div>

        <div className="relative">
          <input 
            type={showPassword ? 'text' : 'password'} 
            required
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-4 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 inset-y-0 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex justify-between items-center px-2 text-[10px] font-bold text-slate-500 tracking-wide">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-700">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3 h-3 rounded text-[#A80000] focus:ring-0 border-slate-300 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <a href="#" className="hover:text-slate-700 underline">Forgot Password?</a>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#A80000] hover:bg-[#8d0000] text-white text-xs font-extrabold py-4 rounded-full tracking-widest uppercase transition-all shadow-lg mt-6 disabled:opacity-50"
        >
          {loading ? 'LOADING...' : 'ACCESS'}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-[10px] text-slate-500 font-bold tracking-wide">
          Don't have an account?{' '}
          <button type="button" onClick={() => setView('admin-register')} className="text-[#0052B4] hover:underline font-extrabold uppercase ml-1">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}