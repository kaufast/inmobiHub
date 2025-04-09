import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, ArrowRight, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAuth } from '@/hooks/use-auth';

type PredictionResponse = {
  propertyId: number;
  currentValue: number;
  predictedValues: { year: number; value: number; growthRate: number }[];
  cumulativeGrowth: number;
  confidenceScore: number;
  influencingFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
  recommendation: string;
};

interface PropertyValuePredictorProps {
  propertyId: number;
}

export default function PropertyValuePredictor({ propertyId }: PropertyValuePredictorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [predictionYears, setPredictionYears] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<string>('chart');
  
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  
  const { data: prediction, isLoading, error, refetch } = useQuery<PredictionResponse>({
    queryKey: [`/api/properties/${propertyId}/value-prediction`, predictionYears],
    queryFn: async () => {
      if (!isPremium) {
        throw new Error('Premium subscription required');
      }
      
      const response = await fetch(`/api/properties/${propertyId}/value-prediction?years=${predictionYears}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch prediction data');
      }
      return response.json();
    },
    enabled: isPremium, // Only run the query if user has premium access
    refetchOnWindowFocus: false,
    retry: false
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };
  
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <ArrowRight className="w-4 h-4 text-gray-600" />;
      default: return <ArrowRight className="w-4 h-4 text-gray-600" />;
    }
  };
  
  if (!isPremium) {
    return (
      <Card className="shadow-md border-indigo-100 mb-8">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-800 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-amber-500" />
            AI Property Value Prediction
          </CardTitle>
          <CardDescription>
            Upgrade to a premium subscription to access our AI-powered property value predictions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-amber-800 mb-2">Premium Feature</h3>
            <p className="text-amber-700 mb-4">
              Get detailed property value forecasts with our advanced AI algorithms.
              Predict future property values for up to 10 years with detailed analysis on the
              factors affecting growth.
            </p>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            >
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="shadow-md border-indigo-100 mb-8">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-800">AI Property Value Prediction</CardTitle>
          <CardDescription>Analyzing market data to predict future property values</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-indigo-700 font-medium">
                Our AI is analyzing property data and market trends...
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This may take a few moments as we gather comprehensive market insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !prediction) {
    return (
      <Card className="shadow-md border-indigo-100 mb-8">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
          <CardTitle className="text-lg text-indigo-800">AI Property Value Prediction</CardTitle>
          <CardDescription>Unable to load prediction data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-red-800 mb-2">Error Loading Predictions</h3>
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'An unknown error occurred while fetching prediction data.'}
            </p>
          </div>
          <Button 
            onClick={() => refetch()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const chartData = prediction.predictedValues.map(yearData => ({
    year: yearData.year,
    value: yearData.value,
    growthRate: yearData.growthRate * 100  // Convert to percentage for display
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg border rounded-lg">
          <p className="font-bold">{`Year: ${label}`}</p>
          <p className="text-indigo-700">{`Value: ${formatCurrency(payload[0].value)}`}</p>
          <p className="text-green-600">{`Growth: ${payload[1].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md border-indigo-100 mb-8">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-indigo-800">AI Property Value Prediction</CardTitle>
            <CardDescription>Powered by real-time market data analysis</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">Prediction years:</div>
            <div className="flex">
              {[3, 5, 10].map((years) => (
                <Button
                  key={years}
                  variant={years === predictionYears ? "default" : "outline"}
                  size="sm"
                  className={years === predictionYears ? "bg-indigo-600 hover:bg-indigo-700" : "border-indigo-200 text-indigo-700"}
                  onClick={() => setPredictionYears(years)}
                >
                  {years}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
            <div className="text-gray-500 text-sm">Current Value</div>
            <div className="text-2xl font-bold text-indigo-700">
              {formatCurrency(prediction.currentValue)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
            <div className="text-gray-500 text-sm">Predicted Growth (Total)</div>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(prediction.cumulativeGrowth)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
            <div className="text-gray-500 text-sm">
              Predicted Value in {new Date().getFullYear() + predictionYears}
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              {formatCurrency(prediction.predictedValues[prediction.predictedValues.length - 1]?.value || 0)}
            </div>
          </div>
        </div>

        <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chart">Value Forecast</TabsTrigger>
            <TabsTrigger value="factors">Key Influencers</TabsTrigger>
            <TabsTrigger value="recommendation">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 'dataMax + 1']}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="value"
                    name="Property Value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    name="Annual Growth %"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center">
                <div className="mr-2 w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="text-blue-800 text-sm font-medium">Confidence Score:</div>
                <div className="ml-2 text-blue-700 font-bold">
                  {(prediction.confidenceScore * 100).toFixed(0)}%
                </div>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                This prediction is based on historical trends, neighborhood data, and economic indicators.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="factors">
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Factors Influencing Property Value</h3>
              
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prediction.influencingFactors}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="factor" width={100} />
                    <Tooltip 
                      formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Impact Weight']}
                      labelFormatter={(label) => `Factor: ${label}`}
                    />
                    <Bar dataKey="weight" name="Impact Weight">
                      {prediction.influencingFactors.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.impact === 'positive' ? '#22c55e' : 
                            entry.impact === 'negative' ? '#ef4444' : 
                            '#6b7280'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {prediction.influencingFactors.map((factor, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-2 rounded-lg border border-gray-100 bg-white"
                  >
                    <div className="mr-2">
                      {getImpactIcon(factor.impact)}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium">{factor.factor}</div>
                    </div>
                    <div className={`font-medium ${getImpactColor(factor.impact)}`}>
                      {(factor.weight * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendation">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Investment Analysis</h3>
              <div className="prose max-w-none">
                <p>{prediction.recommendation}</p>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Projected ROI</h4>
                  <div className="text-2xl font-bold text-indigo-700">
                    {formatPercentage(prediction.cumulativeGrowth / predictionYears)}
                    <span className="text-gray-500 text-sm font-normal ml-1">per year</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-2">Value in {predictionYears} years</h4>
                  <div className="text-2xl font-bold text-indigo-700">
                    {formatCurrency(prediction.predictedValues[prediction.predictedValues.length - 1]?.value || 0)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}