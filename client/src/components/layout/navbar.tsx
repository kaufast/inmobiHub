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
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Inmobi
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/properties" className="text-gray-600 hover:text-primary">
              {t('common.properties', 'Properties')}
            </Link>
            <Link href="/services" className="text-gray-600 hover:text-primary">
              {t('common.services', 'Services')}
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-primary">
              {t('common.about', 'About')}
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-primary">
              {t('common.contact', 'Contact')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notifications */}
            <PropertyNotificationCenter />

            {/* Help Menu */}
            <HelpMenu />

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('common.dashboard', 'Dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {t('common.profile', 'Profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('common.logout', 'Log out')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">
                    {t('common.login', 'Sign In')}
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    {t('common.register', 'Join Now')}
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <Link href="/properties" className="text-lg">
                    {t('common.properties', 'Properties')}
                  </Link>
                  <Link href="/services" className="text-lg">
                    {t('common.services', 'Services')}
                  </Link>
                  <Link href="/about" className="text-lg">
                    {t('common.about', 'About')}
                  </Link>
                  <Link href="/contact" className="text-lg">
                    {t('common.contact', 'Contact')}
                  </Link>
                  {!user && (
                    <>
                      <Link href="/auth/login" className="text-lg">
                        {t('common.login', 'Sign In')}
                      </Link>
                      <Link href="/auth/register" className="text-lg">
                        {t('common.register', 'Join Now')}
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}