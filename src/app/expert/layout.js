import NavbarExpert from '@/app/expert/dashboard/components/NavbarExpert';

export default function ExpertDashboardLayout({ children }) {
  return (
    <div className="expert-dashboard-layout min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col selection:bg-[#EA580C] selection:text-white">
      <NavbarExpert />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {children}
      </main>
    </div>
  );
}