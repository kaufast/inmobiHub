import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AdminDashboardSidebar } from "@/components/admin/admin-dashboard-sidebar";
import UsersManagement from "@/components/admin/users-management";
import PropertiesManagement from "@/components/admin/properties-management";
import Analytics from "@/components/admin/analytics";
import SystemSettings from "@/components/admin/system-settings";
import ApprovalRequests from "@/components/admin/approval-requests";

type Tab = "users" | "properties" | "analytics" | "settings" | "approvals";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const { user } = useAuth();
  const [location] = useLocation();

  // Parse URL parameters and set active tab
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab') as Tab | null;
    
    if (tabParam && ["users", "properties", "analytics", "settings", "approvals"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Set document title
  useEffect(() => {
    document.title = "Admin Dashboard - Foundation";
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AdminDashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4">
            {activeTab === "users" && (
              <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700">
                <UsersManagement />
              </div>
            )}
            {activeTab === "properties" && (
              <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700">
                <PropertiesManagement />
              </div>
            )}
            {activeTab === "analytics" && (
              <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700">
                <Analytics />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700">
                <SystemSettings />
              </div>
            )}
            {activeTab === "approvals" && (
              <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-700">
                <ApprovalRequests />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}