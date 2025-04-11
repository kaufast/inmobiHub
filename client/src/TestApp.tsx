import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function TestApp() {
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiSource, setApiSource] = useState<"perplexity" | "anthropic" | "">("");

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatMessage.trim()) return;
    
    setIsLoading(true);
    setChatResponse("");
    setApiSource("");
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: chatMessage,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to get response");
      }
      
      const data = await response.json();
      setChatResponse(data.response);
      
      // Detect which API was used based on response content or headers
      if (response.headers.get("X-Api-Source") === "perplexity") {
        setApiSource("perplexity");
      } else if (response.headers.get("X-Api-Source") === "anthropic") {
        setApiSource("anthropic");
      } else {
        // Guess based on response format
        if (data.response.includes("citation") || data.response.includes("source")) {
          setApiSource("perplexity");
        } else {
          setApiSource("anthropic");
        }
      }
      
      toast({
        title: "Chat response received",
        description: "Successfully received response from AI assistant",
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-900 text-white p-4">
        <h1 className="text-2xl font-bold">Inmobi - Test Mode</h1>
      </header>
      
      <main className="flex-grow p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Welcome to Inmobi Test Mode</h2>
          <p className="mb-4">
            This is a simplified test version of the application with non-essential features disabled.
          </p>
          <p className="text-gray-600 mb-8">
            We're using this minimal version to diagnose and test core functionality.
          </p>
          
          <div className="mt-8 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Status</h3>
            <ul className="list-disc pl-5 space-y-2 mb-6">
              <li>WebSocket connections disabled</li>
              <li>Firebase authentication bypassed</li>
              <li>Complex providers removed</li>
              <li>Minimal UI rendering</li>
              <li>Multi-language support disabled</li>
              <li className="text-green-700 font-medium">Perplexity API integration enabled</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-2">Test Chat Integration</h3>
            <p className="mb-4 text-sm text-gray-600">
              Test the Perplexity API integration by sending a question below:
            </p>
            
            <form onSubmit={handleChatSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask a question about real estate..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !chatMessage.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Send"}
                </Button>
              </div>
              
              {isLoading && (
                <div className="text-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Processing your question...</p>
                </div>
              )}
              
              {chatResponse && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Response:</h4>
                    {apiSource && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        via {apiSource === "perplexity" ? "Perplexity API" : "Anthropic Claude"}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{chatResponse}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>Inmobi Real Estate Platform &copy; 2025</p>
      </footer>
      
      <Toaster />
    </div>
  );
}

export default TestApp;