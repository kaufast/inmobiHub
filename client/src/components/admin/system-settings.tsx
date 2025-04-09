import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SystemSettings() {
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>
      
      <Card className="bg-slate-800 border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the System Settings component.</p>
          <p>Here administrators will be able to configure global system settings, manage subscription tiers, and control platform behavior.</p>
        </CardContent>
      </Card>
    </div>
  );
}