import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, Users, Home, Building, Lightbulb, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-[#1d2633] text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Inmobi<sup>®</sup></h1>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              The future of real estate discovery and investment,
              combining innovative technology with personalized experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#131c28]">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                  At Inmobi, our mission is to transform the property discovery experience by leveraging
                  cutting-edge technology and data-driven insights to connect people with their ideal homes
                  and investment opportunities.
                </p>
                <p className="text-gray-700">
                  We believe in creating a transparent, efficient, and personalized real estate marketplace
                  that empowers both buyers and sellers to make informed decisions with confidence.
                </p>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold mb-6 text-[#131c28]">Our Vision</h2>
                <p className="text-gray-700 mb-4">
                  We envision a world where finding and investing in property is a seamless, enjoyable
                  experience accessible to everyone. Through innovation and excellent service, we aim to
                  be the leading platform that revolutionizes how people interact with real estate.
                </p>
                <p className="text-gray-700">
                  Our goal is to continue breaking barriers in the industry by introducing smart solutions
                  that address the evolving needs of our clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#131c28]">Our Core Values</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              These principles guide everything we do and define our culture at Inmobi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-md bg-white border-0">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="text-[#131c28] h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#131c28]">Client-Centric</h3>
                <p className="text-gray-600">
                  We place our clients at the heart of everything we do, striving to exceed expectations
                  with personalized solutions and exceptional service.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-white border-0">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Lightbulb className="text-[#131c28] h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#131c28]">Innovation</h3>
                <p className="text-gray-600">
                  We continuously evolve by embracing new technologies and approaches to create better
                  solutions for the real estate industry.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-md bg-white border-0">
              <CardContent className="pt-6">
                <div className="rounded-full bg-primary-50 p-3 w-12 h-12 flex items-center justify-center mb-4">
                  <Award className="text-[#131c28] h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#131c28]">Integrity</h3>
                <p className="text-gray-600">
                  We conduct our business with transparency, honesty, and ethical standards that build
                  trust with our clients and partners.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#131c28]">Our Team</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Meet the passionate professionals behind Inmobi who are dedicated to transforming your real estate experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mb-4 relative inline-block">
                <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="CEO" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#131c28]">Alejandro Martínez</h3>
              <p className="text-[#131c28]/70">Founder & CEO</p>
              <p className="mt-3 text-gray-600 text-sm">
                With over 15 years of experience in real estate and technology, Alejandro leads our vision to transform property discovery.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 relative inline-block">
                <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="CTO" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#131c28]">Sofía Rodriguez</h3>
              <p className="text-[#131c28]/70">Chief Technology Officer</p>
              <p className="mt-3 text-gray-600 text-sm">
                Sofía brings her expertise in AI and machine learning to develop our innovative recommendation engine and search technologies.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 relative inline-block">
                <div className="w-40 h-40 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <img 
                    src="https://randomuser.me/api/portraits/men/65.jpg" 
                    alt="Head of Real Estate" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-[#131c28]">Miguel Torres</h3>
              <p className="text-[#131c28]/70">Head of Real Estate</p>
              <p className="mt-3 text-gray-600 text-sm">
                As a seasoned real estate professional, Miguel ensures the quality of our property listings and market insights.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-[#131c28] text-[#131c28] hover:bg-[#131c28] hover:text-white">
              Join Our Team
            </Button>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="py-16 bg-[#1d2633] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Our Achievements</h2>
            <p className="text-white/70 mt-4 max-w-2xl mx-auto">
              Recognitions and milestones that mark our journey in revolutionizing real estate.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <p className="text-4xl font-bold mb-2">5000+</p>
              <p className="text-white/70">Happy Clients</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">10k+</p>
              <p className="text-white/70">Properties Listed</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">15+</p>
              <p className="text-white/70">Industry Awards</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">30+</p>
              <p className="text-white/70">Cities Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-[#131c28] to-[#1d2633] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Property?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who have discovered their dream homes through Inmobi.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#131c28] hover:bg-white/90" size="lg">
              Browse Properties
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}