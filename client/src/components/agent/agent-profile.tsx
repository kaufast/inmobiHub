import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AgentProfile() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Agent Profile</h1>
      </div>
      
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-700">Your Professional Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Agent Profile component.</p>
          <p>Here agents will be able to manage their public profile, credentials, contact information, and professional biography that will be visible to potential clients.</p>
        </CardContent>
      </Card>
    </div>
  );
}