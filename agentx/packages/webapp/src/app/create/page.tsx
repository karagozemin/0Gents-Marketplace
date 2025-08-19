"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreatePage() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [jsonUrl, setJsonUrl] = useState("");

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-medium">Create Agent</h1>
      <Input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
      <Input placeholder="JSON URL (optional)" value={jsonUrl} onChange={(e) => setJsonUrl(e.target.value)} />
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
      <Input placeholder="Price (ETH)" value={price} onChange={(e) => setPrice(e.target.value)} />
      <div>
        <Button>Mint</Button>
      </div>
    </div>
  );
}


