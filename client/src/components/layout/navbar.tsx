import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, ChevronDown, Home, Building, Search, User, LogOut, HelpCircle, LayoutDashboard } from "lucide-react";
import LanguageSelector from "@/components/i18n/language-selector";
import PropertyNotificationCenter from "@/components/notifications/property-notification-center";
import HelpMenu from "@/components/layout/help-menu";

export default function Navbar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get auth context
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Inmobi
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/about" className="text-gray-600 hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary">
              Contact
            </Link>
            <Link href="/auth" className="text-gray-600 hover:text-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}