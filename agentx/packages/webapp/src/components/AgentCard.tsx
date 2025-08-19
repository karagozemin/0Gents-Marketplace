"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Eye, Zap } from "lucide-react";
import { useState } from "react";

export function AgentCard({ id, name, owner, image, priceEth, category }: {
  id: string; name: string; owner: string; image: string; priceEth: number; category: string;
}) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className="overflow-hidden gradient-card hover:glow-purple transition-all duration-300 border-white/10">
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-900/20 via-gray-900 to-blue-900/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={image} 
              alt={name} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" 
            />
            
            {/* Hover Actions */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-black/50 backdrop-blur-sm hover:bg-purple-500/50"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLiked(!isLiked);
                }}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-8 h-8 p-0 bg-black/50 backdrop-blur-sm hover:bg-purple-500/50"
              >
                <Eye className="w-4 h-4 text-white" />
              </Button>
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-purple-500/80 text-white border-none text-xs">
                {category}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{name}</h3>
                <Badge variant="outline" className="border-purple-400/50 text-purple-300 bg-purple-500/10">
                  {priceEth} ETH
                </Badge>
              </div>
              <p className="text-sm text-gray-400 truncate">by {owner}</p>
            </div>

            {/* Action Button */}
            <Link href={`/agent/${id}`}>
              <Button size="sm" className="w-full gradient-0g hover:opacity-90 text-white font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Buy Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


