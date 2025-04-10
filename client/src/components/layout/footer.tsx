import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Inmobi<span className="text-secondary-500">®</span></h2>
            </div>
            <p className="text-gray-400 mb-4">Opening more doors to premium real estate properties around the world.</p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-secondary-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-secondary-500 transition-colors">Properties</Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-secondary-500 transition-colors">Search</Link>
              </li>
              <li>
                <Link href="/neighborhoods" className="hover:text-secondary-500 transition-colors">Neighborhoods</Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-secondary-500 transition-colors">Market Insights</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="hover:text-secondary-500 transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-secondary-500 transition-colors">Buying Guides</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-secondary-500 transition-colors">FAQs</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-secondary-500 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-secondary-500 transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-secondary-500" />
                <span>1234 Premium Avenue, Madrid, Spain</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-secondary-500" />
                <span>+34 91 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-secondary-500" />
                <a href="mailto:info@inmobi.com" className="hover:text-secondary-500 transition-colors">info@inmobi.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <div className="text-sm">
              &copy; {currentYear} Inmobi. All rights reserved.
            </div>
            <div className="mt-2 md:mt-0">
              <a href="https://inmobi.com" target="_blank" rel="noopener noreferrer" className="text-secondary-500 hover:text-secondary-400 transition-colors">
                inmobi.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}