import React, { useState } from 'react';
import { Search, Filter, PlayCircle, PlusCircle, Activity } from 'lucide-react';

export default function ExerciseDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');

  // FastAPI'den çekilecek varsayılan DB verisi modeli
  const database = [
    { id: "db-1", name: "Barbell Bench Press", muscle: "Göğüs", equipment: "Halter", difficulty: "Orta", videoUrl: "#" },
    { id: "db-2", name: "Incline Dumbbell Press", muscle: "Göğüs", equipment: "Dumbbell", difficulty: "İleri", videoUrl: "#" },
    { id: "db-3", name: "Lat Pulldown", muscle: "Sırt / Kanat", equipment: "Makine", difficulty: "Başlangıç", videoUrl: "#" },
    { id: "db-4", name: "Barbell Squat", muscle: "Quadriceps", equipment: "Halter", difficulty: "İleri", videoUrl: "#" },
    { id: "db-5", name: "Dumbbell Biceps Curl", muscle: "Biceps", equipment: "Dumbbell", difficulty: "Başlangıç", videoUrl: "#" },
    { id: "db-6", name: "Triceps Rope Pushdown", muscle: "Triceps", equipment: "Kablo", difficulty: "Orta", videoUrl: "#" },
  ];

  const filteredData = database.filter(ex => 
    (filterMuscle === 'all' || ex.muscle.includes(filterMuscle)) &&
    ex.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Arama ve Filtreleme Çubuğu */}
      <div className="flex flex-col md:flex-row gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Egzersiz adı veya kas grubu ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#182134] text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none transition-all placeholder:text-slate-500 font-medium"
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EA580C]" size={20} />
          <select 
            value={filterMuscle}
            onChange={(e) => setFilterMuscle(e.target.value)}
            className="w-full bg-[#182134] text-white pl-12 pr-4 py-4 rounded-xl border border-slate-700 focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] outline-none appearance-none font-bold cursor-pointer"
          >
            <option value="all">Tüm Kas Grupları</option>
            <option value="Göğüs">Göğüs</option>
            <option value="Sırt">Sırt</option>
            <option value="Quadriceps">Bacak (Ön)</option>
            <option value="Biceps">Biceps</option>
            <option value="Triceps">Triceps</option>
          </select>
        </div>
      </div>

      {/* Grid Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredData.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <Activity className="mx-auto text-slate-600 mb-3" size={40} />
            <p className="text-slate-400 font-medium">Aradığınız kriterlere uygun egzersiz bulunamadı.</p>
          </div>
        ) : (
          filteredData.map((ex) => (
            <div key={ex.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-[#EA580C]/50 hover:shadow-[0_0_20px_rgba(234,88,12,0.1)] transition-all group flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-orange-500/10 text-[#EA580C] border border-orange-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {ex.muscle}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                    {ex.equipment}
                  </span>
                </div>
                
                <h4 className="font-extrabold text-white text-lg mb-1">{ex.name}</h4>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                  Zorluk: <span className={ex.difficulty === 'İleri' ? 'text-red-400' : ex.difficulty === 'Orta' ? 'text-yellow-400' : 'text-green-400'}>{ex.difficulty}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
                  <PlayCircle size={18} className="text-[#EA580C]" /> Form İzle
                </button>
                <button className="text-slate-500 hover:text-[#EA580C] bg-slate-800 hover:bg-orange-500/10 p-2 rounded-lg transition-all">
                  <PlusCircle size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}