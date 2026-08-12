"use client";

import React, { useState } from "react";
import { Send, Bot, User, Sparkles, CheckCheck, Search, ArrowLeft } from "lucide-react";

export default function MessagesTab() {
  const [activeChat, setActiveChat] = useState("ai");
  const [messageText, setMessageText] = useState("");
  // Mobilde Sohbet Listesi ve Mesajlaşma Ekranı Geçişi
  const [mobileChatOpen, setMobileChatOpen] = useState(true);
  
  const [chats, setChats] = useState({
    ai: {
      name: "Vitalis AI Asistan",
      role: "Yapay Zeka Antrenman & Beslenme Koçu",
      online: true,
      messages: [
        { id: 1, sender: "ai", text: "Merhaba Kamil Efe! Bugün antrenmandan sonra su tüketimin ve protein dengen harika gidiyor. Nasıl yardımcı olabilirim?", time: "23:10" },
        { id: 2, sender: "user", text: "Akşam öğününe kaç gram lor peyniri eklemeliyim?", time: "23:12" },
        { id: 3, sender: "ai", text: "Günlük kalori hedefine (2450 kcal) göre akşam öğününe 150g lor peyniri ekleyerek 28g kaliteli protein alabilirsin.", time: "23:13" }
      ]
    },
    melis: {
      name: "Dr. Melis Kaya",
      role: "Baş Diyetisyen",
      online: true,
      messages: [
        { id: 1, sender: "expert", text: "Kamil Bey, yeni diyet listesindeki ara öğünler size nasıl geliyor?", time: "Dün" },
        { id: 2, sender: "user", text: "Gayet iyi hocam, özellikle yeşil elma ve badem kombini çok tok tutuyor.", time: "Dün" }
      ]
    }
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "user",
      text: messageText,
      time: "Şimdi"
    };

    setChats(prev => ({
      ...prev,
      [activeChat]: {
        ...prev[activeChat],
        messages: [...prev[activeChat].messages, newMsg]
      }
    }));

    setMessageText("");

    // Otomatik AI / Uzman Simülasyon Yanıtı
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        sender: activeChat === "ai" ? "ai" : "expert",
        text: activeChat === "ai" ? "Harika bir yaklaşım! Disiplini elden bırakmayalım." : "Not aldım Kamil Bey, sonraki görüşmemizde detaylıca inceleriz.",
        time: "Şimdi"
      };
      setChats(prev => ({
        ...prev,
        [activeChat]: {
          ...prev[activeChat],
          messages: [...prev[activeChat].messages, replyMsg]
        }
      }));
    }, 1000);
  };

  const currentChatData = chats[activeChat];

  return (
    /* 
      Dış Kapsayıcı Kart (Outer Box):
      - Lacivertten ayrılmış Derin Obsidyen-Zümrüt (`bg-[#0B1310]`).
      - Mobilde dinamik ekran yüksekliği (`h-[calc(100vh-140px)] lg:h-[620px]`).
      - Projeksiyon ve mobil ekranlarda yüksek kontrastlı görünürlük.
    */
    <div className="bg-[#0B1310]/95 backdrop-blur-2xl border-2 border-emerald-500/40 hover:border-emerald-400/70 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-130px)] min-h-[550px] lg:h-[620px] animate-fadeIn transition-all duration-300 relative">
      
      {/* SOL SOHBET LİSTESİ */}
      <div className={`lg:col-span-4 border-r-2 border-emerald-950/80 bg-[#060B09]/90 p-3 sm:p-4 flex-col justify-between h-full ${
        mobileChatOpen ? "hidden lg:flex" : "flex"
      }`}>
        <div className="space-y-3 sm:space-y-4 flex-grow overflow-hidden flex flex-col">
          
          {/* Arama Kutusu */}
          <div className="relative shrink-0">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder="Mesajlarda ara..."
              className="w-full bg-[#0E1A16] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-sm sm:text-xs text-white font-bold placeholder-emerald-600/70 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Chat Kişi/AI Listesi */}
          <div className="space-y-2.5 flex-grow overflow-y-auto pr-1 custom-scrollbar">
            
            {/* AI Asistan Chat Seçimi */}
            <div 
              onClick={() => {
                setActiveChat("ai");
                setMobileChatOpen(true);
              }}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 shadow-sm touch-manipulation ${
                activeChat === "ai" 
                  ? "bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-[1.01]" 
                  : "bg-[#0E1A16]/60 border-emerald-950 hover:border-emerald-500/50 hover:bg-[#0E1A16] text-emerald-100/70"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-300 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  <Bot className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060B09] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white truncate drop-shadow-md">Vitalis AI Asistan</h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-400/40 shrink-0">7/24</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">Yapay zeka koçun aktif</p>
              </div>
            </div>

            {/* Melis Kaya Chat Seçimi */}
            <div 
              onClick={() => {
                setActiveChat("melis");
                setMobileChatOpen(true);
              }}
              className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border-2 shadow-sm touch-manipulation ${
                activeChat === "melis" 
                  ? "bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-[1.01]" 
                  : "bg-[#0E1A16]/60 border-emerald-950 hover:border-amber-500/50 hover:bg-[#0E1A16] text-emerald-100/70"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  MK
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#060B09] rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white truncate drop-shadow-md">Dr. Melis Kaya</h4>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-400/40 shrink-0">Diyetisyen</span>
                </div>
                <p className="text-[10px] font-bold text-emerald-200/60 truncate mt-0.5">Kombin çok tok tutuyor...</p>
              </div>
            </div>

          </div>
        </div>

        {/* Alt Bilgilendirme Rozeti */}
        <div className="pt-3 border-t border-emerald-950/80 text-[10px] font-black text-emerald-400/80 uppercase tracking-wider flex items-center justify-between shrink-0">
          <span>Güvenli İletişim</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* SAĞ AKTİF SOHBET PENCERESİ */}
      <div className={`lg:col-span-8 flex-col justify-between bg-[#0D1613]/70 h-full ${
        !mobileChatOpen ? "hidden lg:flex" : "flex"
      }`}>
        
        {/* Sohbet Üst Başlık */}
        <div className="p-3 sm:p-4 border-b-2 border-emerald-950/80 flex items-center justify-between bg-[#0B1310]/95 backdrop-blur-md shadow-md shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Mobilde Listeye Geri Dönüş Butonu */}
            <button
              type="button"
              onClick={() => setMobileChatOpen(false)}
              className="lg:hidden p-2 -ml-1 text-emerald-400 hover:text-white rounded-xl bg-[#0E1A16] border border-emerald-500/30 flex items-center justify-center shrink-0 active:scale-95 transition-all"
              aria-label="Sohbet Listesine Dön"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-400 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
              {activeChat === "ai" ? <Bot className="w-5 h-5 stroke-[2.5]" /> : "MK"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs sm:text-sm font-black text-white drop-shadow-md truncate">{currentChatData.name}</h4>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-300/70 truncate">{currentChatData.role}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-400/60 text-emerald-300 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">
            ● Çevrim İçi
          </span>
        </div>

        {/* Mesaj Akışı */}
        <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-grow bg-[#070D0B]/50 custom-scrollbar">
          {currentChatData.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] sm:max-w-md p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-xs space-y-1.5 shadow-lg ${
                msg.sender === "user" 
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-br-xs border border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.3)]" 
                  : "bg-[#14221D] border-2 border-emerald-500/30 text-emerald-50 font-extrabold rounded-bl-xs shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
              }`}>
                <p className="leading-relaxed drop-shadow-xs text-xs sm:text-xs">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 text-[9px] font-black ${msg.sender === "user" ? "text-slate-950" : "text-emerald-400/70"}`}>
                  <span>{msg.time}</span>
                  {msg.sender === "user" && <CheckCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mesaj Gönderme Kutusu */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t-2 border-emerald-950/80 bg-[#0B1310]/95 backdrop-blur-md flex items-center gap-2 sm:gap-3 shrink-0">
          <input 
            type="text"
            placeholder="Mesajınızı yazın..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-[#060B09] border-2 border-emerald-500/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-xl sm:rounded-2xl px-3.5 py-3 text-sm sm:text-xs text-white font-bold placeholder-emerald-600/60 outline-none transition-all shadow-inner"
          />
          <button 
            type="submit"
            className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] shrink-0 border border-emerald-300 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

      </div>

    </div>
  );
}