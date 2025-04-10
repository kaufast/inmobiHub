import React, { useState } from 'react';
import { Property } from '@shared/schema';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Facebook,
  Twitter,
  Mail,
  Linkedin,
  Copy,
  Check,
  Share2,
  QrCode,
  MessageCircle
} from 'lucide-react';

interface SharePropertyDialogProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePropertyDialog({ 
  property, 
  isOpen, 
  onClose 
}: SharePropertyDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Generate the property URL
  const propertyUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/property/${property.id}` 
    : `/property/${property.id}`;

  const shareTitle = `Check out this property: ${property.title}`;
  const shareText = `${shareTitle} - ${formatPrice(property.price)} • ${property.bedrooms} bed • ${property.bathrooms} bath • ${property.squareFeet} sqft`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl).then(() => {
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Property link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const generateQrCode = () => {
    // Using Google Chart API to generate QR code (no additional dependencies needed)
    const googleChartApi = 'https://chart.googleapis.com/chart?';
    const params = new URLSearchParams({
      cht: 'qr',
      chs: '250x250',
      chl: encodeURIComponent(propertyUrl),
      choe: 'UTF-8'
    });
    
    setQrCodeUrl(`${googleChartApi}${params}`);
  };

  const handleShareButtonClick = (platform: string) => {
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${propertyUrl}`)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText} ${propertyUrl}`)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  // Format price helper function
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glassmorphism-card text-white border-white/10 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share this property
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Share this property with your friends and family
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          {/* Property Brief */}
          <div className="flex gap-4 p-3 rounded-lg bg-white/5">
            {property.images && property.images.length > 0 ? (
              <img 
                src={property.images[0]} 
                alt={property.title}
                className="w-20 h-20 object-cover rounded-md" 
              />
            ) : (
              <div className="w-20 h-20 bg-primary-100 flex items-center justify-center rounded-md">
                <svg className="h-8 w-8 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 22V12h6v10" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">{property.title}</h3>
              <p className="text-white/70 text-sm">
                {property.bedrooms} bed • {property.bathrooms} bath • {property.squareFeet} sqft
              </p>
              <p className="font-bold text-white mt-1">{formatPrice(property.price)}</p>
            </div>
          </div>
          
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="w-full bg-white/10">
              <TabsTrigger className="flex-1 data-[state=active]:bg-white/20" value="social">Social</TabsTrigger>
              <TabsTrigger className="flex-1 data-[state=active]:bg-white/20" value="link">Copy Link</TabsTrigger>
              <TabsTrigger className="flex-1 data-[state=active]:bg-white/20" value="qrcode" onClick={generateQrCode}>QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social" className="pt-4">
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleShareButtonClick('facebook')}
                >
                  <Facebook className="h-6 w-6 text-[#1877F2]" />
                  <span className="text-xs">Facebook</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleShareButtonClick('twitter')}
                >
                  <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                  <span className="text-xs">Twitter</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleShareButtonClick('linkedin')}
                >
                  <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleShareButtonClick('whatsapp')}
                >
                  <MessageCircle className="h-6 w-6 text-[#25D366]" />
                  <span className="text-xs">WhatsApp</span>
                </Button>
                
                <Button 
                  variant="outline"
                  className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                  onClick={() => handleShareButtonClick('email')}
                >
                  <Mail className="h-6 w-6 text-[#EA4335]" />
                  <span className="text-xs">Email</span>
                </Button>
                
                {navigator.share && (
                  <Button 
                    variant="outline"
                    className="flex flex-col items-center gap-2 p-4 border-white/10 hover:bg-white/10 text-white"
                    onClick={() => {
                      navigator.share({
                        title: shareTitle,
                        text: shareText,
                        url: propertyUrl,
                      });
                    }}
                  >
                    <Share2 className="h-6 w-6 text-white" />
                    <span className="text-xs">Native</span>
                  </Button>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="pt-4">
              <div className="flex flex-col gap-4">
                <p className="text-sm text-white/70">
                  Copy the link below to share this property
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={propertyUrl}
                    readOnly
                    className="flex-1 bg-white/5 border-white/10 text-white"
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                    }}
                  />
                  <Button 
                    variant="secondary"
                    onClick={handleCopyLink}
                    className="min-w-[100px] bg-[#131c28] hover:bg-[#0c1319] border-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="qrcode" className="pt-4">
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-white/70">
                  Scan this QR code to open the property on a mobile device
                </p>
                {qrCodeUrl ? (
                  <div className="p-3 bg-white rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                  </div>
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg h-48 w-48 flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-white/30" />
                  </div>
                )}
                <Button 
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="bg-[#131c28] hover:bg-[#0c1319] border-0"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}