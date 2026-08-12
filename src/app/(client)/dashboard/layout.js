import Navbar from './components/navbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#11142D]">
      {/* Navbar tüm dashboard alt sayfalarında otomatik üstte çıkacak */}
      <Navbar />
      
      {/* Marketplace, Programs veya Dashboard ana sayfa içerikleri buraya gelecek */}
      <main>
        {children}
      </main>
    </div>
  );
}