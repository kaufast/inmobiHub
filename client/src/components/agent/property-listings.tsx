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
import { 
  MoreHorizontal, 
  Search, 
  Plus, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash, 
  BarChart3, 
  MessageSquare,
  ArrowUpDown
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PropertyListings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const { toast } = useToast();
  
  // Placeholder data - would be replaced with real data from API
  const properties = [
    {
      id: 1,
      title: "Modern Downtown Condo",
      address: "123 Main St, Seattle, WA 98101",
      price: 450000,
      status: "active",
      propertyType: "condo",
      views: 124,
      inquiries: 5,
      createdAt: "2025-02-15"
    },
    {
      id: 2,
      title: "Luxury Waterfront Villa",
      address: "456 Lake View Dr, Bellevue, WA 98004",
      price: 1250000,
      status: "pending",
      propertyType: "house",
      views: 287,
      inquiries: 11,
      createdAt: "2025-03-01"
    },
    {
      id: 3,
      title: "Cozy Studio Apartment",
      address: "789 Urban Ave, Capitol Hill, Seattle, WA 98102",
      price: 275000,
      status: "sold",
      propertyType: "apartment",
      views: 56,
      inquiries: 0,
      createdAt: "2025-01-28"
    }
  ];
  
  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-500";
      case 'pending': return "bg-amber-500";
      case 'draft': return "bg-blue-500";
      case 'sold': return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };
  
  const handleDelete = (id: number) => {
    // In a real implementation, this would call an API
    toast({
      title: "Property deleted",
      description: `Property ID ${id} has been deleted.`,
      variant: "destructive",
    });
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const refreshProperties = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 800);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const getSortedProperties = () => {
    let sortedProperties = [...properties];
    
    switch (sortBy) {
      case "price-high":
        sortedProperties.sort((a, b) => b.price - a.price);
        break;
      case "price-low":
        sortedProperties.sort((a, b) => a.price - b.price);
        break;
      case "views":
        sortedProperties.sort((a, b) => b.views - a.views);
        break;
      case "inquiries":
        sortedProperties.sort((a, b) => b.inquiries - a.inquiries);
        break;
      case "date":
      default:
        sortedProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    return sortedProperties.filter(property => 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-800">Property Listings</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>
      
      <Card className="shadow-md mb-6 border-indigo-100">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg font-medium text-indigo-700">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white shadow rounded-lg p-4 border border-indigo-100">
              <div className="text-3xl font-bold text-indigo-600">{properties.length}</div>
              <div className="text-gray-500 text-sm">Total Listings</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border border-indigo-100">
              <div className="text-3xl font-bold text-green-600">{properties.filter(p => p.status === 'active').length}</div>
              <div className="text-gray-500 text-sm">Active Listings</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border border-indigo-100">
              <div className="text-3xl font-bold text-amber-600">{properties.filter(p => p.status === 'pending').length}</div>
              <div className="text-gray-500 text-sm">Pending</div>
            </div>
            <div className="bg-white shadow rounded-lg p-4 border border-indigo-100">
              <div className="text-3xl font-bold text-purple-600">{properties.filter(p => p.status === 'sold').length}</div>
              <div className="text-gray-500 text-sm">Sold</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-indigo-100">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-medium text-indigo-700">Your Properties</CardTitle>
            <div className="flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-8 border-indigo-100"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-indigo-100">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="inquiries">Most Inquiries</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon" 
                className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                onClick={refreshProperties}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-indigo-50">
              <TableRow className="hover:bg-indigo-50 border-indigo-100">
                <TableHead className="text-indigo-600">Property</TableHead>
                <TableHead className="text-indigo-600">Price</TableHead>
                <TableHead className="text-indigo-600">Status</TableHead>
                <TableHead className="text-indigo-600">
                  <div className="flex items-center">
                    Views
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-indigo-600">
                  <div className="flex items-center">
                    Inquiries
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="text-indigo-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedProperties().map((property) => (
                <TableRow key={property.id} className="hover:bg-indigo-50/50 border-indigo-100">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-gray-500">{property.address}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-indigo-700">
                    {formatPrice(property.price)}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColor(property.status)}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{property.views}</TableCell>
                  <TableCell>
                    {property.inquiries > 0 ? (
                      <div className="flex items-center">
                        {property.inquiries}
                        <Badge className="ml-2 bg-red-500 text-white">New</Badge>
                      </div>
                    ) : (
                      0
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="outline" size="sm" className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-indigo-100">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Link href={`/property/${property.id}`} className="flex w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View Public Page
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Link href={`/property/${property.id}/analytics`} className="flex w-full">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Inquiries
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(property.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {getSortedProperties().length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    No properties found matching your search.
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