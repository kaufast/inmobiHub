import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TourRequests() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Tour Requests</h1>
      </div>
      
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-700">Property Tour Scheduling</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Tour Requests component.</p>
          <p>Here agents will be able to view, schedule, and manage property tours requested by potential buyers.</p>
        </CardContent>
      </Card>
    </div>
  );
}