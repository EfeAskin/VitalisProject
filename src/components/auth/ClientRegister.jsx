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
    <div className="bg-[#EAEAEA]/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[18px] font-black tracking-widest text-[#1c1c1c] uppercase">REGISTRATION</h2>
        <button onClick={() => setView('client-login')} className="text-slate-600 hover:text-[#00A859] transition-colors">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 text-xs font-bold p-3.5 rounded-2xl mb-4 text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3.5">
        <div className="relative">
          <input 
            type="email" 
            required
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Mail className="text-slate-400" size={15} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="password" 
            required
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Lock className="text-slate-400" size={15} />
          </div>
        </div>

        <div className="relative">
          <input 
            type="password" 
            required
            placeholder="Confirm Password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Lock className="text-slate-400" size={15} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input 
            type="text" 
            required
            placeholder="First Name" 
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none shadow-inner border border-slate-200/50"
          />
          <input 
            type="text" 
            required
            placeholder="Last Name" 
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none shadow-inner border border-slate-200/50"
          />
        </div>

        <div className="relative">
          <input 
            type="tel" 
            required
            placeholder="Phone Number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs font-bold px-6 py-3.5 rounded-full outline-none pr-12 shadow-inner border border-slate-200/50"
          />
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none">
            <Phone className="text-slate-400" size={15} />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#00A859] hover:bg-[#00944f] text-white text-xs font-extrabold py-4 rounded-full tracking-widest uppercase transition-all shadow-lg mt-4 disabled:opacity-50"
        >
          {loading ? 'REGISTERING...' : 'REGISTER'}
        </button>
      </form>
    </div>
  );
}