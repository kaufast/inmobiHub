import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  Home, 
  Heart, 
  MessageSquare, 
  User, 
  Package, 
  LogOut,
  Building,
  Upload,
  Crown
} from "lucide-react";

interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const subscriptionBadge = () => {
    switch (user.subscriptionTier) {
      case 'premium':
        return <Badge className="bg-secondary-500">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-700">Enterprise</Badge>;
      default:
        return <Badge>Free</Badge>;
    }
  };

  const navigationItems = [
    {
      name: "Browse Properties",
      value: "browse",
      icon: <Home className="h-5 w-5 mr-2" />,
    },
    {
      name: "My Properties",
      value: "properties",
      icon: <Building className="h-5 w-5 mr-2" />,
    },
    {
      name: "Favorites",
      value: "favorites",
      icon: <Heart className="h-5 w-5 mr-2" />,
    },
    {
      name: "Messages",
      value: "messages",
      icon: <MessageSquare className="h-5 w-5 mr-2" />,
    },
    {
      name: "Profile",
      value: "profile",
      icon: <User className="h-5 w-5 mr-2" />,
    },
    {
      name: "Subscription",
      value: "subscription",
      icon: <Package className="h-5 w-5 mr-2" />,
    },
  ];
  
  // Define premium features available to premium users only
  const premiumFeatures = [
    {
      name: "Bulk Upload",
      path: "/bulk-upload",
      icon: <Upload className="h-5 w-5 mr-2" />,
      premium: true
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* User info */}
      <div className="p-6 border-b border-primary-100">
        <div className="flex items-center">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImage || undefined} alt={user.fullName} />
            <AvatarFallback className="bg-secondary-500 text-white">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-primary-800 truncate">{user.fullName}</p>
            <p className="text-xs text-primary-500 truncate">{user.email}</p>
            <div className="mt-1">
              {subscriptionBadge()}
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
                    ? "bg-primary-50 text-secondary-600 font-medium border-r-4 border-secondary-500"
                    : "text-primary-600 hover:bg-primary-50 hover:text-primary-900"
                )}
              >
                {item.icon}
                {item.name}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Premium Features Section */}
        {(user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise') && (
          <>
            <Separator className="my-2 mx-6" />
            <div className="px-6 pt-2 pb-1">
              <div className="flex items-center text-xs text-primary-500">
                <Crown className="h-4 w-4 mr-1 text-amber-500" />
                <span>Premium Features</span>
              </div>
            </div>
            <ul>
              {premiumFeatures.map((feature) => (
                <li key={feature.path}>
                  <Link href={feature.path} className="flex items-center w-full px-6 py-3 text-sm transition-colors text-primary-600 hover:bg-primary-50 hover:text-primary-900">
                    {feature.icon}
                    {feature.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
      
      {/* Logout */}
      <div className="p-4 border-t border-primary-100">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
