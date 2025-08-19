import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}


