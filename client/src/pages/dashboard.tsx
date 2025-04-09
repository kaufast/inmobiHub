import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import PropertiesManagement from "@/components/dashboard/properties-management";
import Messages from "@/components/dashboard/messages";
import Favorites from "@/components/dashboard/favorites";
import Profile from "@/components/dashboard/profile";
import Subscription from "@/components/dashboard/subscription";

type Tab = "properties" | "favorites" | "messages" | "profile" | "subscription";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const { user } = useAuth();

  // Set document title
  useEffect(() => {
    document.title = "Dashboard - Foundation";
  }, []);

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {activeTab === "properties" && <PropertiesManagement />}
              {activeTab === "favorites" && <Favorites />}
              {activeTab === "messages" && <Messages />}
              {activeTab === "profile" && <Profile />}
              {activeTab === "subscription" && <Subscription />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
