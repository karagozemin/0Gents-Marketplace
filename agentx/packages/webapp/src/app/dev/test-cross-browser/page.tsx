"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveAgentToServer, getAgentsFromServer, clearServerAgents } from "@/lib/globalAgents";
import { getCreatedAgents, saveCreatedAgent } from "@/lib/createdAgents";
import type { CreatedAgent } from "@/lib/createdAgents";

export default function TestCrossBrowserPage() {
  const [serverAgents, setServerAgents] = useState<any[]>([]);
  const [localAgents, setLocalAgents] = useState<CreatedAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const server = await getAgentsFromServer();
      const local = getCreatedAgents();
      setServerAgents(server);
      setLocalAgents(local);
      setTestResult(`✅ Veri yüklendi: ${server.length} server, ${local.length} local`);
    } catch (error) {
      setTestResult(`❌ Veri yüklenemedi: ${error}`);
    }
    setLoading(false);
  };

  const createTestAgent = async () => {
    const testAgent: CreatedAgent = {
      id: `test-${Date.now()}`,
      tokenId: Date.now().toString(),
      name: `Test Agent ${new Date().getHours()}:${new Date().getMinutes()}`,
      description: "Cross-browser test agent",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
      category: "Test",
      creator: "0xTestAddress",
      price: "0.01",
      txHash: "0xtest",
      storageUri: "",
      createdAt: new Date().toISOString()
    };

    setLoading(true);
    try {
      // Local'a kaydet
      saveCreatedAgent(testAgent);
      
      // Server'a kaydet
      const success = await saveAgentToServer(testAgent);
      
      if (success) {
        setTestResult("✅ Test agent başarıyla oluşturuldu ve server'a kaydedildi!");
        await loadData();
      } else {
        setTestResult("❌ Test agent server'a kaydedilemedi!");
      }
    } catch (error) {
      setTestResult(`❌ Hata: ${error}`);
    }
    setLoading(false);
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      await clearServerAgents();
      localStorage.removeItem('agentx_created_agents');
      setTestResult("🗑️ Tüm veriler temizlendi!");
      await loadData();
    } catch (error) {
      setTestResult(`❌ Temizleme hatası: ${error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Cross-Browser Test Panel
          </h1>
          <p className="text-gray-400 text-lg">
            Bu sayfa ile farklı Google hesaplarında agent görünürlüğünü test edebilirsiniz
          </p>
        </div>

        {testResult && (
          <Card className="gradient-card border-purple-500/20">
            <CardContent className="p-6">
              <p className="text-white text-lg">{testResult}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="gradient-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🌐 Server Agents
                <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                  {serverAgents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Tüm kullanıcılar tarafından görülebilen global agent'lar
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {serverAgents.map((agent, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-gray-400 text-sm">{agent.description}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(agent.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📱 Local Agents
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                  {localAgents.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Sadece bu browser'da görülebilen local agent'lar
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {localAgents.map((agent, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-white font-semibold">{agent.name}</p>
                    <p className="text-gray-400 text-sm">{agent.description}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(agent.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white">🎮 Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={createTestAgent} 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? "⏳ Oluşturuluyor..." : "✨ Test Agent Oluştur"}
              </Button>
              
              <Button 
                onClick={loadData} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? "⏳ Yükleniyor..." : "🔄 Verileri Yenile"}
              </Button>
              
              <Button 
                onClick={clearAllData} 
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? "⏳ Temizleniyor..." : "🗑️ Tüm Verileri Temizle"}
              </Button>
              
              <div className="pt-4 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-2">📋 Test Adımları:</h4>
                <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Bu browser'da test agent oluştur</li>
                  <li>Farklı Google hesabında aç</li>
                  <li>Ana sayfada agent'ın görünüp görünmediğini kontrol et</li>
                  <li>Explore sayfasında da kontrol et</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-white">📖 Çözüm Açıklaması</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-4">
              <p>
                <strong className="text-white">Sorun:</strong> NFT'ler create edildiğinde sadece localStorage'a kaydediliyor, 
                bu yüzden farklı Google hesaplarında görünmüyordu.
              </p>
              <p>
                <strong className="text-white">Çözüm:</strong> Server-side API endpoint'i (/api/agents) oluşturuldu. 
                Artık NFT'ler hem localStorage'a hem de server'a kaydediliyor.
              </p>
              <p>
                <strong className="text-white">Sonuç:</strong> Tüm kullanıcılar birbirlerinin oluşturduğu NFT'leri 
                ana sayfada ve explore sayfasında görebiliyor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
