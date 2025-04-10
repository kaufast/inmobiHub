import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import PropertyBrowser from "@/components/dashboard/property-browser";
import PropertiesManagement from "@/components/dashboard/properties-management";
import Messages from "@/components/dashboard/messages";
import Favorites from "@/components/dashboard/favorites";
import Profile from "@/components/dashboard/profile";
import Subscription from "@/components/dashboard/subscription";

type Tab = "properties" | "favorites" | "messages" | "profile" | "subscription" | "browse";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [propertyId, setPropertyId] = useState<number | undefined>(undefined);
  const { user } = useAuth();
  const [location] = useLocation();

  // Parse URL parameters and set active tab
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab') as Tab | null;
    const propertyParam = url.searchParams.get('property');
    
    if (tabParam && ["properties", "favorites", "messages", "profile", "subscription", "browse"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    if (propertyParam && !isNaN(Number(propertyParam))) {
      setPropertyId(Number(propertyParam));
      // If a property ID is provided, ensure we're on the messages tab
      if (tabParam !== 'messages') {
        setActiveTab('messages');
      }
    }
  }, [location]);

  // Set document title
  useEffect(() => {
    document.title = "Dashboard - Inmobi";
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
            {activeTab === "browse" && <PropertyBrowser />}
            {activeTab === "properties" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <PropertiesManagement />
              </div>
            )}
            {activeTab === "favorites" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Favorites />
              </div>
            )}
            {activeTab === "messages" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Messages propertyId={propertyId} />
              </div>
            )}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Profile />
              </div>
            )}
            {activeTab === "subscription" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <Subscription />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
