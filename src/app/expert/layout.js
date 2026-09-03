import NavbarExpert from '@/app/expert/dashboard/components/NavbarExpert';

export default function ExpertDashboardLayout({ children }) {
  return (
    <div className="expert-dashboard-layout min-h-screen bg-[#0B1120] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white antialiased relative overflow-x-hidden">
      
      {/* Arka Plan Ambient Neon Işık Katmanları */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <NavbarExpert />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {children}
      </main>
    </div>
  );
}