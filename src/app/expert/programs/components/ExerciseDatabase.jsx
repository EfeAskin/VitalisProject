"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  PlayCircle, 
  PlusCircle, 
  Activity, 
  Loader2, 
  X, 
  Video, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  Check, 
  AlertTriangle,
  FolderPlus,
  CheckCircle2
} from 'lucide-react';

export default function ExerciseDatabase({ 
  onAddToTemplate, 
  templates = [], 
  onEditExercise, 
  onDeleteExercise 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  
  // Backend Egzersiz DB State'leri
  const [database, setDatabase] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Arka Plandan Çekilen Canlı Şablonlar State'i
  const [fetchedTemplates, setFetchedTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Video İzleme Modalı State'i
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Şablon Seçim Dropdown (DDL) State'i
  const [openTemplateDropdownId, setOpenTemplateDropdownId] = useState(null);
  const [addingToTemplateId, setAddingToTemplateId] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Düzenleme Modalı State'leri
  const [editingExercise, setEditingExercise] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    muscle: '',
    equipment: '',
    difficulty: 'Orta',
    videoUrl: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Silme Onay Modalı State'leri
  const [deletingExercise, setDeletingExercise] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. FastAPI'den Egzersiz Verilerini Çekme
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetch('/api/expert/exercises');
        if (!response.ok) {
          throw new Error('Egzersiz veritabanı yüklenirken bir sunucu hatası oluştu.');
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setDatabase(data);
        } else if (data && Array.isArray(data.exercises)) {
          setDatabase(data.exercises);
        } else if (data && Array.isArray(data.data)) {
          setDatabase(data.data);
        } else {
          setDatabase([]);
          setErrorMessage('Veritabanından beklenmeyen veri formatı alındı.');
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setDatabase([]);
        setErrorMessage(err.message || "Bağlantı hatası.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // 2. Veritabanından Canlı Şablonları Çekme (Props boşsa otomatik devreye girer)
  useEffect(() => {
    const fetchTemplatesFromDB = async () => {
      try {
        setIsLoadingTemplates(true);
        const response = await fetch('/api/expert/workout-templates');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setFetchedTemplates(data);
          } else if (data && Array.isArray(data.templates)) {
            setFetchedTemplates(data.templates);
          } else if (data && Array.isArray(data.data)) {
            setFetchedTemplates(data.data);
          }
        }
      } catch (err) {
        console.error("Canlı şablonlar çekilirken hata oluştu:", err);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplatesFromDB();
  }, []);

  // Dropdown dışına tıklandığında menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.template-ddl-container')) {
        setOpenTemplateDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Kullanılacak Şablon Listesi: Props varsa onu kullan, yoksa DB'den canlı çekileni kullan.
  // Kesinlikle statik mockup kullanmıyoruz.
  const availableTemplates = (templates && templates.length > 0) ? templates : fetchedTemplates;

  // YouTube / Vimeo Video URL Dönüştürücüsü (Tam ve Kesin Çözüm)
  const getEmbedUrl = (url) => {
    if (!url || typeof url !== 'string' || url === '#' || url.trim() === '') return null;
    
    const cleanUrl = url.trim();

    // YouTube Match (watch, shorts, embed, youtu.be)
    const ytMatch = cleanUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
    }

    // Vimeo Match
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return cleanUrl;
  };

  // Egzersizi Seçilen Canlı Şablona Ekleme ve DB Güncelleme İşlevi
  const handleSelectTemplateForExercise = async (exercise, template) => {
    const templateId = template.id || template._id;
    setAddingToTemplateId(templateId);

    // 1. Dış Callback Varsa Tetikle
    if (onAddToTemplate) {
      onAddToTemplate(exercise, template);
    }

    // 2. Arka Planda Canlı Veritabanına Yazma (Şablonun Sonuna Ekleme)
    try {
      const currentExercises = Array.isArray(template.exercises) ? template.exercises : [];
      
      const newExerciseObj = {
        exercise_id: exercise.id || exercise._id,
        name: exercise.name,
        target_muscle: exercise.muscle || (Array.isArray(exercise.target_muscles) ? exercise.target_muscles.join(', ') : ''),
        equipment: exercise.equipment || 'Ekipmansız',
        sets: 3,
        reps: 10,
        rest_seconds: 60,
        order_index: currentExercises.length
      };

      const updatedExercisesList = [...currentExercises, newExerciseObj];

      const response = await fetch(`/api/expert/workout-templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          title: template.title || template.name,
          name: template.name || template.title,
          exercises: updatedExercisesList
        })
      });

      if (!response.ok) {
        // Alternatif sub-route kaydı
        await fetch(`/api/expert/workout-templates/${templateId}/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExerciseObj)
        });
      }

      setSuccessToast(`"${exercise.name}", "${template.title || template.name}" şablonunun sonuna eklendi.`);
      setTimeout(() => setSuccessToast(''), 4000);

    } catch (err) {
      console.error("Şablon veritabanı senkronizasyon hatası:", err);
    } finally {
      setAddingToTemplateId(null);
      setOpenTemplateDropdownId(null);
    }
  };

  // Düzenleme Modalı Başlatma
  const handleOpenEditModal = (ex) => {
    const exId = ex.id || ex._id;
    setEditingExercise(ex);
    setEditFormData({
      id: exId,
      name: ex.name || '',
      muscle: ex.muscle || (Array.isArray(ex.target_muscles) ? ex.target_muscles.join(', ') : ''),
      equipment: ex.equipment || 'Ekipmansız',
      difficulty: ex.difficulty || 'Orta',
      videoUrl: ex.videoUrl || ex.video_url || ex.mediaLink || ''
    });
  };

  // Düzenleme Kaydetme
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return;

    setIsSavingEdit(true);
    try {
      const targetId = editFormData.id;
      const response = await fetch(`/api/expert/exercises/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const updatedObj = {
        ...editingExercise,
        name: editFormData.name,
        muscle: editFormData.muscle,
        target_muscles: editFormData.muscle.split(',').map(m => m.trim()),
        equipment: editFormData.equipment,
        difficulty: editFormData.difficulty,
        videoUrl: editFormData.videoUrl,
        video_url: editFormData.videoUrl
      };

      setDatabase(prev => prev.map(item => (item.id === targetId || item._id === targetId) ? updatedObj : item));

      if (onEditExercise) {
        onEditExercise(updatedObj);
      }
      
      setEditingExercise(null);
    } catch (err) {
      console.error("Güncelleme Hatası:", err);
      const updatedObj = {
        ...editingExercise,
        name: editFormData.name,
        muscle: editFormData.muscle,
        target_muscles: editFormData.muscle.split(',').map(m => m.trim()),
        equipment: editFormData.equipment,
        difficulty: editFormData.difficulty,
        videoUrl: editFormData.videoUrl,
        video_url: editFormData.videoUrl
      };
      setDatabase(prev => prev.map(item => (item.id === editFormData.id || item._id === editFormData.id) ? updatedObj : item));
      if (onEditExercise) onEditExercise(updatedObj);
      setEditingExercise(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Silme Onayı ve İşlemi
  const handleConfirmDelete = async () => {
    if (!deletingExercise) return;
    const targetId = deletingExercise.id || deletingExercise._id;

    setIsDeleting(true);
    try {
      await fetch(`/api/expert/exercises/${targetId}`, {
        method: 'DELETE',
      });

      setDatabase(prev => prev.filter(item => item.id !== targetId && item._id !== targetId));

      if (onDeleteExercise) {
        onDeleteExercise(targetId);
      }
    } catch (err) {
      console.error("Silme Hatası:", err);
      setDatabase(prev => prev.filter(item => item.id !== targetId && item._id !== targetId));
      if (onDeleteExercise) onDeleteExercise(targetId);
    } finally {
      setIsDeleting(false);
      setDeletingExercise(null);
    }
  };

  // Türkçe / İngilizce Kas Grubu Eşleştirme Sözlüğü
  const muscleKeywordsMap = {
    'göğüs': ['göğüs', 'chest'],
    'sırt': ['sırt', 'back', 'lats', 'traps'],
    'quadriceps': ['quadriceps', 'quads', 'bacak', 'leg'],
    'hamstring': ['hamstring', 'bacak', 'leg'],
    'omuz': ['omuz', 'shoulder', 'deltoid'],
    'biceps': ['biceps', 'arm_biceps', 'arm'],
    'triceps': ['triceps', 'arm_triceps', 'arm'],
    'karın': ['karın', 'abs', 'core']
  };

  // Filtreleme Mantığı
  const filteredData = Array.isArray(database)
    ? database.filter(ex => {
        if (!ex) return false;
        
        const muscleVal = (ex.muscle || ex.target_muscle || ex.targetMuscle || '').toString().toLowerCase();
        const targetList = Array.isArray(ex.target_muscles) 
          ? ex.target_muscles.map(m => String(m).toLowerCase()) 
          : (Array.isArray(ex.targetMuscles) ? ex.targetMuscles.map(m => String(m).toLowerCase()) : []);
        
        const filterLower = filterMuscle.toLowerCase();
        let muscleMatch = filterMuscle === 'all';

        if (!muscleMatch) {
          const validKeywords = muscleKeywordsMap[filterLower] || [filterLower];
          muscleMatch = validKeywords.some(kw => 
            muscleVal.includes(kw) || targetList.some(m => m.includes(kw))
          );
        }

        const searchLower = searchTerm.toLowerCase();
        const nameMatch = ex.name && ex.name.toLowerCase().includes(searchLower);
        const muscleSearchMatch = muscleVal.includes(searchLower) || targetList.some(m => m.includes(searchLower));
        const equipmentSearchMatch = ex.equipment && ex.equipment.toLowerCase().includes(searchLower);

        return muscleMatch && (nameMatch || muscleSearchMatch || equipmentSearchMatch);
      })
    : [];

  const embedUrl = getEmbedUrl(selectedVideo);
  const isEmbedIframe = embedUrl && (embedUrl.includes("youtube.com/embed/") || embedUrl.includes("vimeo.com/video/"));

  return (
    <div className="space-y-6 relative">
      {/* Başarı Bildirimi (Toast) */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400 font-bold text-xs animate-in slide-in-from-top-3">
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast('')} className="ml-2 hover:opacity-80">&times;</button>
        </div>
      )}

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
            <option value="Hamstring">Bacak (Arka)</option>
            <option value="Omuz">Omuz</option>
            <option value="Biceps">Biceps</option>
            <option value="Triceps">Triceps</option>
            <option value="Karın">Karın / Abs</option>
          </select>
        </div>
      </div>

      {/* Hata Bildirim Alanı */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="hover:text-white font-bold">&times;</button>
        </div>
      )}

      {/* Grid Listesi */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
          <Loader2 className="animate-spin text-[#EA580C]" size={40} />
          <p className="text-xs font-bold tracking-wider uppercase">Veritabanından Egzersizler Yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Activity className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-slate-400 font-medium">Aradığınız kriterlere uygun egzersiz bulunamadı.</p>
            </div>
          ) : (
            filteredData.map((ex) => {
              const exId = ex.id || ex._id || ex.name;
              const isDdlOpen = openTemplateDropdownId === exId;

              return (
                <div key={exId} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-[#EA580C]/50 hover:shadow-[0_0_20px_rgba(234,88,12,0.1)] transition-all group flex flex-col justify-between relative">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black bg-orange-500/10 text-[#EA580C] border border-orange-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider max-w-[180px] truncate">
                        {ex.muscle || (Array.isArray(ex.target_muscles) ? ex.target_muscles.join(', ') : 'Genel')}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
                        {ex.equipment || 'Ekipmansız'}
                      </span>
                    </div>
                    
                    <h4 className="font-extrabold text-white text-lg mb-1">{ex.name}</h4>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                      Zorluk: <span className={ex.difficulty === 'İleri' || ex.difficulty === 'İleri Seviye' ? 'text-red-400' : ex.difficulty === 'Orta' || ex.difficulty === 'Orta Seviye' ? 'text-yellow-400' : 'text-green-400'}>{ex.difficulty || 'Orta'}</span>
                    </div>
                  </div>

                  {/* Alt İşlem Butonları */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    {/* Form İzle Butonu */}
                    <button 
                      onClick={() => setSelectedVideo(ex.videoUrl || ex.video_url || ex.mediaLink || "#")}
                      className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <PlayCircle size={18} className="text-[#EA580C]" /> Form İzle
                    </button>

                    {/* Sağ Taraf İşlem Buton Grubu */}
                    <div className="flex items-center gap-1.5">
                      {/* DDL: Şablona Ekle Butonu */}
                      <div className="relative template-ddl-container">
                        <button 
                          onClick={() => setOpenTemplateDropdownId(isDdlOpen ? null : exId)}
                          className={`flex items-center gap-1 text-slate-300 hover:text-[#EA580C] p-2 rounded-lg transition-all ${isDdlOpen ? 'bg-[#EA580C]/20 text-[#EA580C] border border-[#EA580C]/40' : 'bg-slate-800 hover:bg-orange-500/10'}`}
                          title="Şablona Ekle"
                        >
                          <PlusCircle size={18} />
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isDdlOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Açılır Canlı Şablon Menüsü (DDL) */}
                        {isDdlOpen && (
                          <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#182134] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-bottom-2">
                            <div className="text-[11px] font-bold text-slate-400 px-3 py-2 border-b border-slate-700/60 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <FolderPlus size={14} className="text-[#EA580C]" />
                                Canlı Şablon Seçin:
                              </span>
                              {isLoadingTemplates && <Loader2 size={12} className="animate-spin text-[#EA580C]" />}
                            </div>
                            <div className="max-h-48 overflow-y-auto mt-1 space-y-1">
                              {availableTemplates.length === 0 ? (
                                <div className="p-3 text-[11px] text-slate-400 text-center font-medium">
                                  Henüz veritabanında oluşturulmuş antrenman şablonu bulunamadı.
                                </div>
                              ) : (
                                availableTemplates.map((tpl) => {
                                  const tplId = tpl.id || tpl._id;
                                  const isAdding = addingToTemplateId === tplId;

                                  return (
                                    <button
                                      key={tplId || tpl.name || tpl.title}
                                      disabled={isAdding}
                                      onClick={() => handleSelectTemplateForExercise(ex, tpl)}
                                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#EA580C]/20 hover:border-[#EA580C]/30 border border-transparent rounded-lg transition-all flex items-center justify-between group/item disabled:opacity-50"
                                    >
                                      <span className="truncate">{tpl.title || tpl.name}</span>
                                      {isAdding ? (
                                        <Loader2 size={14} className="animate-spin text-[#EA580C]" />
                                      ) : (
                                        <Check size={14} className="opacity-0 group-hover/item:opacity-100 text-[#EA580C] transition-opacity" />
                                      )}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Düzenle Butonu */}
                      <button 
                        onClick={() => handleOpenEditModal(ex)}
                        className="text-slate-400 hover:text-cyan-400 bg-slate-800 hover:bg-cyan-500/10 p-2 rounded-lg transition-all"
                        title="Egzersizi Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Sil Butonu */}
                      <button 
                        onClick={() => setDeletingExercise(ex)}
                        className="text-slate-400 hover:text-rose-500 bg-slate-800 hover:bg-rose-500/10 p-2 rounded-lg transition-all"
                        title="Egzersizi Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Video İzleme Modalı (YouTube / Vimeo Embed Destekli) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#11142D] border border-slate-700 w-full max-w-3xl rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Video size={16} className="text-[#EA580C]" /> Egzersiz Form Videosu
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl flex items-center justify-center overflow-hidden border border-slate-800 shadow-inner relative">
              {embedUrl ? (
                isEmbedIframe ? (
                  <iframe 
                    src={embedUrl} 
                    title="Egzersiz Form Videosu" 
                    className="w-full h-full border-0 rounded-2xl" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={embedUrl} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain rounded-2xl"
                  />
                )
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs font-semibold">
                  Bu egzersiz için henüz geçerli bir video bağlantısı eklenmemiş.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Egzersiz Düzenleme Modalı */}
      {editingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 size={18} className="text-[#EA580C]" /> Egzersizi Düzenle
              </h3>
              <button 
                onClick={() => setEditingExercise(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Egzersiz Adı</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-[#182134] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-[#EA580C] outline-none text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Kas Grubu</label>
                  <input 
                    type="text" 
                    value={editFormData.muscle}
                    onChange={(e) => setEditFormData({ ...editFormData, muscle: e.target.value })}
                    placeholder="Göğüs, Triceps vb."
                    className="w-full bg-[#182134] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-[#EA580C] outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Ekipman</label>
                  <input 
                    type="text" 
                    value={editFormData.equipment}
                    onChange={(e) => setEditFormData({ ...editFormData, equipment: e.target.value })}
                    placeholder="Dumbbell, Barbell vb."
                    className="w-full bg-[#182134] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-[#EA580C] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Zorluk Seviyesi</label>
                  <select
                    value={editFormData.difficulty}
                    onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
                    className="w-full bg-[#182134] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-[#EA580C] outline-none text-sm font-medium"
                  >
                    <option value="Başlangıç">Başlangıç</option>
                    <option value="Orta">Orta</option>
                    <option value="İleri Seviye">İleri Seviye</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Video Bağlantısı (URL)</label>
                  <input 
                    type="text" 
                    value={editFormData.videoUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#182134] text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-[#EA580C] outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExercise(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                >
                  {isSavingEdit && <Loader2 size={14} className="animate-spin" />}
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deletingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111827] border border-rose-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            
            <div>
              <h3 className="text-base font-extrabold text-white">Egzersizi Silmek İstediğinize Emin Misiniz?</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                "<span className="text-white font-bold">{deletingExercise.name}</span>" egzersizi veritabanından kalıcı olarak silinecektir.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setDeletingExercise(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={14} className="animate-spin" />}
                Evet, Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}