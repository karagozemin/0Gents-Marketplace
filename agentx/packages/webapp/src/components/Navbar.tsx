"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { mockAgents } from "@/lib/mock";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockAgents>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockAgents.filter(agent => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAgentClick = (agentId: string) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/agent/${agentId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };
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
          <div className="relative hidden lg:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
              <Input 
                placeholder="Search AI agents..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setIsSearchOpen(true);
                  }
                }}
                className="pl-10 pr-10 w-80 bg-white/5 border-white/10 focus:border-purple-400/50 focus:ring-purple-400/20 placeholder:text-gray-500" 
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Search Results Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <Card className="absolute top-full mt-2 w-full max-w-md bg-black border border-white/30 shadow-2xl z-50">
                <CardContent className="p-0">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-3 border-b border-white/20 bg-gray-900">
                        <p className="text-xs text-gray-300 font-medium">
                          Results for "{searchQuery}"
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto scrollbar-hide">
                        {searchResults.map((agent) => (
                          <div
                            key={agent.id}
                            onClick={() => handleAgentClick(agent.id)}
                            className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                  src={agent.image} 
                                  alt={agent.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate">{agent.name}</h4>
                                <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                                    {agent.category}
                                  </Badge>
                                  <span className="text-xs text-gray-400">{agent.priceEth} 0G</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {searchQuery && (
                        <div className="p-3 border-t border-white/20 bg-gray-900">
                          <button
                            onClick={() => {
                              setIsSearchOpen(false);
                              router.push(`/explore?search=${encodeURIComponent(searchQuery)}`);
                            }}
                            className="w-full text-center text-sm text-purple-300 hover:text-white hover:bg-purple-600/20 transition-all duration-200 font-medium py-2 px-4 rounded-md border border-purple-500/30 hover:border-purple-400/50 cursor-pointer"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center bg-gray-900">
                      <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">No agents found</p>
                      <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <div className="relative">
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}


