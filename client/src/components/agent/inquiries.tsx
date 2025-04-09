import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inquiries() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Inquiries</h1>
      </div>
      
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-700">Customer Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder for the Inquiries component.</p>
          <p>Here agents will be able to view and respond to inquiries from potential buyers and renters.</p>
        </CardContent>
      </Card>
    </div>
  );
}