import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showDialog, setShowDialog] = useState(false);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
  };

  const openFullscreen = () => {
    setShowDialog(true);
  };

  if (!images || images.length === 0) {
    return (
      <div className="h-[400px] bg-primary-100 flex items-center justify-center">
        <p className="text-primary-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Main Image */}
        <div className="relative h-[400px] overflow-hidden">
          <img
            src={images[activeIndex]}
            alt={`Property view ${activeIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary-800 h-10 w-10 rounded-full"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary-800 h-10 w-10 rounded-full"
            onClick={handleNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Fullscreen button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 bg-white/80 hover:bg-white text-primary-800 h-10 w-10 rounded-full"
            onClick={openFullscreen}
          >
            <Expand className="h-5 w-5" />
          </Button>
          
          {/* Image counter */}
          <div className="absolute left-4 bottom-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
        
        {/* Thumbnails */}
        <div className="flex space-x-2 mt-2 p-2 overflow-x-auto">
          {images.map((image, index) => (
            <div
              key={index}
              className={`w-20 h-16 flex-shrink-0 cursor-pointer overflow-hidden rounded ${
                index === activeIndex ? "ring-2 ring-secondary-500" : "opacity-70"
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen Gallery Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative h-[80vh]">
            <img
              src={images[activeIndex]}
              alt={`Property view ${activeIndex + 1} fullscreen`}
              className="w-full h-full object-contain"
            />
            
            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary-800 h-10 w-10 rounded-full"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary-800 h-10 w-10 rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            
            {/* Image counter */}
            <div className="absolute left-4 bottom-4 bg-black/70 text-white text-sm px-2 py-1 rounded">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
          
          {/* Thumbnails in dialog */}
          <div className="flex space-x-2 p-4 overflow-x-auto bg-white">
            {images.map((image, index) => (
              <div
                key={index}
                className={`w-24 h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded ${
                  index === activeIndex ? "ring-2 ring-secondary-500" : "opacity-70"
                }`}
                onClick={() => handleThumbnailClick(index)}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
