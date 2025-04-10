import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BarChart,
  AreaChart,
  Bar,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Property, 
  Neighborhood 
} from "@shared/schema";
import { formatPrice } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  Home,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  Users,
  Target,
  ArrowLeft,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  Percent,
  HelpCircle,
  Map,
  Building,
  Loader2
} from "lucide-react";

const analyticsPeriods = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "6m", label: "Last 6 Months" },
  { value: "1y", label: "Last Year" },
  { value: "all", label: "All Time" }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function PropertyAnalytics() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30d");
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [compareToMarket, setCompareToMarket] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = "Property Analytics - Inmobi";
  }, []);

  // Fetch property data
  const { isLoading, error, data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });

  // Fetch neighborhood data if property has a neighborhood
  const { data: neighborhood } = useQuery<Neighborhood>({
    queryKey: [`/api/neighborhoods/${property?.neighborhoodId}`],
    enabled: !!property?.neighborhoodId,
  });

  // Fetch market data
  const { data: marketData } = useQuery({
    queryKey: ['/api/market/trends', { location: property?.city }],
    enabled: !!property?.city,
  });

  // Check if user is owner
  useEffect(() => {
    if (user && property) {
      setIsOwner(user.id === property.ownerId);
    }
  }, [user, property]);

  // Mock analytics data - In a real app, this would come from the backend
  const [analyticsData, setAnalyticsData] = useState({
    viewsData: [],
    inquiriesData: [],
    conversionData: [],
    marketComparison: [],
    priceHistory: [],
    regionalData: [],
    rentalYield: null,
    propertyValue: null,
    valueChange: null,
    occupancyRate: null,
    projectedIncome: null,
    seasonalTrends: [],
    competitorAnalysis: [],
    investmentMetrics: {
      roi: 0,
      capRate: 0,
      cashOnCash: 0,
      breakEvenPoint: 0,
      netOperatingIncome: 0,
      grossRentMultiplier: 0
    }
  });

  // Generate mock data for the analytics
  useEffect(() => {
    if (property) {
      // Views data over time
      const viewsData = [];
      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        
        // Random views with an upward trend
        const views = Math.floor(Math.random() * 50) + 20 + (i * 2);
        
        // Market average with some fluctuation but generally lower
        const marketAverage = Math.floor(Math.random() * 30) + 15 + (i * 1.5);
        
        viewsData.push({
          date: formattedDate,
          views,
          marketAverage,
        });
      }

      // Inquiries data
      const inquiriesData = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (29 - i));
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
        
        // Random inquiries data
        const inquiries = Math.floor(Math.random() * 10) + (i > 15 ? 5 : 0);
        
        // Market average with some fluctuation
        const marketAverage = Math.floor(Math.random() * 7) + 2;
        
        inquiriesData.push({
          date: formattedDate,
          inquiries,
          marketAverage,
        });
      }

      // Conversion rate data (views to inquiries)
      const conversionData = viewsData.map((item, index) => {
        const inquiryData = inquiriesData[index];
        const conversionRate = (inquiryData.inquiries / item.views) * 100;
        const marketConversion = (inquiryData.marketAverage / item.marketAverage) * 100;
        
        return {
          date: item.date,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          marketAverage: parseFloat(marketConversion.toFixed(2)),
        };
      });

      // Price history (6 month intervals)
      const priceHistory = [];
      for (let i = 0; i < 10; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (i * 6));
        const formattedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        // Price decreases as we go back in time (property appreciation)
        const price = property.price * (1 - (i * 0.03));
        
        // Market average price
        const marketPrice = price * (0.85 + (Math.random() * 0.2));
        
        priceHistory.unshift({
          date: formattedDate,
          price: Math.round(price),
          marketAverage: Math.round(marketPrice),
        });
      }

      // Regional comparison data
      const cities = [property.city];
      if (property.city !== "Seattle") cities.push("Seattle");
      if (property.city !== "Bellevue") cities.push("Bellevue");
      if (property.city !== "Redmond") cities.push("Redmond");
      if (property.city !== "Kirkland") cities.push("Kirkland");
      
      const propertyPrice = property.price / property.squareFeet;
      const regionalData = cities.map(city => {
        // Calculate a relative price per sq ft for each city
        let pricePerSqFt;
        if (city === property.city) {
          pricePerSqFt = propertyPrice;
        } else if (city === "Seattle") {
          pricePerSqFt = 450 + (Math.random() * 100);
        } else if (city === "Bellevue") {
          pricePerSqFt = 500 + (Math.random() * 150);
        } else if (city === "Redmond") {
          pricePerSqFt = 400 + (Math.random() * 100);
        } else if (city === "Kirkland") {
          pricePerSqFt = 425 + (Math.random() * 125);
        }
        
        return {
          city,
          pricePerSqFt: parseFloat(pricePerSqFt.toFixed(2)),
        };
      });

      // Seasonal trends data (quarterly)
      const seasons = ["Winter", "Spring", "Summer", "Fall"];
      const seasonalTrends = seasons.map(season => {
        // Different performance metrics by season
        let viewsMultiplier, inquiriesMultiplier, priceMultiplier;
        
        if (season === "Winter") {
          viewsMultiplier = 0.8;
          inquiriesMultiplier = 0.7;
          priceMultiplier = 0.97;
        } else if (season === "Spring") {
          viewsMultiplier = 1.2;
          inquiriesMultiplier = 1.3;
          priceMultiplier = 1.02;
        } else if (season === "Summer") {
          viewsMultiplier = 1.4;
          inquiriesMultiplier = 1.5;
          priceMultiplier = 1.04;
        } else { // Fall
          viewsMultiplier = 1.0;
          inquiriesMultiplier = 0.9;
          priceMultiplier = 1.0;
        }
        
        return {
          season,
          views: Math.round(30 * viewsMultiplier),
          inquiries: Math.round(5 * inquiriesMultiplier),
          priceChange: parseFloat((priceMultiplier - 1) * 100).toFixed(2),
        };
      });

      // Competitor analysis (similar properties in area)
      const competitorAnalysis = [];
      for (let i = 1; i <= 5; i++) {
        const priceFactor = 0.85 + (Math.random() * 0.3);
        const areaDiff = Math.random() < 0.5 ? -1 : 1;
        const areaPct = 0.9 + (Math.random() * 0.2);
        
        competitorAnalysis.push({
          id: i,
          price: Math.round(property.price * priceFactor),
          pricePerSqFt: Math.round((property.price * priceFactor) / (property.squareFeet * areaPct)),
          area: Math.round(property.squareFeet * areaPct),
          bedrooms: property.bedrooms + (areaDiff * (Math.random() < 0.7 ? 0 : 1)),
          bathrooms: property.bathrooms + (areaDiff * (Math.random() < 0.8 ? 0 : 0.5)),
          daysOnMarket: Math.floor(Math.random() * 60) + 5,
        });
      }

      // Comparison with market data
      const propertyType = property.propertyType ? property.propertyType : 'house';
      const marketComparison = [
        {
          name: 'Price',
          property: property.price,
          market: Math.round(property.price * (0.9 + (Math.random() * 0.2))),
        },
        {
          name: 'Price per sq ft',
          property: Math.round(property.price / property.squareFeet),
          market: Math.round((property.price * 0.95) / property.squareFeet),
        },
        {
          name: 'Days on market',
          property: Math.floor(Math.random() * 30) + 5,
          market: Math.floor(Math.random() * 45) + 15,
        },
        {
          name: 'Listing views',
          property: Math.floor(Math.random() * 300) + 100,
          market: Math.floor(Math.random() * 200) + 80,
        }
      ];

      // Calculate investment metrics
      const annualRent = property.price * 0.07; // 7% annual rent yield
      const monthlyRent = annualRent / 12;
      const expenses = annualRent * 0.4; // 40% for expenses
      const netOperatingIncome = annualRent - expenses;
      const downPayment = property.price * 0.25; // 25% down payment
      const totalInvestment = downPayment + (property.price * 0.03); // down payment + 3% closing costs
      
      const investmentMetrics = {
        roi: parseFloat((netOperatingIncome / property.price * 100).toFixed(2)),
        capRate: parseFloat((netOperatingIncome / property.price * 100).toFixed(2)),
        cashOnCash: parseFloat((netOperatingIncome / totalInvestment * 100).toFixed(2)),
        breakEvenPoint: parseFloat((property.price / (annualRent - expenses)).toFixed(2)),
        netOperatingIncome: Math.round(netOperatingIncome),
        grossRentMultiplier: parseFloat((property.price / annualRent).toFixed(2))
      };

      // Set the analytics data
      setAnalyticsData({
        viewsData,
        inquiriesData,
        conversionData,
        marketComparison,
        priceHistory,
        regionalData,
        rentalYield: parseFloat((annualRent / property.price * 100).toFixed(2)),
        propertyValue: property.price,
        valueChange: parseFloat((Math.random() * 8 + 4).toFixed(2)),
        occupancyRate: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        projectedIncome: Math.round(annualRent),
        seasonalTrends,
        competitorAnalysis,
        investmentMetrics
      });
    }
  }, [property]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-primary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <h1 className="text-2xl font-bold text-primary-800 mb-4">Property Not Found</h1>
            <p className="text-primary-600 mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Only property owners or users with premium subscriptions should access
  if (!isOwner && (!user || user.subscriptionTier !== 'premium')) {
    return (
      <div className="min-h-screen bg-primary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-primary-800 mb-4">Premium Feature</h1>
            <p className="text-primary-600 mb-6">
              Advanced analytics are only available to property owners or users with a premium subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/property/${id}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Return to Property
                </Button>
              </Link>
              <Link href="/subscription">
                <Button>
                  <TrendingUp className="mr-2 h-4 w-4" /> Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header with property info */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <Link href={`/property/${id}`}>
                <Button variant="outline" size="sm" className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Property
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-800 mb-1">{property.title}</h1>
              <p className="text-primary-600 flex flex-wrap items-center gap-1">
                <Home className="h-4 w-4" /> 
                {property.address}, {property.city}, {property.state} {property.zipCode}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
              <div className="text-2xl font-bold text-primary-800">
                {formatPrice(property.price)}
              </div>
              <div className="flex items-center text-primary-600 gap-1 mt-1">
                <Building className="h-4 w-4" />
                <span className="capitalize">{property.propertyType}</span>
                <span className="mx-1">•</span>
                <span>{property.squareFeet.toLocaleString()} sq ft</span>
              </div>
            </div>
          </div>

          {/* Analytics period selector and controls */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-primary-700 font-medium">Period:</span>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {analyticsPeriods.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center ml-4">
                <input
                  type="checkbox"
                  id="compareToMarket"
                  checked={compareToMarket}
                  onChange={() => setCompareToMarket(!compareToMarket)}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="compareToMarket" className="text-primary-600 text-sm">
                  Compare to market
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-1" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-1" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics dashboard tabs */}
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-primary-100 p-1 mb-4">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-white">
              Performance
            </TabsTrigger>
            <TabsTrigger value="market" className="data-[state=active]:bg-white">
              Market Analysis
            </TabsTrigger>
            <TabsTrigger value="investment" className="data-[state=active]:bg-white">
              Investment
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Property Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(analyticsData.propertyValue)}</div>
                  <div className="flex items-center mt-1">
                    {analyticsData.valueChange > 0 ? (
                      <>
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 text-sm">+{analyticsData.valueChange}% this year</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                        <span className="text-red-600 text-sm">{analyticsData.valueChange}% this year</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Rental Yield</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.rentalYield}%</div>
                  <div className="flex items-center mt-1">
                    <Info className="h-4 w-4 text-primary-400 mr-1" />
                    <span className="text-primary-500 text-sm">vs 4.8% market average</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Projected Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(analyticsData.projectedIncome)}/yr</div>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 text-primary-400 mr-1" />
                    <span className="text-primary-500 text-sm">{formatPrice(analyticsData.projectedIncome / 12)}/mo</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Occupancy Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.occupancyRate}%</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">+2.3% from last year</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Views</CardTitle>
                  <CardDescription>Daily views compared to market average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsData.viewsData}
                        margin={{
                          top: 10, right: 30, left: 0, bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" name="This Property" />
                        {compareToMarket && (
                          <Area type="monotone" dataKey="marketAverage" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Market Average" />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inquiries</CardTitle>
                  <CardDescription>User inquiries compared to market average</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.inquiriesData}
                        margin={{
                          top: 10, right: 30, left: 0, bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="inquiries" fill="#8884d8" name="This Property" />
                        {compareToMarket && (
                          <Bar dataKey="marketAverage" fill="#82ca9d" name="Market Average" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price history */}
            <Card>
              <CardHeader>
                <CardTitle>Price History</CardTitle>
                <CardDescription>Property value over time compared to market average</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.priceHistory}
                      margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatPrice(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" name="This Property" />
                      {compareToMarket && (
                        <Line type="monotone" dataKey="marketAverage" stroke="#82ca9d" name="Market Average" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Market comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Market Comparison</CardTitle>
                <CardDescription>How this property compares to the market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.marketComparison}
                      margin={{
                        top: 10, right: 30, left: 0, bottom: 0,
                      }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value, name) => name === 'property' ? value : value} />
                      <Legend />
                      <Bar dataKey="property" fill="#8884d8" name="This Property" />
                      <Bar dataKey="market" fill="#82ca9d" name="Market Average" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators for this property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Viewing Activity</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Daily views</span>
                            <span className="text-sm font-medium">32</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-primary-500 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Unique visitors</span>
                            <span className="text-sm font-medium">27</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-primary-500 rounded-full" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Saved as favorite</span>
                            <span className="text-sm font-medium">18</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-primary-500 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Conversion Metrics</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Inquiry rate</span>
                            <span className="text-sm font-medium">14.2%</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Tour requests</span>
                            <span className="text-sm font-medium">7.5%</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-primary-600">Application rate</span>
                            <span className="text-sm font-medium">3.8%</span>
                          </div>
                          <div className="w-full h-2 bg-primary-100 rounded-full">
                            <div className="h-2 bg-green-500 rounded-full" style={{ width: '22%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Visitor Demographics</h3>
                      <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'First-time', value: 60 },
                                { name: 'Returning', value: 25 },
                                { name: 'Agent', value: 15 },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {[
                                { name: 'First-time', value: 60 },
                                { name: 'Returning', value: 25 },
                                { name: 'Agent', value: 15 },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Conversion Rate</CardTitle>
                  <CardDescription>Views to inquiries conversion over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.conversionData}
                        margin={{
                          top: 10, right: 30, left: 0, bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Line type="monotone" dataKey="conversionRate" stroke="#8884d8" name="This Property" />
                        {compareToMarket && (
                          <Line type="monotone" dataKey="marketAverage" stroke="#82ca9d" name="Market Average" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visitor Sources</CardTitle>
                  <CardDescription>Where visitors come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Search', value: 40 },
                            { name: 'Direct', value: 20 },
                            { name: 'Social', value: 15 },
                            { name: 'Referral', value: 15 },
                            { name: 'Other', value: 10 },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Search', value: 40 },
                            { name: 'Direct', value: 20 },
                            { name: 'Social', value: 15 },
                            { name: 'Referral', value: 15 },
                            { name: 'Other', value: 10 },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Performance</CardTitle>
                <CardDescription>How this property performs across seasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Season</th>
                        <th className="text-left py-3 px-4 font-medium">Views (Daily Avg)</th>
                        <th className="text-left py-3 px-4 font-medium">Inquiries (Weekly)</th>
                        <th className="text-left py-3 px-4 font-medium">Price Change</th>
                        <th className="text-left py-3 px-4 font-medium">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.seasonalTrends.map((season) => (
                        <tr key={season.season} className="border-b">
                          <td className="py-3 px-4">{season.season}</td>
                          <td className="py-3 px-4">{season.views}</td>
                          <td className="py-3 px-4">{season.inquiries}</td>
                          <td className="py-3 px-4">
                            <span className={parseFloat(season.priceChange) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {parseFloat(season.priceChange) >= 0 ? '+' : ''}{season.priceChange}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {parseFloat(season.priceChange) > 2 ? (
                                <>
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">High</span>
                                </>
                              ) : parseFloat(season.priceChange) >= 0 ? (
                                <>
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Normal</span>
                                </>
                              ) : (
                                <>
                                  <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Low</span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Regional Price Comparison</CardTitle>
                  <CardDescription>Price per sq ft in different cities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.regionalData}
                        margin={{
                          top: 10, right: 30, left: 0, bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="city" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}/sq ft`} />
                        <Legend />
                        <Bar dataKey="pricePerSqFt" fill="#8884d8" name="Price per Sq Ft" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Trends</CardTitle>
                  <CardDescription>Market changes over time in {property.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[
                          { month: 'Jan', inventory: 120, avgDays: 32, medianPrice: property.price * 0.93 },
                          { month: 'Feb', inventory: 118, avgDays: 30, medianPrice: property.price * 0.95 },
                          { month: 'Mar', inventory: 130, avgDays: 28, medianPrice: property.price * 0.96 },
                          { month: 'Apr', inventory: 145, avgDays: 25, medianPrice: property.price * 0.97 },
                          { month: 'May', inventory: 160, avgDays: 21, medianPrice: property.price * 0.98 },
                          { month: 'Jun', inventory: 175, avgDays: 18, medianPrice: property.price * 0.99 },
                          { month: 'Jul', inventory: 170, avgDays: 16, medianPrice: property.price * 1.0 },
                          { month: 'Aug', inventory: 155, avgDays: 15, medianPrice: property.price * 1.01 },
                          { month: 'Sep', inventory: 140, avgDays: 17, medianPrice: property.price * 1.02 },
                          { month: 'Oct', inventory: 125, avgDays: 20, medianPrice: property.price * 1.01 },
                          { month: 'Nov', inventory: 115, avgDays: 24, medianPrice: property.price * 1.0 },
                          { month: 'Dec', inventory: 110, avgDays: 29, medianPrice: property.price * 0.99 },
                        ]}
                        margin={{
                          top: 10, right: 30, left: 0, bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip formatter={(value, name) => {
                          if (name === 'medianPrice') return formatPrice(value);
                          return value;
                        }} />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="inventory" stroke="#8884d8" name="Inventory" />
                        <Line yAxisId="left" type="monotone" dataKey="avgDays" stroke="#ff7300" name="Avg Days on Market" />
                        <Line yAxisId="right" type="monotone" dataKey="medianPrice" stroke="#82ca9d" name="Median Price" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
                <CardDescription>Similar properties in the area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Property</th>
                        <th className="text-left py-3 px-4 font-medium">Price</th>
                        <th className="text-left py-3 px-4 font-medium">$/sq ft</th>
                        <th className="text-left py-3 px-4 font-medium">Area</th>
                        <th className="text-left py-3 px-4 font-medium">Beds/Baths</th>
                        <th className="text-left py-3 px-4 font-medium">Days on Market</th>
                        <th className="text-left py-3 px-4 font-medium">Comparison</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary-50">
                        <td className="py-3 px-4 font-medium">This property</td>
                        <td className="py-3 px-4">{formatPrice(property.price)}</td>
                        <td className="py-3 px-4">${Math.round(property.price / property.squareFeet)}</td>
                        <td className="py-3 px-4">{property.squareFeet.toLocaleString()} sq ft</td>
                        <td className="py-3 px-4">{property.bedrooms}/{property.bathrooms}</td>
                        <td className="py-3 px-4">28</td>
                        <td className="py-3 px-4">-</td>
                      </tr>
                      {analyticsData.competitorAnalysis.map((competitor) => (
                        <tr key={competitor.id} className="border-b">
                          <td className="py-3 px-4">Property #{competitor.id}</td>
                          <td className="py-3 px-4">
                            {formatPrice(competitor.price)}
                            <span className={`ml-2 text-xs ${competitor.price < property.price ? 'text-red-600' : 'text-green-600'}`}>
                              {competitor.price < property.price ? 
                                `-${Math.round((1 - competitor.price / property.price) * 100)}%` : 
                                `+${Math.round((competitor.price / property.price - 1) * 100)}%`}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            ${competitor.pricePerSqFt}
                            <span className={`ml-2 text-xs ${competitor.pricePerSqFt < (property.price / property.squareFeet) ? 'text-red-600' : 'text-green-600'}`}>
                              {competitor.pricePerSqFt < (property.price / property.squareFeet) ? 
                                `-${Math.round((1 - competitor.pricePerSqFt / (property.price / property.squareFeet)) * 100)}%` : 
                                `+${Math.round((competitor.pricePerSqFt / (property.price / property.squareFeet) - 1) * 100)}%`}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {competitor.area.toLocaleString()} sq ft
                            <span className={`ml-2 text-xs ${competitor.area < property.squareFeet ? 'text-red-600' : 'text-green-600'}`}>
                              {competitor.area < property.squareFeet ? 
                                `-${Math.round((1 - competitor.area / property.squareFeet) * 100)}%` : 
                                `+${Math.round((competitor.area / property.squareFeet - 1) * 100)}%`}
                            </span>
                          </td>
                          <td className="py-3 px-4">{competitor.bedrooms}/{competitor.bathrooms}</td>
                          <td className="py-3 px-4">{competitor.daysOnMarket}</td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={competitor.price / competitor.area < property.price / property.squareFeet ? 
                                'bg-red-100 text-red-800 hover:bg-red-100' : 
                                'bg-green-100 text-green-800 hover:bg-green-100'}
                            >
                              {competitor.price / competitor.area < property.price / property.squareFeet ? 
                                'Better value' : 'Your advantage'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Local Market Insights</CardTitle>
                  <CardDescription>For {property.city}, {property.state}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Median Home Price</span>
                      <span className="font-medium">{formatPrice(property.price * 0.97)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Price Change (YoY)</span>
                      <span className="font-medium text-green-600">+4.2%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Homes Sold (Last Month)</span>
                      <span className="font-medium">127</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Median Days on Market</span>
                      <span className="font-medium">21 days</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Sale-to-List Ratio</span>
                      <span className="font-medium">98.3%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Price per Square Foot</span>
                      <span className="font-medium">${Math.round((property.price * 0.97) / property.squareFeet)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-700">Market Temperature</span>
                      <span className="font-medium text-amber-600">Slightly Warm</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Forecast</CardTitle>
                  <CardDescription>12-month prediction for {property.city}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Price Forecast (Next 12 Months)</span>
                      <span className="font-medium text-green-600">+5.8%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Rental Yield Forecast</span>
                      <span className="font-medium">Stable</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Market Liquidity</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Inventory Projection</span>
                      <span className="font-medium text-amber-600">-2.3%</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Demand Trend</span>
                      <span className="font-medium text-green-600">Increasing</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-primary-700">Mortgage Rate Forecast</span>
                      <span className="font-medium">Stable</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-700">Market Confidence Score</span>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">8.2/10</span>
                        <HelpCircle className="h-4 w-4 text-primary-400" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Return on Investment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.investmentMetrics.roi}%</div>
                  <div className="flex items-center mt-1">
                    <Percent className="h-4 w-4 text-primary-400 mr-1" />
                    <span className="text-primary-500 text-sm">Annual ROI</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Cap Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.investmentMetrics.capRate}%</div>
                  <div className="flex items-center mt-1">
                    <Info className="h-4 w-4 text-primary-400 mr-1" />
                    <span className="text-primary-500 text-sm">vs 4.5% market average</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium text-primary-600">Cash on Cash Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.investmentMetrics.cashOnCash}%</div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600 text-sm">Above market average</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Cash Flow Analysis</CardTitle>
                  <CardDescription>Detailed monthly income and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Income</h3>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Rental Income</span>
                        <span className="font-medium">{formatPrice(analyticsData.projectedIncome / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Other Income</span>
                        <span className="font-medium">{formatPrice(analyticsData.projectedIncome * 0.05 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b font-medium">
                        <span className="text-primary-800">Total Income</span>
                        <span className="text-primary-800">{formatPrice((analyticsData.projectedIncome * 1.05) / 12)}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Expenses</h3>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Mortgage</span>
                        <span className="font-medium">{formatPrice(property.price * 0.004)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Property Taxes</span>
                        <span className="font-medium">{formatPrice(property.price * 0.008 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Insurance</span>
                        <span className="font-medium">{formatPrice(property.price * 0.004 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Maintenance</span>
                        <span className="font-medium">{formatPrice(property.price * 0.005 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Property Management</span>
                        <span className="font-medium">{formatPrice(analyticsData.projectedIncome * 0.08 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-primary-700">Vacancy Reserve</span>
                        <span className="font-medium">{formatPrice(analyticsData.projectedIncome * 0.05 / 12)}</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b font-medium">
                        <span className="text-primary-800">Total Expenses</span>
                        <span className="text-primary-800">{formatPrice((property.price * 0.021 / 12) + (analyticsData.projectedIncome * 0.13 / 12))}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 font-bold">
                      <span className="text-primary-900">Monthly Cash Flow</span>
                      <span className={((analyticsData.projectedIncome * 1.05) / 12) - ((property.price * 0.021 / 12) + (analyticsData.projectedIncome * 0.13 / 12)) > 0 ? 
                        "text-green-600" : "text-red-600"}>
                        {formatPrice(((analyticsData.projectedIncome * 1.05) / 12) - ((property.price * 0.021 / 12) + (analyticsData.projectedIncome * 0.13 / 12)))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Metrics</CardTitle>
                  <CardDescription>Advanced financial metrics for this property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Net Operating Income (Annual)</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">{formatPrice(analyticsData.investmentMetrics.netOperatingIncome)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Gross Rent Multiplier</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">{analyticsData.investmentMetrics.grossRentMultiplier}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Break-even Ratio</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">72%</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Break-even Occupancy</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">68%</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Debt Service Coverage Ratio</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">1.35</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Cash Required</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium">{formatPrice(property.price * 0.28)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pb-2 border-b">
                      <div className="flex items-center">
                        <span className="text-primary-700">Annual Appreciation (Projected)</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium text-green-600">+3.2%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-primary-700">Total Return (5-yr Projection)</span>
                        <HelpCircle className="h-4 w-4 text-primary-400 ml-1" />
                      </div>
                      <span className="font-medium text-green-600">+47.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Long-term Investment Projection</CardTitle>
                <CardDescription>5-year financial outlook for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Metric</th>
                        <th className="text-left py-3 px-4 font-medium">Year 1</th>
                        <th className="text-left py-3 px-4 font-medium">Year 2</th>
                        <th className="text-left py-3 px-4 font-medium">Year 3</th>
                        <th className="text-left py-3 px-4 font-medium">Year 4</th>
                        <th className="text-left py-3 px-4 font-medium">Year 5</th>
                        <th className="text-left py-3 px-4 font-medium">5-yr Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Property Value</td>
                        <td className="py-3 px-4">{formatPrice(property.price)}</td>
                        <td className="py-3 px-4">{formatPrice(property.price * 1.032)}</td>
                        <td className="py-3 px-4">{formatPrice(property.price * 1.032 * 1.032)}</td>
                        <td className="py-3 px-4">{formatPrice(property.price * 1.032 * 1.032 * 1.032)}</td>
                        <td className="py-3 px-4">{formatPrice(property.price * 1.032 * 1.032 * 1.032 * 1.032)}</td>
                        <td className="py-3 px-4 text-green-600">+{Math.round((Math.pow(1.032, 5) - 1) * 100)}%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Annual Rental Income</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 1.025 * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(
                          analyticsData.projectedIncome + 
                          analyticsData.projectedIncome * 1.025 + 
                          analyticsData.projectedIncome * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 1.025 * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 1.025 * 1.025 * 1.025 * 1.025
                        )}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Annual Expenses</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.4)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.4 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.4 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.4 * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.4 * 1.025 * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(
                          analyticsData.projectedIncome * 0.4 + 
                          analyticsData.projectedIncome * 0.4 * 1.025 + 
                          analyticsData.projectedIncome * 0.4 * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 0.4 * 1.025 * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 0.4 * 1.025 * 1.025 * 1.025 * 1.025
                        )}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Net Operating Income</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025)}</td>
                        <td className="py-3 px-4">{formatPrice(
                          analyticsData.projectedIncome * 0.6 + 
                          analyticsData.projectedIncome * 0.6 * 1.025 + 
                          analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 + 
                          analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025
                        )}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Cash Flow (After Mortgage)</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 - property.price * 0.048)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 - property.price * 0.048)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 - property.price * 0.048)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 - property.price * 0.048)}</td>
                        <td className="py-3 px-4">{formatPrice(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025 - property.price * 0.048)}</td>
                        <td className="py-3 px-4">{formatPrice(
                          (analyticsData.projectedIncome * 0.6 - property.price * 0.048) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 - property.price * 0.048) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 - property.price * 0.048) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 - property.price * 0.048) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025 - property.price * 0.048)
                        )}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4 font-medium">Return on Investment</td>
                        <td className="py-3 px-4 text-green-600">{(analyticsData.projectedIncome * 0.6 / property.price * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-green-600">{(analyticsData.projectedIncome * 0.6 * 1.025 / property.price * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-green-600">{(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 / property.price * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-green-600">{(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 / property.price * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-green-600">{(analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025 / property.price * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-green-600">{(
                          ((analyticsData.projectedIncome * 0.6) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025) + 
                          (analyticsData.projectedIncome * 0.6 * 1.025 * 1.025 * 1.025 * 1.025)) / 
                          property.price * 100
                        ).toFixed(2)}%</td>
                      </tr>
                      <tr className="border-b bg-primary-50">
                        <td className="py-3 px-4 font-bold text-primary-800">Total ROI (Incl. Appreciation)</td>
                        <td className="py-3 px-4 font-bold text-green-600">8.92%</td>
                        <td className="py-3 px-4 font-bold text-green-600">9.26%</td>
                        <td className="py-3 px-4 font-bold text-green-600">9.62%</td>
                        <td className="py-3 px-4 font-bold text-green-600">9.99%</td>
                        <td className="py-3 px-4 font-bold text-green-600">10.38%</td>
                        <td className="py-3 px-4 font-bold text-green-600">47.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-primary-500 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5" />
                  <span>Projections assume 3.2% annual property appreciation and 2.5% annual rent increases. Calculations are based on estimated market conditions and may vary.</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}