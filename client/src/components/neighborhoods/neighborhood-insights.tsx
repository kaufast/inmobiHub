import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  School,
  ShoppingCart,
  Car,
  HeartPulse,
  Users,
  Lightbulb,
  AlertTriangle,
  Shield,
  Home,
  Utensils
} from 'lucide-react';
// Use our own Progress component at the bottom instead of this import
// import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from '@tanstack/react-query';

interface NeighborhoodInsightsProps {
  neighborhoodId?: number;
  city: string;
  state: string;
}

interface InsightStat {
  label: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  info?: string;
  color: string;
}

interface PriceData {
  date: string;
  value: number;
}

interface SchoolData {
  name: string;
  rating: number;
  type: string;
  distance: number;
}

export default function NeighborhoodInsights({ neighborhoodId, city, state }: NeighborhoodInsightsProps) {
  const [activeTab, setActiveTab] = useState('market');
  const { user } = useAuth();
  
  // Check if user has premium access
  const hasPremiumAccess = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise' || user?.role === 'agent' || user?.role === 'admin';

  // In a production app, this would fetch from the API using the neighborhoodId
  const { isLoading, error, data: neighborhoodData } = useQuery({
    queryKey: ['/api/neighborhood/insights', neighborhoodId || `${city}-${state}`],
    queryFn: async () => {
      // Simulate API fetch with a timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateNeighborhoodInsights(city, state));
        }, 1000);
      });
    }
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-medium flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Error loading neighborhood insights
        </h3>
        <p className="mt-2 text-sm">Unable to retrieve neighborhood data at this time.</p>
      </div>
    );
  }

  const insights = neighborhoodData as any;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">
            {insights.name}
          </h2>
          <p className="text-primary-600">
            {insights.city}, {insights.state}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {insights.tags.map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="market" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="livability">Livability</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="market" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-500" />
                  Market Overview
                </CardTitle>
                <CardDescription>
                  Current real estate market statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Median Home Price"
                    value={insights.market.medianPrice}
                    formatter="currency"
                    change={insights.market.priceChange}
                    info="Year-over-year change in median home price"
                  />
                  <StatItem
                    label="Price per Sq. Ft."
                    value={insights.market.pricePerSqFt}
                    formatter="currency"
                    change={insights.market.pricePerSqFtChange}
                    info="Year-over-year change in price per square foot"
                  />
                  <StatItem
                    label="Days on Market"
                    value={insights.market.daysOnMarket}
                    formatter="number"
                    change={-insights.market.daysOnMarketChange}
                    info="Average number of days properties stay on the market"
                    reverseColors={true}
                  />
                  <StatItem
                    label="Sale-to-List Ratio"
                    value={insights.market.saleToListRatio}
                    formatter="percentage"
                    change={insights.market.saleToListRatioChange}
                    info="Percentage of listing price that sellers receive"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
                  Market Trends
                </CardTitle>
                <CardDescription>
                  Historical and forecasted market data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Appreciation Rate (5y)"
                    value={insights.market.appreciationRate5y}
                    formatter="percentage"
                    info="Five-year home value appreciation rate"
                  />
                  <StatItem
                    label="Forecasted Growth (1y)"
                    value={insights.market.forecastedGrowth}
                    formatter="percentage"
                    info="Projected growth rate for next 12 months"
                  />
                  <StatItem
                    label="Housing Inventory"
                    value={insights.market.inventory}
                    formatter="number"
                    change={insights.market.inventoryChange}
                    info="Number of homes currently on the market"
                  />
                  <StatItem
                    label="Market Temperature"
                    value={insights.market.marketHeatIndex / 10}
                    formatter="custom"
                    customDisplay={
                      <div className="w-full space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-blue-600">Cold</span>
                          <span className="text-xs text-red-600">Hot</span>
                        </div>
                        <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-full relative">
                          <div 
                            className="absolute w-3 h-3 bg-white rounded-full shadow border border-gray-300 -mt-0.5"
                            style={{ 
                              left: `calc(${insights.market.marketHeatIndex * 10}% - 6px)`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-center mt-1 text-primary-600">
                          {insights.market.marketHeatIndex < 3 ? 'Buyer\'s Market' : 
                           insights.market.marketHeatIndex > 7 ? 'Seller\'s Market' : 
                           'Balanced Market'}
                        </div>
                      </div>
                    }
                    info="Market competition level from cold (buyer's market) to hot (seller's market)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="livability" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary-500" />
                  Livability Scores
                </CardTitle>
                <CardDescription>
                  Quality of life indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {Object.entries(insights.livability.scores).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium capitalize text-primary-700">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-sm font-bold">{value}/10</span>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p className="text-xs">{getCategoryDescription(key)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Progress value={value * 10} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <HeartPulse className="h-5 w-5 mr-2 text-primary-500" />
                  Demographics & Lifestyle
                </CardTitle>
                <CardDescription>
                  Community characteristics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Population"
                    value={insights.livability.demographics.population}
                    formatter="number"
                    info="Total population"
                  />
                  <StatItem
                    label="Median Age"
                    value={insights.livability.demographics.medianAge}
                    formatter="number"
                    info="Median age of residents"
                    unit="years"
                  />
                  <StatItem
                    label="Median Household Income"
                    value={insights.livability.demographics.medianIncome}
                    formatter="currency"
                    info="Median annual household income"
                  />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-primary-700">
                        Resident Types
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(insights.livability.demographics.residentTypes).map(([type, percentage]: [string, any]) => (
                        <div key={type} className="flex items-center text-xs rounded-full px-2 py-1 bg-primary-50">
                          <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="ml-auto font-medium">{(percentage * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schools" className="mt-0">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <School className="h-5 w-5 mr-2 text-primary-500" />
                  Nearby Schools
                </CardTitle>
                <CardDescription>
                  Educational institutions in the area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.schools.map((school: SchoolData, idx: number) => (
                    <div key={idx} className="border-b border-gray-200 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-primary-800">{school.name}</h4>
                          <p className="text-sm text-primary-600">{school.type} • {school.distance} mi away</p>
                        </div>
                        <div className="flex items-center bg-primary-50 rounded-full px-3 py-1">
                          <span className="font-bold text-primary-700 mr-1">{school.rating}</span>
                          <span className="text-xs text-primary-600">/10</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary-500" />
                  Education Statistics
                </CardTitle>
                <CardDescription>
                  School district performance data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="District Rating"
                    value={insights.education.districtRating}
                    formatter="custom"
                    customDisplay={
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg 
                            key={i} 
                            className={`h-5 w-5 ${i < Math.round(insights.education.districtRating / 2) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    }
                    info="Overall rating for the school district"
                  />
                  <StatItem
                    label="Student-Teacher Ratio"
                    value={insights.education.studentTeacherRatio}
                    formatter="ratio"
                    info="Average number of students per teacher"
                  />
                  <StatItem
                    label="Graduation Rate"
                    value={insights.education.graduationRate}
                    formatter="percentage"
                    info="Percentage of students who graduate"
                  />
                  <StatItem
                    label="College Bound"
                    value={insights.education.collegeBoundRate}
                    formatter="percentage"
                    info="Percentage of students who go on to college"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="amenities" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-primary-500" />
                  Shopping & Dining
                </CardTitle>
                <CardDescription>
                  Retail and restaurant options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Restaurants"
                    value={insights.amenities.restaurants}
                    formatter="number"
                    info="Number of restaurants within 1 mile"
                  />
                  <StatItem
                    label="Grocery Stores"
                    value={insights.amenities.groceryStores}
                    formatter="number"
                    info="Number of grocery stores within 1 mile"
                  />
                  <StatItem
                    label="Shopping Centers"
                    value={insights.amenities.shoppingCenters}
                    formatter="number"
                    info="Number of shopping centers within 3 miles"
                  />
                  <div className="pt-1">
                    <h4 className="text-sm font-medium text-primary-700 mb-2">Popular Places</h4>
                    <div className="space-y-2">
                      {insights.amenities.popularPlaces.slice(0, 3).map((place: string, idx: number) => (
                        <div key={idx} className="flex items-center text-primary-600 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary-500 mr-2"></div>
                          {place}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Car className="h-5 w-5 mr-2 text-primary-500" />
                  Transportation
                </CardTitle>
                <CardDescription>
                  Commuting and transit options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Walk Score"
                    value={insights.transportation.walkScore}
                    formatter="score"
                    info="Walkability rating out of 100"
                  />
                  <StatItem
                    label="Transit Score"
                    value={insights.transportation.transitScore}
                    formatter="score"
                    info="Public transportation access rating"
                  />
                  <StatItem
                    label="Bike Score"
                    value={insights.transportation.bikeScore}
                    formatter="score"
                    info="Biking-friendly rating"
                  />
                  <StatItem
                    label="Avg. Commute Time"
                    value={insights.transportation.averageCommute}
                    formatter="number"
                    unit="min"
                    info="Average commute time to work"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-primary-500" />
                  Safety & Health
                </CardTitle>
                <CardDescription>
                  Crime statistics and healthcare access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatItem
                    label="Crime Rate"
                    value={insights.safety.crimeRate / 10}
                    formatter="custom"
                    customDisplay={
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-xs text-primary-600">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                        <Progress 
                          value={insights.safety.crimeRate * 10} 
                          className="h-2"
                          indicatorClassName={`${insights.safety.crimeRate > 7 ? 'bg-red-500' : 
                                                 insights.safety.crimeRate > 4 ? 'bg-yellow-500' : 
                                                 'bg-green-500'}`}
                        />
                        <div className="text-xs mt-1 text-primary-600">
                          {insights.safety.crimeRate < 3 ? 'Lower than average' : 
                           insights.safety.crimeRate > 7 ? 'Higher than average' : 
                           'Average'}
                        </div>
                      </div>
                    }
                    info="Crime rate compared to national average"
                  />
                  <StatItem
                    label="Police Stations"
                    value={insights.safety.policeStations}
                    formatter="number"
                    info="Number of police stations within 3 miles"
                  />
                  <StatItem
                    label="Hospitals"
                    value={insights.safety.hospitals}
                    formatter="number"
                    info="Number of hospitals within 5 miles"
                  />
                  <StatItem
                    label="Healthcare Facilities"
                    value={insights.safety.healthcareFacilities}
                    formatter="number"
                    info="Number of clinics and healthcare facilities"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Premium Features Section with Accordion */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary-800 flex items-center gap-2">
            Premium Data Insights
            <Badge className="bg-secondary-500 hover:bg-secondary-600 text-white">
              Premium
            </Badge>
          </h3>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* Investment Insights */}
          <AccordionItem value="investment" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-primary-50 hover:bg-primary-100 data-[state=open]:bg-primary-100">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
                <span className="font-semibold">Investment Insights</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3">
              {hasPremiumAccess ? (
                <div className="space-y-4">
                  <p className="text-sm text-primary-700 mb-4">
                    Advanced metrics for real estate investors with historical performance and future projections.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Investment Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <StatItem
                          label="Cap Rate"
                          value={0.052}
                          formatter="percentage"
                          info="Average capitalization rate for rental properties"
                        />
                        <StatItem
                          label="Price-to-Rent Ratio"
                          value={18.3}
                          formatter="number"
                          info="Ratio of home prices to annual rental income"
                        />
                        <StatItem
                          label="Cash-on-Cash Return"
                          value={0.073}
                          formatter="percentage"
                          info="Average annual cash return on investment"
                        />
                        <StatItem
                          label="Avg. Rental Yield"
                          value={0.048}
                          formatter="percentage"
                          info="Average rental income as percentage of property value"
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Stability</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <StatItem
                          label="Rental Vacancy Rate"
                          value={0.032}
                          formatter="percentage"
                          info="Percentage of rental units currently vacant"
                        />
                        <StatItem
                          label="Market Volatility"
                          value={3.2}
                          formatter="score"
                          info="Rating of price stability (1=volatile, 10=stable)"
                          unit="/10"
                        />
                        <StatItem
                          label="Price Recovery"
                          value={12}
                          formatter="number"
                          info="Months to recover after market corrections"
                          unit=" months"
                        />
                        <StatItem
                          label="Rental Demand"
                          value={8.4}
                          formatter="score"
                          info="Rating of rental demand (1=low, 10=high)"
                          unit="/10"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary-300" />
                  <h3 className="text-lg font-medium text-primary-800 mb-2">Premium Feature</h3>
                  <p className="text-sm text-primary-600 max-w-md mx-auto mb-4">
                    Unlock detailed investment insights including cap rates, rental yields, price-to-rent ratios, and market stability metrics.
                  </p>
                  <a href="/auth" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Upgrade to Premium
                  </a>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          
          {/* Broker & Agent Insights */}
          <AccordionItem value="broker" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 bg-primary-50 hover:bg-primary-100 data-[state=open]:bg-primary-100">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-500" />
                <span className="font-semibold">Broker & Agent Insights</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-3">
              {hasPremiumAccess ? (
                <div className="space-y-4">
                  <p className="text-sm text-primary-700 mb-4">
                    Valuable insights for real estate professionals to better serve clients and identify opportunities.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Client Targeting</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <StatItem
                          label="Buyer Demographics"
                          value={0}
                          formatter="custom"
                          customDisplay={
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {['Young Professionals', 'Families', 'Retirees', 'Investors'].map((type) => (
                                <div key={type} className="flex items-center text-xs rounded-full px-2 py-1 bg-primary-50">
                                  <span>{type}</span>
                                  <span className="ml-auto font-medium">{Math.floor(Math.random() * 30 + 10)}%</span>
                                </div>
                              ))}
                            </div>
                          }
                          info="Breakdown of typical buyers in this neighborhood"
                        />
                        <StatItem
                          label="Avg. Sales Cycle"
                          value={45}
                          formatter="number"
                          info="Average days from listing to close"
                          unit=" days"
                        />
                        <StatItem
                          label="Commission Potential"
                          value={8.7}
                          formatter="score"
                          info="Rating based on property values and turnover (1=low, 10=high)"
                          unit="/10"
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Opportunity Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <StatItem
                          label="Turnover Rate"
                          value={0.068}
                          formatter="percentage"
                          info="Annual percentage of properties sold"
                        />
                        <StatItem
                          label="Developer Activity"
                          value={7.2}
                          formatter="score"
                          info="Rating of new development and renovation activity (1=low, 10=high)"
                          unit="/10"
                        />
                        <StatItem
                          label="Exclusive Listings"
                          value={18}
                          formatter="number"
                          info="Current number of exclusive listings in this area"
                        />
                        <StatItem
                          label="Agent Saturation"
                          value={4.3}
                          formatter="score"
                          info="Rating of competition among agents (1=low, 10=high)"
                          unit="/10"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-primary-300" />
                  <h3 className="text-lg font-medium text-primary-800 mb-2">Premium Feature</h3>
                  <p className="text-sm text-primary-600 max-w-md mx-auto mb-4">
                    Unlock professional insights for real estate agents including client demographics, commission potential, turnover rates, and competitive analysis.
                  </p>
                  <a href="/auth" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Upgrade to Premium
                  </a>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

// Helper components
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: number;
  formatter: 'currency' | 'percentage' | 'number' | 'score' | 'ratio' | 'custom';
  change?: number;
  info?: string;
  unit?: string;
  reverseColors?: boolean;
  customDisplay?: React.ReactNode;
}

function StatItem({ 
  label, 
  value, 
  formatter, 
  change, 
  info, 
  unit = '',
  reverseColors = false,
  customDisplay 
}: StatItemProps) {
  const formattedValue = formatValue(value, formatter, unit);
  
  return (
    <div className="flex justify-between items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="text-sm font-medium text-primary-700 cursor-help">
              {label}
            </label>
          </TooltipTrigger>
          {info && (
            <TooltipContent side="top" align="start">
              <p className="text-xs">{info}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <div className="flex items-center">
        {change !== undefined && (
          <div 
            className={`text-xs mr-2 flex items-center ${
              change === 0 
                ? 'text-gray-500' 
                : change > 0 
                  ? (reverseColors ? 'text-red-500' : 'text-green-500')
                  : (reverseColors ? 'text-green-500' : 'text-red-500')
            }`}
          >
            {change > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {Math.abs(change).toFixed(1)}%
              </>
            ) : change < 0 ? (
              <>
                <svg className="h-3 w-3 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 18l-9.5-9.5-5 5L1 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {Math.abs(change).toFixed(1)}%
              </>
            ) : (
              <>—</>
            )}
          </div>
        )}
        
        {customDisplay || (
          <div className="font-bold text-primary-800">{formattedValue}</div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function formatValue(value: number, formatter: string, unit: string): string {
  switch (formatter) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`;
    case 'score':
      return `${value}/100`;
    case 'ratio':
      return value.toFixed(1) + ':1';
    case 'number':
      return value.toLocaleString() + (unit ? ` ${unit}` : '');
    default:
      return value.toString() + (unit ? ` ${unit}` : '');
  }
}

function getCategoryDescription(category: string): string {
  const descriptions: {[key: string]: string} = {
    overall: "Overall livability score incorporating all factors",
    safety: "Crime rates and safety indicators compared to national averages",
    education: "Quality of schools and academic achievement metrics",
    housing: "Housing affordability and market conditions",
    costOfLiving: "Affordability of goods, services, and tax rates",
    nightlife: "Entertainment venues, restaurants, and nighttime activities",
    familyFriendly: "Kid-friendly amenities, parks, and community resources",
    diversity: "Demographic diversity across age, ethnicity, and income levels",
    jobMarket: "Employment opportunities and local economic health"
  };
  
  return descriptions[category] || "Rating out of 10";
}

// This function simulates neighborhood data for demo purposes
// In a real implementation, this would be fetched from an API
function generateNeighborhoodInsights(city: string, state: string): any {
  const neighborhoods = [
    {
      name: "Polanco",
      city: "Mexico City",
      state: "CDMX",
      tags: ["Upscale", "Urban", "Trendy", "International"],
      market: {
        medianPrice: 850000,
        priceChange: 8.5,
        pricePerSqFt: 450,
        pricePerSqFtChange: 6.2,
        daysOnMarket: 25,
        daysOnMarketChange: 15,
        saleToListRatio: 0.97,
        saleToListRatioChange: 0.5,
        appreciationRate5y: 0.38,
        forecastedGrowth: 0.062,
        inventory: 142,
        inventoryChange: -8.3,
        marketHeatIndex: 8.2,
      },
      livability: {
        scores: {
          overall: 8.6,
          safety: 8.2,
          education: 8.0,
          housing: 6.5,
          costOfLiving: 5.8,
          nightlife: 9.2,
          familyFriendly: 7.4,
          diversity: 7.8,
          jobMarket: 8.3
        },
        demographics: {
          population: 28000,
          medianAge: 34,
          medianIncome: 85000,
          residentTypes: {
            youngProfessionals: 0.45,
            families: 0.25,
            retirees: 0.10,
            students: 0.20
          }
        }
      },
      schools: [
        { name: "American School Foundation", rating: 9.5, type: "Private", distance: 0.7 },
        { name: "Colegio Peterson", rating: 9.1, type: "Private", distance: 0.9 },
        { name: "Greengates School", rating: 8.7, type: "Private International", distance: 1.5 },
        { name: "Escuela Primaria Benito Juárez", rating: 7.2, type: "Public", distance: 1.8 }
      ],
      education: {
        districtRating: 8.2,
        studentTeacherRatio: 14.2,
        graduationRate: 0.91,
        collegeBoundRate: 0.83
      },
      amenities: {
        restaurants: 87,
        groceryStores: 12,
        shoppingCenters: 5,
        popularPlaces: [
          "Antara Fashion Hall",
          "Presidente Masaryk Avenue",
          "Inbursa Aquarium",
          "Jumex Museum",
          "Soumaya Museum"
        ]
      },
      transportation: {
        walkScore: 85,
        transitScore: 76,
        bikeScore: 68,
        averageCommute: 24
      },
      safety: {
        crimeRate: 3.2,
        policeStations: 3,
        hospitals: 4,
        healthcareFacilities: 18
      }
    },
    {
      name: "Condesa",
      city: "Mexico City",
      state: "CDMX",
      tags: ["Bohemian", "Trendy", "Art Deco", "Hip"],
      market: {
        medianPrice: 620000,
        priceChange: 9.3,
        pricePerSqFt: 385,
        pricePerSqFtChange: 7.8,
        daysOnMarket: 22,
        daysOnMarketChange: 18,
        saleToListRatio: 0.98,
        saleToListRatioChange: 0.8,
        appreciationRate5y: 0.42,
        forecastedGrowth: 0.073,
        inventory: 165,
        inventoryChange: -12.5,
        marketHeatIndex: 8.7,
      },
      livability: {
        scores: {
          overall: 8.9,
          safety: 7.8,
          education: 7.5,
          housing: 6.2,
          costOfLiving: 6.3,
          nightlife: 9.5,
          familyFriendly: 7.0,
          diversity: 8.2,
          jobMarket: 8.1
        },
        demographics: {
          population: 32000,
          medianAge: 31,
          medianIncome: 72000,
          residentTypes: {
            youngProfessionals: 0.52,
            families: 0.20,
            retirees: 0.08,
            students: 0.20
          }
        }
      },
      schools: [
        { name: "Colegio Madrid", rating: 8.8, type: "Private", distance: 0.8 },
        { name: "Escuela Luis G. Basurto", rating: 7.6, type: "Public", distance: 1.2 },
        { name: "Instituto Thomas Jefferson", rating: 8.4, type: "Private", distance: 1.6 },
        { name: "Centro Educativo Doños", rating: 7.8, type: "Private", distance: 1.9 }
      ],
      education: {
        districtRating: 7.6,
        studentTeacherRatio: 15.4,
        graduationRate: 0.87,
        collegeBoundRate: 0.79
      },
      amenities: {
        restaurants: 112,
        groceryStores: 9,
        shoppingCenters: 3,
        popularPlaces: [
          "Parque México",
          "Avenida Amsterdam",
          "Condesa DF Hotel",
          "El Pendulo Bookstore",
          "Mercado Michoacán"
        ]
      },
      transportation: {
        walkScore: 92,
        transitScore: 82,
        bikeScore: 79,
        averageCommute: 22
      },
      safety: {
        crimeRate: 4.1,
        policeStations: 2,
        hospitals: 3,
        healthcareFacilities: 14
      }
    },
    {
      name: "Roma Norte",
      city: "Mexico City",
      state: "CDMX",
      tags: ["Artistic", "Historic", "Culinary", "Cultural"],
      market: {
        medianPrice: 580000,
        priceChange: 10.2,
        pricePerSqFt: 365,
        pricePerSqFtChange: 8.1,
        daysOnMarket: 20,
        daysOnMarketChange: 22,
        saleToListRatio: 0.99,
        saleToListRatioChange: 1.2,
        appreciationRate5y: 0.45,
        forecastedGrowth: 0.082,
        inventory: 183,
        inventoryChange: -15.8,
        marketHeatIndex: 9.1,
      },
      livability: {
        scores: {
          overall: 9.2,
          safety: 7.4,
          education: 7.2,
          housing: 6.0,
          costOfLiving: 6.5,
          nightlife: 9.7,
          familyFriendly: 6.8,
          diversity: 8.5,
          jobMarket: 8.0
        },
        demographics: {
          population: 35000,
          medianAge: 29,
          medianIncome: 68000,
          residentTypes: {
            youngProfessionals: 0.58,
            families: 0.15,
            retirees: 0.07,
            students: 0.20
          }
        }
      },
      schools: [
        { name: "Escuela Primaria España", rating: 7.8, type: "Public", distance: 0.5 },
        { name: "Colegio Williams", rating: 8.6, type: "Private", distance: 1.0 },
        { name: "Instituto Cultural México", rating: 8.2, type: "Private", distance: 1.2 },
        { name: "Escuela Secundaria Técnica 45", rating: 7.1, type: "Public", distance: 1.7 }
      ],
      education: {
        districtRating: 7.4,
        studentTeacherRatio: 16.2,
        graduationRate: 0.85,
        collegeBoundRate: 0.76
      },
      amenities: {
        restaurants: 135,
        groceryStores: 11,
        shoppingCenters: 2,
        popularPlaces: [
          "Plaza Río de Janeiro",
          "Álvaro Obregón Avenue",
          "Mercado Roma",
          "MODO Museum",
          "Casa Lamm Cultural Center"
        ]
      },
      transportation: {
        walkScore: 95,
        transitScore: 85,
        bikeScore: 82,
        averageCommute: 21
      },
      safety: {
        crimeRate: 4.5,
        policeStations: 2,
        hospitals: 2,
        healthcareFacilities: 16
      }
    },
    {
      name: "Zona Hotelera",
      city: "Cancún",
      state: "Quintana Roo",
      tags: ["Resort", "Beachfront", "Tourist", "Luxury"],
      market: {
        medianPrice: 780000,
        priceChange: 7.8,
        pricePerSqFt: 410,
        pricePerSqFtChange: 5.9,
        daysOnMarket: 35,
        daysOnMarketChange: -8,
        saleToListRatio: 0.95,
        saleToListRatioChange: 0.2,
        appreciationRate5y: 0.34,
        forecastedGrowth: 0.058,
        inventory: 215,
        inventoryChange: 5.2,
        marketHeatIndex: 7.8,
      },
      livability: {
        scores: {
          overall: 7.8,
          safety: 7.0,
          education: 6.8,
          housing: 6.5,
          costOfLiving: 7.2,
          nightlife: 9.4,
          familyFriendly: 6.5,
          diversity: 7.5,
          jobMarket: 7.8
        },
        demographics: {
          population: 40000,
          medianAge: 37,
          medianIncome: 65000,
          residentTypes: {
            youngProfessionals: 0.35,
            families: 0.15,
            retirees: 0.20,
            seasonal: 0.30
          }
        }
      },
      schools: [
        { name: "The American School of Cancun", rating: 8.8, type: "Private International", distance: 2.5 },
        { name: "Instituto Británico", rating: 8.5, type: "Private", distance: 3.2 },
        { name: "Colegio Ecab", rating: 8.2, type: "Private", distance: 3.8 },
        { name: "Escuela Secundaria Técnica 11", rating: 7.0, type: "Public", distance: 4.3 }
      ],
      education: {
        districtRating: 7.2,
        studentTeacherRatio: 18.5,
        graduationRate: 0.83,
        collegeBoundRate: 0.72
      },
      amenities: {
        restaurants: 168,
        groceryStores: 8,
        shoppingCenters: 6,
        popularPlaces: [
          "La Isla Shopping Village",
          "Coco Bongo",
          "Luxury Avenue",
          "Cancún Maya Museum",
          "Mandala Beach Club"
        ]
      },
      transportation: {
        walkScore: 68,
        transitScore: 62,
        bikeScore: 58,
        averageCommute: 28
      },
      safety: {
        crimeRate: 5.5,
        policeStations: 4,
        hospitals: 3,
        healthcareFacilities: 12
      }
    },
    {
      name: "Puerto Juárez",
      city: "Cancún",
      state: "Quintana Roo",
      tags: ["Coastal", "Residential", "Up-and-Coming", "Local"],
      market: {
        medianPrice: 320000,
        priceChange: 12.5,
        pricePerSqFt: 225,
        pricePerSqFtChange: 9.2,
        daysOnMarket: 40,
        daysOnMarketChange: -12,
        saleToListRatio: 0.94,
        saleToListRatioChange: 1.5,
        appreciationRate5y: 0.48,
        forecastedGrowth: 0.095,
        inventory: 95,
        inventoryChange: -25.3,
        marketHeatIndex: 8.5,
      },
      livability: {
        scores: {
          overall: 7.5,
          safety: 6.5,
          education: 6.2,
          housing: 7.8,
          costOfLiving: 8.0,
          nightlife: 6.8,
          familyFriendly: 7.2,
          diversity: 7.0,
          jobMarket: 7.5
        },
        demographics: {
          population: 25000,
          medianAge: 32,
          medianIncome: 42000,
          residentTypes: {
            youngProfessionals: 0.30,
            families: 0.45,
            retirees: 0.15,
            seasonal: 0.10
          }
        }
      },
      schools: [
        { name: "Escuela Primaria Francisco I. Madero", rating: 6.8, type: "Public", distance: 0.8 },
        { name: "Colegio La Salle", rating: 7.9, type: "Private", distance: 1.5 },
        { name: "Instituto Playa del Carmen", rating: 7.5, type: "Private", distance: 2.2 },
        { name: "Escuela Secundaria General 11", rating: 6.5, type: "Public", distance: 1.2 }
      ],
      education: {
        districtRating: 6.5,
        studentTeacherRatio: 22.3,
        graduationRate: 0.78,
        collegeBoundRate: 0.65
      },
      amenities: {
        restaurants: 48,
        groceryStores: 10,
        shoppingCenters: 2,
        popularPlaces: [
          "Puerto Juárez Ferry Terminal",
          "Gran Puerto Cancún",
          "Mercado 28",
          "Parque Las Palapas",
          "Playa del Niño"
        ]
      },
      transportation: {
        walkScore: 72,
        transitScore: 65,
        bikeScore: 70,
        averageCommute: 25
      },
      safety: {
        crimeRate: 6.2,
        policeStations: 2,
        hospitals: 1,
        healthcareFacilities: 8
      }
    }
  ];

  // Find the neighborhood data based on city and state
  const neighborhoodData = neighborhoods.find(n => 
    n.city.toLowerCase() === city.toLowerCase() && 
    n.state.toLowerCase() === state.toLowerCase()
  ) || neighborhoods[0]; // Default to first neighborhood if not found
  
  return neighborhoodData;
}

// Custom Progress component that allows custom indicator class name
function Progress({ 
  value, 
  className,
  indicatorClassName
}: { 
  value: number, 
  className?: string,
  indicatorClassName?: string
}) {
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-gray-200 ${className || ''}`}>
      <div
        className={`h-full rounded-full ${indicatorClassName || 'bg-primary-600'}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}