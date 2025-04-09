import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Building, 
  MessageSquare, 
  CalendarRange, 
  Users,
  User,
  LogOut,
  Upload,
  Home,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentDashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function AgentDashboardSidebar({ activeTab, setActiveTab }: AgentDashboardSidebarProps) {
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
        description: "You have been logged out of your agent account.",
        variant: "default",
      });
    }
  };

  const navigationItems = [
    {
      name: "Property Listings",
      value: "listings",
      icon: <Building className="h-5 w-5 mr-2" />,
    },
    {
      name: "Inquiries",
      value: "inquiries",
      icon: <MessageSquare className="h-5 w-5 mr-2" />,
    },
    {
      name: "Tour Requests",
      value: "tours",
      icon: <CalendarRange className="h-5 w-5 mr-2" />,
    },
    {
      name: "Client Management",
      value: "clients",
      icon: <Users className="h-5 w-5 mr-2" />,
    },
    {
      name: "Profile",
      value: "profile",
      icon: <User className="h-5 w-5 mr-2" />,
    },
    {
      name: "Bulk Upload",
      value: "upload",
      icon: <Upload className="h-5 w-5 mr-2" />,
    },
  ];
  
  // Define quick actions available to agents
  const quickActions = [
    {
      name: "View Website",
      path: "/",
      icon: <Home className="h-5 w-5 mr-2" />,
    },
    {
      name: "Documentation",
      path: "/agent/documentation",
      icon: <FileText className="h-5 w-5 mr-2" />,
    }
  ];

  // Calculate total counters (would be replaced with real data)
  const stats = {
    properties: 12,
    inquiries: 8,
    tours: 3
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-indigo-100">
      {/* Agent info */}
      <div className="p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarImage src={user.profileImage || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-indigo-300 text-indigo-800">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
            <p className="text-xs text-indigo-100 truncate">{user.email}</p>
            <div className="mt-1">
              <Badge className="bg-white text-indigo-600">Agent</Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-1 p-4 border-b border-indigo-100 bg-indigo-50">
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="font-bold text-indigo-600">{stats.properties}</div>
          <div className="text-xs text-gray-500">Listings</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="font-bold text-indigo-600">{stats.inquiries}</div>
          <div className="text-xs text-gray-500">Inquiries</div>
        </div>
        <div className="bg-white p-3 rounded-lg text-center">
          <div className="font-bold text-indigo-600">{stats.tours}</div>
          <div className="text-xs text-gray-500">Tours</div>
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
                    ? "bg-indigo-50 text-indigo-600 font-medium border-r-4 border-indigo-500"
                    : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-800"
                )}
              >
                {item.icon}
                {item.name}
                
                {/* Add notification badges for certain tabs */}
                {item.value === "inquiries" && stats.inquiries > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white">{stats.inquiries}</Badge>
                )}
                {item.value === "tours" && stats.tours > 0 && (
                  <Badge className="ml-auto bg-amber-500 text-white">{stats.tours}</Badge>
                )}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Quick Actions Section */}
        <Separator className="my-3 mx-6" />
        <div className="px-6 pt-2 pb-1">
          <div className="flex items-center text-xs text-gray-500">
            <span>QUICK LINKS</span>
          </div>
        </div>
        <ul>
          {quickActions.map((action) => (
            <li key={action.path}>
              <Link href={action.path} className="flex items-center w-full px-6 py-3 text-sm transition-colors text-gray-600 hover:bg-indigo-50 hover:text-indigo-800">
                {action.icon}
                {action.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-indigo-100">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}