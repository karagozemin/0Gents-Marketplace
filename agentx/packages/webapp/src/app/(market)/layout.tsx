import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      <Footer />
    </div>
  );
}


