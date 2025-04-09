import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { Menu, X, ChevronDown, Home, Building, Search, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-primary-800/90 text-white sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center gap-2">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21H21M5 21V7L13 3V21M19 21V10L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-xl font-bold">Foundation<sup>®</sup></span>
          </a>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={`text-white/80 hover:text-white transition ${location === '/' ? 'text-white' : ''}`}>
              Home
            </a>
          </Link>
          <Link href="/search">
            <a className={`text-white/80 hover:text-white transition ${location.startsWith('/search') ? 'text-white' : ''}`}>
              Properties
            </a>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-white/80 hover:text-white transition flex items-center">
                Services <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem>
                <Link href="/services/buying">
                  <a className="flex w-full">Buying</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services/selling">
                  <a className="flex w-full">Selling</a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/services/investing">
                  <a className="flex w-full">Investing</a>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/about">
            <a className={`text-white/80 hover:text-white transition ${location === '/about' ? 'text-white' : ''}`}>
              About
            </a>
          </Link>
          <Link href="/contact">
            <a className={`text-white/80 hover:text-white transition ${location === '/contact' ? 'text-white' : ''}`}>
              Contact
            </a>
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || ''} alt={user.fullName} />
                    <AvatarFallback className="bg-secondary-500 text-white">
                      {user.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="ghost" className="hidden md:inline-block text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-secondary-500 hover:bg-secondary-600">
                  Join Now
                </Button>
              </Link>
            </>
          )}
          
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary-800 text-white p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <Link href="/">
                    <a className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 21H21M5 21V7L13 3V21M19 21V10L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xl font-bold">Foundation<sup>®</sup></span>
                    </a>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                  <div className="space-y-2 px-4">
                    <Link href="/">
                      <a 
                        className="flex items-center py-2 text-white/80 hover:text-white transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Home className="mr-3 h-5 w-5" />
                        Home
                      </a>
                    </Link>
                    <Link href="/search">
                      <a 
                        className="flex items-center py-2 text-white/80 hover:text-white transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Search className="mr-3 h-5 w-5" />
                        Properties
                      </a>
                    </Link>
                    <Link href="/services">
                      <a 
                        className="flex items-center py-2 text-white/80 hover:text-white transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Building className="mr-3 h-5 w-5" />
                        Services
                      </a>
                    </Link>
                    <Link href="/about">
                      <a 
                        className="flex items-center py-2 text-white/80 hover:text-white transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="mr-3 h-5 w-5" />
                        About
                      </a>
                    </Link>
                    <Link href="/contact">
                      <a 
                        className="flex items-center py-2 text-white/80 hover:text-white transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <svg 
                          className="mr-3 h-5 w-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Contact
                      </a>
                    </Link>
                    {user && (
                      <Link href="/dashboard">
                        <a 
                          className="flex items-center py-2 text-white/80 hover:text-white transition"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <User className="mr-3 h-5 w-5" />
                          Dashboard
                        </a>
                      </Link>
                    )}
                  </div>
                </nav>
                <div className="p-4 border-t border-white/10">
                  {user ? (
                    <Button 
                      className="w-full bg-secondary-500 hover:bg-secondary-600"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/auth">
                        <Button 
                          className="w-full bg-secondary-500 hover:bg-secondary-600"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Join Now
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button 
                          variant="outline" 
                          className="w-full text-white border-white/20 hover:bg-white/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
