import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Neighborhood } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DataInsights() {
  const { t } = useTranslation();
  const [timeFrame, setTimeFrame] = useState<'1Y' | '5Y' | '10Y'>('1Y');
  const [purchasePrice, setPurchasePrice] = useState(750000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(4.5);
  const [monthlyRent, setMonthlyRent] = useState(3500);

  // Calculate mortgage and investment metrics
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = 30 * 12; // 30-year mortgage
  
  const monthlyPayment = loanAmount * 
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  const monthlyBalance = monthlyRent - monthlyPayment;
  const annualCashFlow = monthlyBalance * 12;
  const annualROI = (annualCashFlow / downPayment) * 100;
  const breakEven = downPayment / annualCashFlow;

  // Fetch neighborhood data
  const { data: neighborhoods, isLoading } = useQuery<Neighborhood[]>({
    queryKey: ["/api/neighborhoods"],
  });

  return (
    <section className="py-16 bg-white" id="data-insights">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-800">{t("sections.dataInsights", "Data-Driven Insights")}</h2>
            <p className="text-primary-500 mt-2">{t("sections.dataInsightsSubtitle", "Make smarter investment decisions with our premium analytics")}</p>
          </div>
          <a href="#analytics" className="text-secondary-500 hover:text-secondary-600 font-medium mt-4 md:mt-0 inline-flex items-center">
            {t("sections.exploreAllAnalytics", "Explore all analytics")}
            <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Trends Card */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-primary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-800">{t("sections.marketTrends", "Market Trends")}</h3>
              <div className="flex space-x-2">
                <button 
                  className={`text-xs font-medium rounded-full px-2 py-1 ${timeFrame === '1Y' ? 'bg-primary-100 text-primary-800' : 'text-primary-500 hover:bg-primary-50'}`}
                  onClick={() => setTimeFrame('1Y')}
                >
                  1Y
                </button>
                <button 
                  className={`text-xs font-medium rounded-full px-2 py-1 ${timeFrame === '5Y' ? 'bg-primary-100 text-primary-800' : 'text-primary-500 hover:bg-primary-50'}`}
                  onClick={() => setTimeFrame('5Y')}
                >
                  5Y
                </button>
                <button 
                  className={`text-xs font-medium rounded-full px-2 py-1 ${timeFrame === '10Y' ? 'bg-primary-100 text-primary-800' : 'text-primary-500 hover:bg-primary-50'}`}
                  onClick={() => setTimeFrame('10Y')}
                >
                  10Y
                </button>
              </div>
            </div>
            
            {/* Chart visualization */}
            <div className="h-56 mb-4 bg-white">
              <svg className="w-full h-full" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                {/* Grid lines */}
                <line x1="0" y1="40" x2="400" y2="40" stroke="#e2e8f0" strokeWidth="1"/>
                <line x1="0" y1="80" x2="400" y2="80" stroke="#e2e8f0" strokeWidth="1"/>
                <line x1="0" y1="120" x2="400" y2="120" stroke="#e2e8f0" strokeWidth="1"/>
                <line x1="0" y1="160" x2="400" y2="160" stroke="#e2e8f0" strokeWidth="1"/>
                
                {/* Data line for median home price */}
                <path 
                  d={timeFrame === '1Y' 
                    ? "M0,160 C20,150 40,145 60,140 C80,135 100,130 120,125 C140,120 160,115 180,110 C200,105 220,100 240,90 C260,80 280,70 300,60 C320,50 340,45 360,40 C380,35 400,30 420,25" 
                    : timeFrame === '5Y'
                    ? "M0,170 C20,165 40,160 60,155 C80,150 100,145 120,140 C140,130 160,120 180,110 C200,100 220,90 240,80 C260,70 280,60 300,50 C320,40 340,30 360,20 C380,15 400,10 420,5"
                    : "M0,180 C20,175 40,170 60,165 C80,160 100,150 120,140 C140,130 160,120 180,110 C200,90 220,70 240,60 C260,50 280,40 300,30 C320,20 340,15 360,10 C380,5 400,0 420,0"
                  } 
                  fill="none" 
                  stroke="#9333ea" 
                  strokeWidth="3"
                />
                  
                {/* Area under the line */}
                <path 
                  d={timeFrame === '1Y' 
                    ? "M0,160 C20,150 40,145 60,140 C80,135 100,130 120,125 C140,120 160,115 180,110 C200,105 220,100 240,90 C260,80 280,70 300,60 C320,50 340,45 360,40 C380,35 400,30 420,25 L420,200 L0,200 Z" 
                    : timeFrame === '5Y'
                    ? "M0,170 C20,165 40,160 60,155 C80,150 100,145 120,140 C140,130 160,120 180,110 C200,100 220,90 240,80 C260,70 280,60 300,50 C320,40 340,30 360,20 C380,15 400,10 420,5 L420,200 L0,200 Z"
                    : "M0,180 C20,175 40,170 60,165 C80,160 100,150 120,140 C140,130 160,120 180,110 C200,90 220,70 240,60 C260,50 280,40 300,30 C320,20 340,15 360,10 C380,5 400,0 420,0 L420,200 L0,200 Z"
                  } 
                  fill="url(#purpleGradient)" 
                  opacity="0.1"
                />
                  
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#9333ea" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#9333ea" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-primary-500">Median Price</p>
                <p className="text-lg font-semibold text-primary-800">$795K</p>
                <p className="text-xs text-green-500">+8.3%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-primary-500">Inventory</p>
                <p className="text-lg font-semibold text-primary-800">2,150</p>
                <p className="text-xs text-red-500">-4.7%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-primary-500">Days on Market</p>
                <p className="text-lg font-semibold text-primary-800">32</p>
                <p className="text-xs text-green-500">-12.3%</p>
              </div>
            </div>
          </div>
          
          {/* Neighborhood Insights */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-primary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-800">{t("sections.neighborhoodInsights", "Neighborhood Insights")}</h3>
              <button className="text-secondary-500 hover:text-secondary-600 text-sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
            
            {/* Neighborhood ranking */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-secondary-500" />
                </div>
              ) : neighborhoods && neighborhoods.length > 0 ? (
                neighborhoods.map((neighborhood, index) => (
                  <div key={neighborhood.id} className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-medium">
                      {neighborhood.rank || index + 1}
                    </div>
                    <div className="ml-3 flex-grow">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-medium text-primary-800">{neighborhood.name}</h4>
                        <span className="text-sm font-semibold text-secondary-500">+{(neighborhood.growth || 0).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-primary-100 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-secondary-500 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (neighborhood.growth || 0) * 7)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-primary-500">
                  No neighborhood data available
                </div>
              )}
            </div>
          </div>
          
          {/* Investment Calculator */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-primary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-primary-800">{t("sections.roiCalculator", "ROI Calculator")}</h3>
              <div className="flex items-center text-xs text-primary-500">
                <span className="mr-1">{t("sections.premium", "Premium")}</span>
                <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            
            {/* Calculator form */}
            <div className="space-y-4">
              {/* Purchase price */}
              <div>
                <label htmlFor="purchase_price" className="block text-sm font-medium text-primary-700 mb-1">{t("sections.purchasePrice", "Purchase Price")}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-primary-500">$</span>
                  </div>
                  <Input
                    type="text"
                    id="purchase_price"
                    value={purchasePrice.toLocaleString()}
                    className="pl-8"
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/,/g, ''));
                      if (!isNaN(value)) setPurchasePrice(value);
                    }}
                  />
                </div>
              </div>
              
              {/* Down payment */}
              <div>
                <label htmlFor="down_payment" className="block text-sm font-medium text-primary-700 mb-1">Down Payment (%)</label>
                <Slider
                  id="down_payment"
                  min={5}
                  max={50}
                  step={1}
                  value={[downPaymentPercent]}
                  onValueChange={(value) => setDownPaymentPercent(value[0])}
                />
                <div className="flex justify-between text-xs text-primary-500 mt-1">
                  <span>5%</span>
                  <span className="text-primary-800 font-medium">{downPaymentPercent}% (${downPayment.toLocaleString()})</span>
                  <span>50%</span>
                </div>
              </div>
              
              {/* Interest rate */}
              <div>
                <label htmlFor="interest_rate" className="block text-sm font-medium text-primary-700 mb-1">Interest Rate (%)</label>
                <Input
                  type="text"
                  id="interest_rate"
                  value={interestRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) setInterestRate(value);
                  }}
                />
              </div>
              
              {/* Estimated rent */}
              <div>
                <label htmlFor="monthly_rent" className="block text-sm font-medium text-primary-700 mb-1">Monthly Rent</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-primary-500">$</span>
                  </div>
                  <Input
                    type="text"
                    id="monthly_rent"
                    value={monthlyRent.toLocaleString()}
                    className="pl-8"
                    onChange={(e) => {
                      const value = parseInt(e.target.value.replace(/,/g, ''));
                      if (!isNaN(value)) setMonthlyRent(value);
                    }}
                  />
                </div>
              </div>
              
              {/* Results */}
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-primary-500">Monthly Payment</p>
                    <p className="text-lg font-semibold text-primary-800">${Math.round(monthlyPayment).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Cash Flow</p>
                    <p className={`text-lg font-semibold ${monthlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {monthlyBalance >= 0 ? '+' : ''}{Math.round(monthlyBalance).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Annual ROI</p>
                    <p className="text-lg font-semibold text-primary-800">{annualROI.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-primary-500">Break-even</p>
                    <p className="text-lg font-semibold text-primary-800">{breakEven.toFixed(1)} years</p>
                  </div>
                </div>
              </div>
              
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                Get Full Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
