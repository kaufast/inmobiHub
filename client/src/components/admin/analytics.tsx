import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Loader2, BarChart, MessageSquareText, Users, Building2 } from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

// Define the types for our chat analytics data
type ChatAnalytics = {
  id: number;
  userId: number | null;
  propertyId: number | null;
  message: string;
  response: string;
  category: string | null;
  sentiment: string | null;
  isPropertySpecific: boolean;
  createdAt: string;
};

type TopQuestion = {
  message: string;
  count: number;
};

type CategoryCount = {
  category: string;
  count: number;
};

type SentimentCount = {
  sentiment: string;
  count: number;
};

// Colors for charts
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#10b981', '#06b6d4'];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("chat");

  // Fetch chat analytics data
  const { data: chatAnalytics, isLoading: isLoadingAnalytics } = useQuery<ChatAnalytics[]>({
    queryKey: ["/api/admin/chat-analytics"],
    enabled: activeTab === "chat",
  });

  // Fetch top questions
  const { data: topQuestions, isLoading: isLoadingTopQuestions } = useQuery<TopQuestion[]>({
    queryKey: ["/api/admin/chat-analytics/top-questions"],
    enabled: activeTab === "chat",
  });

  // Fetch category breakdown
  const { data: categoryData, isLoading: isLoadingCategories } = useQuery<CategoryCount[]>({
    queryKey: ["/api/admin/chat-analytics/categories"],
    enabled: activeTab === "chat",
  });

  // Fetch sentiment breakdown
  const { data: sentimentData, isLoading: isLoadingSentiment } = useQuery<SentimentCount[]>({
    queryKey: ["/api/admin/chat-analytics/sentiment"],
    enabled: activeTab === "chat",
  });

  // Format category data for chart
  const formattedCategoryData = categoryData?.map(item => ({
    name: item.category || "Uncategorized",
    value: item.count
  })) || [];

  // Format sentiment data for chart
  const formattedSentimentData = sentimentData?.map(item => ({
    name: item.sentiment || "Neutral",
    value: item.count
  })) || [];

  // Format top questions for bar chart
  const formattedTopQuestions = topQuestions?.map(q => ({
    question: q.message.length > 30 ? q.message.substring(0, 30) + '...' : q.message,
    count: q.count
  })) || [];

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
      </div>
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquareText className="h-4 w-4 mr-2" />
            Chat Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Property Analytics
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            Business Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-slate-800 border-slate-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Chat Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : categoryData && categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={formattedCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formattedCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-slate-400">
                    No category data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-slate-800 border-slate-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSentiment ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : sentimentData && sentimentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={formattedSentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {formattedSentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value: number) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-slate-400">
                    No sentiment data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card className="bg-slate-800 border-slate-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Top User Questions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTopQuestions ? (
                  <div className="h-[350px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : topQuestions && topQuestions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsBarChart
                      data={formattedTopQuestions}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="question" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[350px] flex items-center justify-center text-slate-400">
                    No data available for top questions
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-slate-800 border-slate-700 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Recent Chat Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : chatAnalytics && chatAnalytics.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-400">Time</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-400">User ID</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-400">Question</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-400">Category</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-slate-400">Property</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chatAnalytics.map((chat) => (
                          <tr key={chat.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {new Date(chat.createdAt).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {chat.userId || 'Anonymous'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {chat.message.length > 50 ? chat.message.substring(0, 50) + '...' : chat.message}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {chat.category || 'Uncategorized'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">
                              {chat.propertyId ? `ID: ${chat.propertyId}` : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    No chat analytics data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This section will display user analytics (registration trends, active users, etc.)</p>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="properties">
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle>Property Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This section will display property listing analytics (views, inquiries, etc.)</p>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="overview">
          <Card className="bg-slate-800 border-slate-700 shadow-md">
            <CardHeader>
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This section will provide high-level business metrics for the platform.</p>
              <p>Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}