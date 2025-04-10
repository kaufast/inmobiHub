import { useState } from "react";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Heart, Share2, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
  LinkedinIcon,
} from "react-share";

interface PropertyActionButtonsProps {
  property: Property;
  isFavorite: boolean;
  setIsFavorite: (value: boolean) => void;
  variant?: "floating" | "inline";
  className?: string;
}

export default function PropertyActionButtons({
  property,
  isFavorite,
  setIsFavorite,
  variant = "floating",
  className = "",
}: PropertyActionButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/user/favorites/${property.id}`);
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Property removed from your favorites list",
        });
      } else {
        await apiRequest("POST", "/api/user/favorites", { propertyId: Number(property.id) });
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Property added to your favorites list",
        });
      }
      
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ["/api/user/favorites"] });
    } catch (error: any) {
      console.error("Favorites error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShareProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShareOpen(true);
  };
  
  const copyToClipboard = () => {
    const url = `${window.location.origin}/property/${property.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied",
        description: "Property link copied to clipboard",
      });
      setIsShareOpen(false);
    }).catch(err => {
      toast({
        title: "Failed to copy link",
        description: "Could not copy the property link",
        variant: "destructive",
      });
    });
  };

  const toggleActionMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActionMenuOpen(!isActionMenuOpen);
  };

  const propertyUrl = `${window.location.origin}/property/${property.id}`;
  const propertyTitle = `Check out this property: ${property.title}`;

  if (variant === "floating") {
    return (
      <>
        <div className={`fixed bottom-6 right-6 z-30 ${className}`}>
          <AnimatePresence>
            {isActionMenuOpen && (
              <div className="absolute bottom-16 right-0 flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className={`h-12 w-12 rounded-full shadow-lg ${
                            isFavorite ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-gray-800 hover:bg-gray-100"
                          }`}
                          onClick={handleFavoriteToggle}
                          disabled={isLoading}
                        >
                          <Heart
                            className={`h-5 w-5 ${isFavorite ? "fill-white" : ""}`}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-12 w-12 rounded-full shadow-lg bg-blue-500 text-white hover:bg-blue-600"
                              onClick={handleShareProperty}
                            >
                              <Share2 className="h-5 w-5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <div className="flex flex-col items-center">
                              <h3 className="text-lg font-semibold mb-4">Share this property</h3>
                              <div className="flex justify-center gap-4 mb-6">
                                <FacebookShareButton url={propertyUrl} className="focus:outline-none">
                                  <FacebookIcon size={40} round />
                                </FacebookShareButton>
                                <TwitterShareButton url={propertyUrl} title={propertyTitle} className="focus:outline-none">
                                  <TwitterIcon size={40} round />
                                </TwitterShareButton>
                                <WhatsappShareButton url={propertyUrl} title={propertyTitle} className="focus:outline-none">
                                  <WhatsappIcon size={40} round />
                                </WhatsappShareButton>
                                <LinkedinShareButton url={propertyUrl} className="focus:outline-none">
                                  <LinkedinIcon size={40} round />
                                </LinkedinShareButton>
                                <EmailShareButton url={propertyUrl} subject={propertyTitle} body={propertyTitle} className="focus:outline-none">
                                  <EmailIcon size={40} round />
                                </EmailShareButton>
                              </div>
                              <div className="w-full flex items-center justify-between border rounded-lg p-2 bg-gray-50">
                                <input
                                  type="text"
                                  value={propertyUrl}
                                  className="bg-transparent border-none flex-1 focus:outline-none focus:ring-0 text-sm"
                                  readOnly
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={copyToClipboard}
                                  className="ml-2"
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Share this property</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          <Button
            size="icon"
            variant="secondary"
            className="h-14 w-14 rounded-full shadow-lg bg-primary-600 text-white hover:bg-primary-700"
            onClick={toggleActionMenu}
          >
            {isActionMenuOpen ? <X className="h-6 w-6" /> : <Heart className="h-6 w-6" />}
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1 ${
          isFavorite ? "bg-red-50 text-red-600 border-red-200" : ""
        }`}
        onClick={handleFavoriteToggle}
        disabled={isLoading}
      >
        <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-600" : ""}`} />
        <span>{isFavorite ? "Saved" : "Save"}</span>
      </Button>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Share this property</h3>
            <div className="flex justify-center gap-4 mb-6">
              <FacebookShareButton url={propertyUrl} className="focus:outline-none">
                <FacebookIcon size={40} round />
              </FacebookShareButton>
              <TwitterShareButton url={propertyUrl} title={propertyTitle} className="focus:outline-none">
                <TwitterIcon size={40} round />
              </TwitterShareButton>
              <WhatsappShareButton url={propertyUrl} title={propertyTitle} className="focus:outline-none">
                <WhatsappIcon size={40} round />
              </WhatsappShareButton>
              <LinkedinShareButton url={propertyUrl} className="focus:outline-none">
                <LinkedinIcon size={40} round />
              </LinkedinShareButton>
              <EmailShareButton url={propertyUrl} subject={propertyTitle} body={propertyTitle} className="focus:outline-none">
                <EmailIcon size={40} round />
              </EmailShareButton>
            </div>
            <div className="w-full flex items-center justify-between border rounded-lg p-2 bg-gray-50">
              <input
                type="text"
                value={propertyUrl}
                className="bg-transparent border-none flex-1 focus:outline-none focus:ring-0 text-sm"
                readOnly
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="ml-2"
              >
                Copy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}