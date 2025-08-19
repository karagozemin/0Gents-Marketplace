import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export function AgentCard({ id, name, owner, image, priceEth, category }: {
  id: string; name: string; owner: string; image: string; priceEth: number; category: string;
}) {
  return (
    <Link href={`/agent/${id}`}>
      <Card className="overflow-hidden hover:translate-y-[-2px] transition-transform">
        <CardContent className="p-0">
          <div className="aspect-[4/3] bg-gray-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={name} className="w-32 h-12 opacity-80" />
          </div>
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{name}</h3>
              <Badge variant="secondary">{priceEth} ETH</Badge>
            </div>
            <p className="text-xs text-gray-400 truncate">by {owner}</p>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


