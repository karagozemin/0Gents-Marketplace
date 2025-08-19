"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export function AgentWideCard({ id, name, owner, image, priceEth, tag }: {
  id: string; name: string; owner: string; image: string; priceEth: number; tag?: string;
}) {
  return (
    <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 250, damping: 20 }}
      className="min-w-[320px] md:min-w-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-900/80 to-black border border-white/5">
      <Link href={`/agent/${id}`}>
        <div className="aspect-[16/9] bg-zinc-950 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={name} className="w-48 h-16 opacity-80" />
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold truncate">{name}</h3>
          <Badge variant="secondary">{priceEth} ETH</Badge>
        </div>
        <p className="text-xs text-gray-400 truncate">by {owner}</p>
        {tag ? <p className="text-xs text-purple-300">{tag}</p> : null}
        <div className="pt-2">
          <Button size="sm" asChild>
            <Link href={`/agent/${id}`}>Buy</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}


