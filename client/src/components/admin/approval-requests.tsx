import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApprovalRequests() {
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Approval Requests</h1>
      </div>
      
      <Card className="bg-slate-800 border-slate-700 shadow-md">
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Approval Requests component.</p>
          <p>Here administrators will be able to review and approve property listings, agent applications, and other content that requires moderation.</p>
        </CardContent>
      </Card>
    </div>
  );
}