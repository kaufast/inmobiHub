import { useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Share2, Facebook, Twitter, Linkedin, Mail, Link, Check, 
  Printer, Copy, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Property } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PropertyShareProps {
  property: Property;
  variant?: "icon" | "button" | "iconButton";
  label?: string;
  className?: string;
}

export default function PropertyShare({ 
  property, 
  variant = "iconButton", 
  label, 
  className 
}: PropertyShareProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  const propertyTitle = property.title;
  const propertyAddress = property.address;
  const propertyPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(property.price);
  
  const shareText = `${propertyTitle} - ${propertyAddress} - ${propertyPrice}`;
  
  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}&quote=${encodeURIComponent(shareText)}`,
      color: "bg-[#4267B2] hover:bg-[#365899]"
    },
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(propertyUrl)}&text=${encodeURIComponent(shareText)}`,
      color: "bg-[#1DA1F2] hover:bg-[#0c85d0]"
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(propertyUrl)}`,
      color: "bg-[#0077B5] hover:bg-[#00669c]"
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      url: `mailto:?subject=${encodeURIComponent(`Property Listing: ${propertyTitle}`)}&body=${encodeURIComponent(`Check out this property: ${shareText}\n\n${propertyUrl}`)}`,
      color: "bg-gray-600 hover:bg-gray-700"
    }
  ];
  
  const handlePrint = () => {
    window.print();
    setIsOpen(false);
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      toast({
        title: t("common.copied"),
        description: t("common.linkCopied"),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.copyFailed"),
        variant: "destructive"
      });
    }
  };
  
  const renderTrigger = () => {
    switch (variant) {
      case "icon":
        return (
          <Share2 
            className={cn("h-5 w-5 cursor-pointer", className)} 
            onClick={() => setIsOpen(true)} 
          />
        );
      case "button":
        return (
          <Button
            className={className}
            onClick={() => setIsOpen(true)}
          >
            {label || t("common.shareListing")}
          </Button>
        );
      case "iconButton":
      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            className={cn("flex items-center gap-2", className)}
            onClick={() => setIsOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            <span>{label || t("common.shareListing")}</span>
          </Button>
        );
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {renderTrigger()}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("common.shareListing")}</DialogTitle>
            <DialogDescription>
              {t("property.shareDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-3 py-4">
            {shareLinks.map((link) => (
              <a 
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center gap-2 text-white p-2 rounded-md transition-colors",
                  link.color
                )}
                onClick={() => setTimeout(() => setIsOpen(false), 500)}
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </div>
          
          <div className="mt-2 flex flex-col gap-3">
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={propertyUrl}
                className="flex-1 border border-input rounded-md p-2 pr-20 text-sm"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 h-7 px-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <span className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" /> {t("common.copied")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Copy className="h-4 w-4 mr-1" /> {t("common.copy")}
                  </span>
                )}
              </Button>
            </div>
            
            <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span>{t("common.printListing")}</span>
            </Button>
          </div>
          
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t("common.close")}</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}