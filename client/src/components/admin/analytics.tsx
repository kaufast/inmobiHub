import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
      </div>
      
      <Card className="bg-slate-800 border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Analytics component.</p>
          <p>Here administrators will be able to view platform metrics, user engagement statistics, and generate reports.</p>
        </CardContent>
      </Card>
    </div>
  );
}