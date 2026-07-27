"use state";
"use client";

import React, { useState } from "react";
import { Send, Bot, User, Sparkles, CheckCheck, Search } from "lucide-react";

export default function MessagesTab() {
  const [activeChat, setActiveChat] = useState("ai");
  const [messageText, setMessageText] = useState("");
  
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] animate-fadeIn">
      
      {/* SOL SOHBET LİSTESİ */}
      <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input 
              type="text" 
              placeholder="Mesajlarda ara..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2 flex-grow overflow-y-auto">
          
          {/* AI Asistan Chat Seçimi */}
          <div 
            onClick={() => setActiveChat("ai")}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
              activeChat === "ai" 
                ? "bg-blue-600/10 border-blue-500/40 text-white" 
                : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 text-slate-300"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black truncate">Vitalis AI Asistan</h4>
                <span className="text-[9px] text-blue-400 font-bold">7/24</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Yapay zeka koçun aktif</p>
            </div>
          </div>

          {/* Melis Kaya Chat Seçimi */}
          <div 
            onClick={() => setActiveChat("melis")}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${
              activeChat === "melis" 
                ? "bg-emerald-600/10 border-emerald-500/40 text-white" 
                : "bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 text-slate-300"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                MK
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            </div>
            <div className="flex-grow overflow-hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black truncate">Dr. Melis Kaya</h4>
                <span className="text-[9px] text-emerald-400 font-bold">Diyetisyen</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Kombin çok tok tutuyor...</p>
            </div>
          </div>

        </div>
      </div>

      {/* SAĞ AKTİF SOHBET PENCERESİ */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/40">
        
        {/* Sohbet Üst Başlık */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
              {activeChat === "ai" ? <Bot className="w-4 h-4" /> : "MK"}
            </div>
            <div>
              <h4 className="text-xs font-black text-white">{currentChatData.name}</h4>
              <p className="text-[10px] text-slate-400">{currentChatData.role}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
            ● Çevrim İçi
          </span>
        </div>

        {/* Mesaj Akışı */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[380px] flex-grow">
          {currentChatData.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-md p-4 rounded-3xl text-xs space-y-1 ${
                msg.sender === "user" 
                  ? "bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/20" 
                  : "bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-sm"
              }`}>
                <p className="leading-relaxed font-medium">{msg.text}</p>
                <div className={`flex items-center justify-end gap-1 text-[9px] ${msg.sender === "user" ? "text-blue-200" : "text-slate-500"}`}>
                  <span>{msg.time}</span>
                  {msg.sender === "user" && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mesaj Gönderme Kutusu */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <input 
            type="text"
            placeholder="Mesajınızı yazın..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          <button 
            type="submit"
            className="w-11 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/30 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}