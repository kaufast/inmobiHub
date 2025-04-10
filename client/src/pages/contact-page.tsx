import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    inquiryType: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real app, you would send the form data to your backend
    console.log('Form data:', formData);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent successfully",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        inquiryType: '',
        message: ''
      });
    }, 1500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-[#1d2633] text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Inmobi<sup>®</sup></h1>
            <p className="text-lg md:text-xl mb-8 text-white/80">
              We're here to help with all your real estate needs.
              Get in touch with our team today.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Information & Form */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#131c28]">Get In Touch</h2>
              <p className="text-gray-600 mb-8">
                Have questions about buying, selling, or investing in property? Our team is ready to assist you.
                Contact us using one of the methods below or fill out the form.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#131c28]/10 rounded-full p-3 mr-4">
                    <MapPin className="h-6 w-6 text-[#131c28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Address</h3>
                    <p className="text-gray-600 mt-1">
                      C. de la Ribera 14, 08003 Barcelona
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#131c28]/10 rounded-full p-3 mr-4">
                    <Phone className="h-6 w-6 text-[#131c28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600 mt-1">
                      <a href="tel:+34679680000" className="hover:text-[#131c28]">+34 679 680 000</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#131c28]/10 rounded-full p-3 mr-4">
                    <Mail className="h-6 w-6 text-[#131c28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600 mt-1">
                      <a href="mailto:info@inmobi.mobi" className="hover:text-[#131c28]">info@inmobi.mobi</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#131c28]/10 rounded-full p-3 mr-4">
                    <Clock className="h-6 w-6 text-[#131c28]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Business Hours</h3>
                    <p className="text-gray-600 mt-1">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h3 className="text-lg font-medium mb-4 text-[#131c28]">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="#" 
                    className="bg-[#131c28]/10 p-3 rounded-full hover:bg-[#131c28] hover:text-white transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="bg-[#131c28]/10 p-3 rounded-full hover:bg-[#131c28] hover:text-white transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="bg-[#131c28]/10 p-3 rounded-full hover:bg-[#131c28] hover:text-white transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a 
                    href="#" 
                    className="bg-[#131c28]/10 p-3 rounded-full hover:bg-[#131c28] hover:text-white transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-[#131c28] text-white rounded-t-lg">
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription className="text-white/70">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your email address"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your phone number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">Inquiry Type</Label>
                        <Select 
                          value={formData.inquiryType}
                          onValueChange={handleSelectChange}
                        >
                          <SelectTrigger id="inquiryType">
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="buying">Buying Property</SelectItem>
                            <SelectItem value="selling">Selling Property</SelectItem>
                            <SelectItem value="investing">Real Estate Investment</SelectItem>
                            <SelectItem value="partnership">Business Partnership</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Subject of your message"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        rows={5}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#131c28] hover:bg-[#0c1319]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#131c28]">Visit Our Office</h2>
            <p className="text-gray-600 mt-2">
              Located in the heart of Barcelona, our office is easily accessible.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto h-96 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.7280794776406!2d2.1822754!3d41.3833992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f35276ef55%3A0x1c28b4c3afc04eaf!2sCarrer%20de%20la%20Ribera%2C%2014%2C%2008003%20Barcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#131c28]">Frequently Asked Questions</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Find answers to common questions about our services and platform.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-[#131c28] mb-2">How do I schedule a property viewing?</h3>
                <p className="text-gray-600">
                  You can schedule a property viewing directly through our platform by visiting the property details page and clicking on "Schedule a Viewing." Alternatively, you can contact us directly via phone or email.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-[#131c28] mb-2">What areas do you serve?</h3>
                <p className="text-gray-600">
                  We currently operate throughout Barcelona and surrounding areas, with plans to expand to more cities in Spain. Our platform features properties from various locations to suit different preferences.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-[#131c28] mb-2">How can I list my property on Inmobi?</h3>
                <p className="text-gray-600">
                  To list your property, create an account and select "Add Property" from your dashboard. Follow the step-by-step process to upload details and photos. For premium listings or additional support, contact our team directly.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-[#131c28] mb-2">What makes Inmobi different from other real estate platforms?</h3>
                <p className="text-gray-600">
                  Inmobi stands out with our AI-powered property matching, detailed neighborhood analytics, and personalized recommendations. We focus on providing a seamless experience with innovative tools for both buyers and sellers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-[#131c28] to-[#1d2633] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Property Journey?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Whether you're buying, selling, or investing, our team is here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[#131c28] hover:bg-white/90" size="lg">
              Browse Properties
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20" size="lg">
              Join Inmobi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}