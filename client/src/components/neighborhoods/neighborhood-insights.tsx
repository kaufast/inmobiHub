import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Neighborhood } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ExternalLink, Info, TrendingUp, School, Home, Coffee, Utensils, ShoppingBag, Users } from "lucide-react";

interface NeighborhoodInsightsProps {
  neighborhoodId: number;
}

export default function NeighborhoodInsights({ neighborhoodId }: NeighborhoodInsightsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: neighborhood, isLoading, error } = useQuery<Neighborhood>({
    queryKey: [`/api/neighborhoods/${neighborhoodId}`],
    enabled: !!neighborhoodId,
  });
  
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-primary-300 animate-pulse" />
          <div className="w-4 h-4 rounded-full bg-primary-400 animate-pulse delay-75" />
          <div className="w-4 h-4 rounded-full bg-primary-500 animate-pulse delay-150" />
        </div>
        <div className="mt-4 text-primary-600">Loading neighborhood insights...</div>
      </div>
    );
  }
  
  if (error || !neighborhood) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-lg border border-red-100">
        <div className="text-red-500 font-medium">Failed to load neighborhood data</div>
        <div className="text-sm text-red-400 mt-2">Please try again later</div>
      </div>
    );
  }
  
  // Price history data for chart
  const priceHistoryData = neighborhood.priceHistory || [];
  
  // Demographics data
  const ageGroups = neighborhood.demographics?.ageGroups || [];
  const incomeDistribution = neighborhood.demographics?.incomeDistribution || [];
  
  return (
    <div className="bg-gradient-to-b from-white to-primary-50/30 rounded-xl overflow-hidden shadow-lg">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary-800 flex items-center gap-2">
              {neighborhood.name} 
              <Badge variant="outline" className="ml-2 bg-primary-100 text-primary-800">
                Rank #{neighborhood.rank || "N/A"}
              </Badge>
            </h2>
            <p className="text-primary-600">
              {neighborhood.city}, {neighborhood.state}
            </p>
          </div>
          
          <div className="flex items-center bg-white/70 backdrop-blur-lg rounded-lg px-3 py-1.5 shadow-sm border border-primary-100">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary-800">{neighborhood.overallScore}</div>
              <div className="text-lg font-medium text-primary-600">/100</div>
            </div>
            <div className="ml-3 text-sm text-primary-600">
              Overall<br />Score
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 md:grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">About {neighborhood.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-primary-700">{neighborhood.description}</p>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-primary-700 mb-2">Highlights</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(neighborhood.highlights || []).map((highlight, i) => (
                        <div key={i} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <span className="ml-2 text-sm text-primary-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {(neighborhood.challenges || []).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-primary-700 mb-2">Challenges</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(neighborhood.challenges || []).map((challenge, i) => (
                          <div key={i} className="flex items-start">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                              <span className="text-amber-600 text-xs">!</span>
                            </div>
                            <span className="ml-2 text-sm text-primary-700">{challenge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-primary-700">Growth Rate</span>
                        <span className="text-sm font-bold text-primary-800">
                          {neighborhood.growth !== undefined ? `${(neighborhood.growth * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-primary-100 rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.min(Math.max((neighborhood.growth || 0) * 100, 0), 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-primary-500 mt-1">Annual growth compared to city average</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-primary-700">Median Home Price</span>
                        <span className="text-sm font-bold text-primary-800">
                          {neighborhood.medianHomePrice ? `$${neighborhood.medianHomePrice.toLocaleString()}` : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-primary-500 mt-1">Based on recent sales in the area</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-primary-700">Population</span>
                        <span className="text-sm font-bold text-primary-800">
                          {neighborhood.population ? neighborhood.population.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-primary-500 mt-1">Total residents in neighborhood</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Scores Tab */}
          <TabsContent value="scores" className="mt-0">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Neighborhood Scores</CardTitle>
                <CardDescription>
                  Detailed ratings across key lifestyle categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Affordability</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.affordabilityScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.affordabilityScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Housing costs relative to city average</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Safety</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.safetyScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.safetyScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Crime rates and security</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <School className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Schools</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.schoolScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.schoolScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Quality of educational institutions</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Family Friendly</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.familyFriendlyScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.familyFriendlyScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Suitability for raising families</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Coffee className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Nightlife</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.nightlifeScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.nightlifeScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Evening entertainment options</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Utensils className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Restaurants</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.restaurantScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.restaurantScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Dining scene and options</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Shopping</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.shoppingScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.shoppingScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Retail options and accessibility</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <Info className="w-4 h-4 mr-2 text-primary-500" />
                          <span className="text-sm font-medium text-primary-700">Walkability</span>
                        </div>
                        <span className="text-sm font-bold">{neighborhood.walkabilityScore || 'N/A'}/100</span>
                      </div>
                      <Progress value={neighborhood.walkabilityScore || 0} className="h-2 bg-primary-100" />
                      <p className="text-xs text-primary-500 mt-1">Pedestrian friendliness</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Trends Tab */}
          <TabsContent value="trends" className="mt-0">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>
                  Historical price data and market performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {priceHistoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={priceHistoryData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="year" 
                          tickMargin={10}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000)}k`}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip
                          formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Median Price']}
                          labelFormatter={(value) => `Year: ${value}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#0891b2"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Info className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-2">No price history data available</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-sm text-primary-600">Growth Trend</div>
                    <div className="text-xl font-bold text-primary-900">
                      {neighborhood.growth ? `${(neighborhood.growth * 100).toFixed(1)}%` : 'N/A'}
                    </div>
                    <div className="text-xs text-primary-500">Annual appreciation</div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-sm text-primary-600">Median Price</div>
                    <div className="text-xl font-bold text-primary-900">
                      {neighborhood.medianHomePrice ? `$${neighborhood.medianHomePrice.toLocaleString()}` : 'N/A'}
                    </div>
                    <div className="text-xs text-primary-500">Current value</div>
                  </div>
                  
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <div className="text-sm text-primary-600">5-Year Forecast</div>
                    <div className="text-xl font-bold text-primary-900">
                      {neighborhood.growth 
                        ? `$${Math.round((neighborhood.medianHomePrice || 0) * Math.pow(1 + (neighborhood.growth || 0), 5)).toLocaleString()}`
                        : 'N/A'
                      }
                    </div>
                    <div className="text-xs text-primary-500">Projected value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Demographics Tab */}
          <TabsContent value="demographics" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of population by age groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ageGroups.length > 0 ? (
                    <div className="space-y-4">
                      {ageGroups.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-primary-700">{item.group}</span>
                            <span className="text-sm font-medium text-primary-900">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-primary-100 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-primary-400">
                      No age distribution data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Income Levels</CardTitle>
                  <CardDescription>
                    Household income distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incomeDistribution.length > 0 ? (
                    <div className="space-y-4">
                      {incomeDistribution.map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-primary-700">{item.range}</span>
                            <span className="text-sm font-medium text-primary-900">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-primary-100 rounded-full h-2.5">
                            <div 
                              className="bg-secondary-500 h-2.5 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-primary-400">
                      No income distribution data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}