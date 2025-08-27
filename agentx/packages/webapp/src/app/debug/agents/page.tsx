"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAgentsFromServer } from "@/lib/globalAgents";
import { getCreatedAgents } from "@/lib/createdAgents";
import { mockAgents } from "@/lib/mock";

export default function DebugAgentsPage() {
  const [serverAgents, setServerAgents] = useState<any[]>([]);
  const [localAgents, setLocalAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const server = await getAgentsFromServer();
      const local = getCreatedAgents();
      setServerAgents(server);
      setLocalAgents(local);
      console.log("🌐 Server agents:", server);
      console.log("📱 Local agents:", local);
      console.log("🎭 Mock agents:", mockAgents);
    } catch (error) {
      console.error("❌ Failed to load agents:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🐛 Debug: Agent Sources
          </h1>
          <p className="text-gray-400 text-lg">
            Bu sayfa tüm agent kaynaklarını gösterir
          </p>
        </div>

        <Button onClick={loadAgents} disabled={loading} className="mb-8">
          {loading ? "⏳ Yükleniyor..." : "🔄 Yenile"}
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Server Agents */}
          <Card className="gradient-card border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🌐 Server Agents ({serverAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {serverAgents.map((agent, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-gray-400 text-sm">ID: {agent.id}</p>
                    <p className="text-gray-500 text-xs">
                      Created: {new Date(agent.createdAt).toLocaleString()}
                    </p>
                    <a 
                      href={`/agent/${agent.id}`} 
                      className="text-purple-400 hover:text-purple-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 View Details
                    </a>
                  </div>
                ))}
                {serverAgents.length === 0 && (
                  <p className="text-gray-500">No server agents found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Local Agents */}
          <Card className="gradient-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📱 Local Agents ({localAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {localAgents.map((agent, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-gray-400 text-sm">ID: {agent.id}</p>
                    <p className="text-gray-500 text-xs">
                      Created: {new Date(agent.createdAt).toLocaleString()}
                    </p>
                    <a 
                      href={`/agent/${agent.id}`} 
                      className="text-purple-400 hover:text-purple-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 View Details
                    </a>
                  </div>
                ))}
                {localAgents.length === 0 && (
                  <p className="text-gray-500">No local agents found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mock Agents */}
          <Card className="gradient-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🎭 Mock Agents ({mockAgents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {mockAgents.map((agent, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-gray-400 text-sm">ID: {agent.id}</p>
                    <p className="text-gray-500 text-xs">Category: {agent.category}</p>
                    <a 
                      href={`/agent/${agent.id}`} 
                      className="text-purple-400 hover:text-purple-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🔗 View Details
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Links */}
        <Card className="gradient-card border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">🧪 Test Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Server Agents:</h4>
                <div className="space-y-1">
                  {serverAgents.map((agent, index) => (
                    <a 
                      key={index}
                      href={`/agent/${agent.id}`} 
                      className="block text-green-400 hover:text-green-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /agent/{agent.id}
                    </a>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Local Agents:</h4>
                <div className="space-y-1">
                  {localAgents.map((agent, index) => (
                    <a 
                      key={index}
                      href={`/agent/${agent.id}`} 
                      className="block text-blue-400 hover:text-blue-300 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /agent/{agent.id}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
