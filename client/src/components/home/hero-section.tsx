import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-primary-800 overflow-hidden">
      {/* Hero Background with Overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3')] bg-cover bg-center opacity-20"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0 pr-0 lg:pr-12">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight">
              OPENING<br/>MORE<br/>DOORS
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-lg">
              {t('common.findYourDreamProperty')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white font-medium text-lg flex items-center">
                  {t('common.applyNow')}
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </Link>
              <Link href="#membership">
                <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 font-medium text-lg">
                  {t('common.showMore')}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            {/* Phone mockup with property value visualization */}
            <div className="relative w-[280px] md:w-[320px] h-[580px] md:h-[640px]">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-primary-300/50">
                {/* Phone screen content */}
                <div className="bg-gradient-to-br from-primary-700 to-primary-900 h-full w-full relative overflow-hidden">
                  {/* Phone status bar */}
                  <div className="h-6 w-16 bg-primary-900 rounded-b-lg mx-auto"></div>
                  
                  {/* App content */}
                  <div className="p-4 text-white">
                    {/* Property address */}
                    <div className="bg-primary-800/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">9876 Lexington Ave</h3>
                          <p className="text-xs text-white/70">New York, NY 10021</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-white/10 h-8 w-8 rounded-full flex items-center justify-center">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <button className="bg-white/10 h-8 w-8 rounded-full flex items-center justify-center">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property preview */}
                    <div className="relative mb-4 rounded-xl overflow-hidden h-40 bg-black">
                      <img 
                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80" 
                        alt="Property preview" 
                      />
                      <div className="absolute bottom-2 right-2 bg-primary-900/80 text-white text-xs py-1 px-2 rounded-md backdrop-blur-sm">
                        <svg className="inline-block h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        12 photos
                      </div>
                    </div>
                    
                    {/* Property value data */}
                    <div className="bg-primary-800/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                      <h3 className="text-sm text-white/70 mb-1">{t('property.price')}</h3>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold text-white">$695</span>
                        <span className="text-xs text-white/70 ml-1 mb-1">K</span>
                        <div className="ml-auto bg-accent-400 text-xs text-white px-1.5 py-0.5 rounded">
                          +3.2%
                        </div>
                      </div>
                      
                      {/* Value chart */}
                      <div className="h-12 mt-2 relative">
                        <svg className="h-full w-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                          <path d="M0,40 L20,38 L40,42 L60,35 L80,37 L100,30 L120,32 L140,25 L160,20 L180,15 L200,10" fill="none" stroke="#38bdf8" strokeWidth="2"></path>
                          <path d="M0,40 L20,38 L40,42 L60,35 L80,37 L100,30 L120,32 L140,25 L160,20 L180,15 L200,10 L200,50 L0,50 Z" fill="url(#gradient)" opacity="0.2"></path>
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8"/>
                              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      
                      {/* Historical values */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="text-xs text-white/70">Last Year</h4>
                          <div className="flex items-baseline">
                            <span className="text-lg font-semibold text-white">$567</span>
                            <span className="text-xs text-white/70 ml-1">K</span>
                          </div>
                          <div className="text-xs text-green-400">+0.7%</div>
                        </div>
                        <div>
                          <h4 className="text-xs text-white/70">5 Years</h4>
                          <div className="flex items-baseline">
                            <span className="text-lg font-semibold text-white">$302</span>
                            <span className="text-xs text-white/70 ml-1">K</span>
                          </div>
                          <div className="text-xs text-green-400">+130%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Property details */}
                    <div className="bg-primary-800/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-white/70">{t('property.bedrooms')}</div>
                          <div className="font-semibold">4</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/70">{t('property.bathrooms')}</div>
                          <div className="font-semibold">3</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/70">{t('property.sqft')}</div>
                          <div className="font-semibold">2,350</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-3 rounded-xl font-medium transition">
                        {t('common.requestTour')}
                      </button>
                      <button className="bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl flex items-center justify-center transition">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Property 3D visualization overlay */}
              <div className="absolute -z-10 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 w-[400px] h-[250px]">
                <img 
                  src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3" 
                  className="w-full h-full object-cover rounded-lg shadow-xl opacity-80"
                  alt="Property visualization"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
