import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AgentDashboardSidebar } from "@/components/agent/agent-dashboard-sidebar";
import PropertyListings from "@/components/agent/property-listings";
import Inquiries from "@/components/agent/inquiries";
import TourRequests from "@/components/agent/tour-requests";
import ClientManagement from "@/components/agent/client-management";
import AgentProfile from "@/components/agent/agent-profile";
import BulkUpload from "@/components/agent/bulk-upload";

type Tab = "listings" | "inquiries" | "tours" | "clients" | "profile" | "upload";

export default function AgentDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("listings");
  const { user } = useAuth();
  const [location] = useLocation();

  // Parse URL parameters and set active tab
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab') as Tab | null;
    
    if (tabParam && ["listings", "inquiries", "tours", "clients", "profile", "upload"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Set document title
  useEffect(() => {
    document.title = "Agent Dashboard - Foundation";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AgentDashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "listings" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <PropertyListings />
              </div>
            )}
            {activeTab === "inquiries" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <Inquiries />
              </div>
            )}
            {activeTab === "tours" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <TourRequests />
              </div>
            )}
            {activeTab === "clients" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <ClientManagement />
              </div>
            )}
            {activeTab === "profile" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <AgentProfile />
              </div>
            )}
            {activeTab === "upload" && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
                <BulkUpload />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}