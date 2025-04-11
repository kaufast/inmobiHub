import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Bot, Send, RefreshCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Create a new QueryClient for the test app
const queryClient = new QueryClient();

export default function TestApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestAppContent />
    </QueryClientProvider>
  );
}

function TestAppContent() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<'perplexity' | 'anthropic' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const handleTestApi = async () => {
    setIsTestLoading(true);
    setTestResponse(null);
    setTestError(null);

    try {
      const response = await fetch('/api/test-perplexity');
      const data = await response.json();

      if (data.success) {
        setTestResponse(data.response);
      } else {
        setTestError(data.message || 'Failed to test API');
      }
    } catch (err: any) {
      setTestError('Error: ' + (err.message || 'Failed to connect to API'));
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiRequest('POST', '/api/chat', { message });
      const data = await result.json();
      
      setResponse(data.response);
      setApiSource(data.apiSource);
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Failed to get response'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Inmobi AI Test Interface</h1>
          <p className="text-gray-400">
            Testing environment for AI integrations (Perplexity API and Anthropic Claude)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Test Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCcw size={20} />
                API Connectivity Test
              </CardTitle>
              <CardDescription className="text-gray-400">
                Check if the Perplexity API is configured correctly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestApi} 
                disabled={isTestLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isTestLoading ? (
                  <><Loader2 size={16} className="animate-spin mr-2" /> Testing API...</>
                ) : (
                  <>Test Perplexity API</>
                )}
              </Button>
              
              {testError && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md flex items-start gap-2">
                  <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{testError}</p>
                </div>
              )}
              
              {testResponse && (
                <div className="mt-4">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-md p-3">
                    <div className="inline-block mb-2 text-xs font-semibold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                      Perplexity API Test Result
                    </div>
                    <p className="text-sm whitespace-pre-line text-gray-300">{testResponse}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Test Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} />
                Chat Integration Test
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test the chat API with a custom message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask a real estate question..."
                    disabled={isLoading}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    disabled={isLoading || !message.trim()}
                    className="absolute right-1 top-1 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </div>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md flex items-start gap-2">
                  <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
              
              {response && (
                <div className="mt-4">
                  <div className="bg-gray-700/50 border border-gray-600 rounded-md p-3">
                    <div className="inline-block mb-2 text-xs font-semibold bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded">
                      {apiSource === 'perplexity' ? 'Perplexity API' : 'Anthropic Claude'}
                    </div>
                    <p className="text-sm whitespace-pre-line text-gray-300">{response}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Separator className="my-4 bg-gray-700" />
          <div className="text-center text-gray-500 text-sm">
            <p>This is a testing interface for AI API integrations</p>
            <p>Both Perplexity API and Anthropic Claude are supported, with automatic fallback</p>
          </div>
        </div>
      </div>
    </div>
  );
}