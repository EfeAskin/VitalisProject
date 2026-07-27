import "./globals.css";
import ConditionalFooter from "@/components/ConditionalFooter";

export const metadata = {
  title: "Vitalis-OS | Premium Client Dashboard",
  description: "Staj Projesi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="antialiased bg-[#F8FAF8] min-h-screen flex flex-col justify-between selection:bg-[#C5A880]/30 selection:text-slate-900">
        
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        <ConditionalFooter />

      </body>
    </html>
  );
}