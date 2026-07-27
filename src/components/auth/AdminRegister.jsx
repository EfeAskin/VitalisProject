"use client";
import React, { useState } from 'react';
import { Mail, Lock, Phone, ArrowLeft, Award, Upload, ChevronDown } from 'lucide-react';

export default function AdminRegister({ setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('dietitian'); // Veritabanı karşılığı: dietitian veya trainer
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Güvenli dosya doğrulama fonksiyonu (Sadece PDF ve Görsel formatları)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setErrorMsg("Güvenlik ihlali: Sadece .pdf, .jpg, .jpeg veya .png formatında belge yükleyebilirsiniz!");
      setCertificate(null);
      e.target.value = null; // Inputu temizle
      return;
    }

    setErrorMsg('');
    setCertificate(file);
  };

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
          role: role, 
          certificate_info: certificate ? certificate.name : null
        })
      });
      const data = await response.json();

      if (response.ok) {
        alert("Profesyonel kaydınız alındı! Belge incelemesi sonrası hesabınız onaylanacaktır. Giriş yapabilirsiniz.");
        setView('admin-login');
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
    <div className="bg-[#EAEAEA]/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[18px] font-black tracking-widest text-[#1c1c1c] uppercase">EXPERT REGISTRATION</h2>
        <button onClick={() => setView('admin-login')} className="text-slate-600 hover:text-[#A80000] transition-colors">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-100 text-red-700 text-xs font-bold p-3.5 rounded-2xl mb-4 text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-3">
        
        {/* Uzmanlık Alanı Seçimi (DDL + Aşağı Ok İkonu) */}
        <div className="relative">
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-white text-slate-800 text-xs font-bold px-6 py-3.5 rounded-full outline-none appearance-none shadow-inner border border-slate-200/50 cursor-pointer pr-12"
          >
            <option value="dietitian">Diyetisyen (Beslenme Uzmanı)</option>
            <option value="trainer">Antrenor / PT (Personal Trainer)</option>
          </select>
          <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none text-slate-500">
            <ChevronDown size={16} strokeWidth={2.5} />
          </div>
        </div>

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

        {/* e-Devlet Belge / Sertifika Yükleme Alanı (Güvenlik Kısıtlamalı) */}
        <div className="bg-white/80 border border-slate-200 p-3 rounded-2xl shadow-inner space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5 px-2">
            <Award size={13} className="text-[#A80000]" /> e-Devlet Belgesi (PDF, JPG, PNG)
          </label>
          <div className="relative flex items-center justify-between bg-white border border-dashed border-slate-300 rounded-xl px-4 py-2.5 hover:border-[#A80000] transition-colors cursor-pointer">
            <span className="text-xs font-bold text-slate-500 truncate max-w-[220px]">
              {certificate ? certificate.name : "Belge seçin (PDF / Görsel)..."}
            </span>
            <input 
              type="file" 
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload size={16} className="text-slate-400" />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-[#A80000] hover:bg-[#8d0000] text-white text-xs font-extrabold py-3.5 rounded-full tracking-widest uppercase transition-all shadow-lg mt-2 disabled:opacity-50"
        >
          {loading ? 'REGISTERING...' : 'REGISTER EXPERT'}
        </button>
      </form>
    </div>
  );
}