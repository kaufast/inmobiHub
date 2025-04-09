import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Users, 
  Building2, 
  BarChart4, 
  Settings, 
  LogOut,
  ShieldCheck,
  Bell,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function AdminDashboardSidebar({ activeTab, setActiveTab }: AdminDashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your admin account.",
        variant: "default",
      });
    }
  };

  const navigationItems = [
    {
      name: "Users Management",
      value: "users",
      icon: <Users className="h-5 w-5 mr-2" />,
    },
    {
      name: "Properties",
      value: "properties",
      icon: <Building2 className="h-5 w-5 mr-2" />,
    },
    {
      name: "Analytics & Reports",
      value: "analytics",
      icon: <BarChart4 className="h-5 w-5 mr-2" />,
    },
    {
      name: "System Settings",
      value: "settings",
      icon: <Settings className="h-5 w-5 mr-2" />,
    },
    {
      name: "Approval Requests",
      value: "approvals",
      icon: <ShieldCheck className="h-5 w-5 mr-2" />,
    },
  ];
  
  // Define quick actions available to admins
  const quickActions = [
    {
      name: "View Notifications",
      path: "/admin/notifications",
      icon: <Bell className="h-5 w-5 mr-2" />,
    },
    {
      name: "Database Tools",
      path: "/admin/database",
      icon: <Database className="h-5 w-5 mr-2" />,
    }
  ];

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
      {/* Admin info */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 border-2 border-indigo-500">
            <AvatarImage src={user.profileImage || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-indigo-600 text-white">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="mt-1">
              <Badge className="bg-indigo-600">Administrator</Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="py-4">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.value}>
              <button
                onClick={() => setActiveTab(item.value)}
                className={cn(
                  "flex items-center w-full px-6 py-3 text-sm transition-colors",
                  activeTab === item.value
                    ? "bg-slate-700 text-indigo-400 font-medium border-l-4 border-indigo-500"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                {item.icon}
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Quick Actions Section */}
        <Separator className="my-3 mx-6 bg-slate-700" />
        <div className="px-6 pt-2 pb-1">
          <div className="flex items-center text-xs text-slate-400">
            <span>QUICK ACTIONS</span>
          </div>
        </div>
        <ul>
          {quickActions.map((action) => (
            <li key={action.path}>
              <Link href={action.path} className="flex items-center w-full px-6 py-3 text-sm transition-colors text-slate-300 hover:bg-slate-700 hover:text-white">
                {action.icon}
                {action.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Admin Actions */}
      <div className="px-6 pb-2 pt-2">
        <div className="flex items-center text-xs text-slate-400">
          <span>SYSTEM</span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <Link href="/">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 border-slate-600 mb-2"
          >
            Return to Site
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          className="w-full flex items-center justify-center"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}