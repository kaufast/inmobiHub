import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-4 px-6 bg-primary text-primary-foreground">
        <h1 className="text-2xl font-bold">Inmobi Real Estate</h1>
      </header>
      <main className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Welcome to Inmobi</h2>
          <p className="text-lg mb-8">The modern real estate platform for finding your dream home.</p>
          <div className="p-8 border rounded-lg shadow-md">
            <p className="mb-4">Our application is currently undergoing maintenance.</p>
            <p>Please check back shortly.</p>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default App;