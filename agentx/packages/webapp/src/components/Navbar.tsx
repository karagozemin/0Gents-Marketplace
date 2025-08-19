"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Rocket, Search } from "lucide-react";
import { Input } from "./ui/input";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 backdrop-blur border-b bg-black/30 dark:bg-black/30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Rocket className="w-5 h-5" />
          <span className="font-semibold">0Gents</span>
        </Link>
        <Link href="/explore" className="text-sm text-gray-300 hover:text-white">Explore</Link>
        <Link href="/create" className="text-sm text-gray-300 hover:text-white">Create</Link>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            <Input placeholder="Search agents..." className="pl-8 w-64" />
          </div>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}


