import { Toaster } from "@/components/ui/toaster";

function TestApp() {
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
            We're using this minimal version to diagnose issues with the main application.
          </p>
          
          <div className="mt-8 p-4 border border-blue-200 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Troubleshooting Status</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>WebSocket connections disabled</li>
              <li>Firebase authentication bypassed</li>
              <li>Complex providers removed</li>
              <li>Minimal UI rendering</li>
              <li>Multi-language support temporarily disabled</li>
            </ul>
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