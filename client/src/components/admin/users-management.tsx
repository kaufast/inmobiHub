import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Search, UserPlus, RefreshCw } from "lucide-react";

export default function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Placeholder data - would be replaced with real data from API
  const users = [
    {
      id: 1,
      username: "johndoe",
      fullName: "John Doe",
      email: "john@example.com",
      role: "user",
      subscriptionTier: "free",
      createdAt: "2025-01-15"
    },
    {
      id: 2,
      username: "janedoe",
      fullName: "Jane Doe",
      email: "jane@example.com",
      role: "agent",
      subscriptionTier: "premium",
      createdAt: "2025-02-20"
    },
    {
      id: 3,
      username: "admin1",
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
      subscriptionTier: "enterprise",
      createdAt: "2024-10-05"
    }
  ];
  
  const roleColor = (role: string) => {
    switch (role) {
      case 'admin': return "bg-red-500";
      case 'agent': return "bg-amber-500";
      default: return "bg-blue-500";
    }
  };
  
  const subscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return "bg-purple-500";
      case 'premium': return "bg-green-500";
      default: return "bg-gray-500";
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const refreshUsers = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>
      
      <Card className="bg-slate-800 border-slate-700 shadow-md mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-3xl font-bold">{users.length}</div>
              <div className="text-slate-400 text-sm">Total Users</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-3xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
              <div className="text-slate-400 text-sm">Admins</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-3xl font-bold">{users.filter(u => u.role === 'agent').length}</div>
              <div className="text-slate-400 text-sm">Agents</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-3xl font-bold">{users.filter(u => u.subscriptionTier !== 'free').length}</div>
              <div className="text-slate-400 text-sm">Premium Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-800 border-slate-700 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium">User Accounts</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                onClick={refreshUsers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-700">
              <TableRow className="hover:bg-slate-700 border-slate-600">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Username</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Subscription</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-700/50 border-slate-700">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-indigo-500">
                          {user.fullName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Badge className={roleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={subscriptionColor(user.subscriptionTier)}>
                      {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/30 hover:text-red-300 cursor-pointer">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}