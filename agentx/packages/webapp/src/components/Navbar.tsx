"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Rocket, Search, Sparkles } from "lucide-react";
import { Input } from "./ui/input";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 bg-black/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <div className="absolute inset-0 w-6 h-6 bg-purple-400/20 rounded-full blur-sm group-hover:bg-purple-300/30 transition-all"></div>
          </div>
          <span className="text-xl font-bold text-gradient">0Gents</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 ml-8">
          <Link href="/explore" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Explore
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-0g group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/create" className="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
            Create
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-0g group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search AI agents..." 
              className="pl-10 w-80 bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 placeholder:text-gray-500" 
            />
          </div>
          <div className="relative">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}


