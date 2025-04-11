import React, { useState, useCallback, useRef } from 'react';
import { FileUploader } from '@/components/ui/upload/file-uploader';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2, Upload, Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

export interface UploadedImage {
  id: string;
  filename: string;
  urls: {
    original: string;
    webp: string;
    thumbnail: string;
    medium: string;
    large?: string;
    lqip: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

interface ImageUploaderProps {
  onChange?: (images: UploadedImage[]) => void;
  value?: UploadedImage[];
  maxImages?: number;
  className?: string;
  onError?: (error: Error) => void;
  allowMultiple?: boolean;
  showPreview?: boolean;
  previewSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function ImageUploader({
  onChange,
  value = [],
  maxImages = 10,
  className,
  onError,
  allowMultiple = true,
  showPreview = true,
  previewSize = 'md',
  disabled = false
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>(value);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      
      // Check max images
      if (images.length + files.length > maxImages) {
        toast({
          title: 'Too many images',
          description: `You can only upload a maximum of ${maxImages} images`,
          variant: 'destructive'
        });
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        const formData = new FormData();
        
        // Single file upload
        if (files.length === 1 && !allowMultiple) {
          formData.append('image', files[0]);
          
          const response = await apiRequest('POST', '/api/images/upload', formData);
          
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || 'Upload failed');
          }
          
          // Replace existing images with new one for single upload
          const newImages = [data.image];
          setImages(newImages);
          onChange?.(newImages);
          
          toast({
            title: 'Image uploaded',
            description: 'Your image has been successfully uploaded'
          });
        } 
        // Multiple files upload
        else {
          // Important: use the same field name that the server expects
          for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
          }
          
          console.log('Uploading files:', files.length);
          console.log('FormData entries:');
          for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
          }
          
          const response = await apiRequest('POST', '/api/images/upload-multiple', formData, {
            headers: {
              // Don't set Content-Type here, it will be set automatically with the boundary
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 100)
              );
              setUploadProgress(percentCompleted);
            }
          });
          
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message || 'Upload failed');
          }
          
          // Append new images to existing ones
          const newImages = [...images, ...data.images];
          setImages(newImages);
          onChange?.(newImages);
          
          toast({
            title: 'Images uploaded',
            description: `${data.images.length} image${data.images.length !== 1 ? 's' : ''} successfully uploaded`
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Upload failed',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive'
        });
        onError?.(error instanceof Error ? error : new Error('Upload failed'));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [images, maxImages, onChange, toast, onError, allowMultiple]
  );

  // Handle image removal
  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      try {
        const response = await apiRequest('DELETE', `/api/images/${imageId}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete image');
        }
        
        // Remove the image from state
        const newImages = images.filter(img => img.id !== imageId);
        setImages(newImages);
        onChange?.(newImages);
        
        toast({
          title: 'Image removed',
          description: 'The image has been successfully removed'
        });
      } catch (error) {
        console.error('Delete error:', error);
        toast({
          title: 'Failed to remove image',
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
    },
    [images, onChange, toast]
  );

  // Get preview size class
  const getPreviewSizeClass = () => {
    switch (previewSize) {
      case 'sm': return 'h-20 w-20';
      case 'lg': return 'h-40 w-40';
      case 'md':
      default: return 'h-28 w-28';
    }
  };

  const previewSizeClass = getPreviewSizeClass();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image preview area */}
      {showPreview && images.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                'relative group overflow-hidden rounded-md border border-border',
                previewSizeClass
              )}
            >
              <img
                src={image.urls.thumbnail}
                alt={image.filename}
                className="object-cover w-full h-full transition-opacity"
                loading="lazy"
              />
              
              {/* Image metadata on hover */}
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="text-xs">
                  {Math.round(image.metadata.width)}×{Math.round(image.metadata.height)}
                </div>
                
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 self-end"
                  onClick={() => handleRemoveImage(image.id)}
                  disabled={disabled || isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Add more button (if under limit) */}
          {images.length < maxImages && allowMultiple && (
            <Button
              variant="outline"
              className={cn('flex flex-col items-center justify-center border-dashed', previewSizeClass)}
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <Plus className="h-6 w-6 mb-1" />
              <span className="text-xs">Add more</span>
            </Button>
          )}
        </div>
      )}
      
      {/* Upload area (when no images or not showing preview) */}
      {(images.length === 0 || !showPreview) && (
        <FileUploader
          onFilesSelected={handleFileSelect}
          disabled={disabled || isUploading}
          accept="image/*"
          multiple={allowMultiple}
          maxFiles={maxImages}
          ref={fileInputRef}
        >
          <div className="flex flex-col items-center justify-center p-6 text-center">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 mb-4 text-primary animate-spin" />
                <div className="text-lg font-medium mb-2">Uploading...</div>
                <div className="w-full max-w-xs h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300 ease-in-out" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {uploadProgress}% complete
                </div>
              </>
            ) : (
              <>
                <Image className="h-10 w-10 mb-4 text-muted-foreground" />
                <div className="text-lg font-medium mb-2">
                  {allowMultiple 
                    ? 'Drag & drop your images here' 
                    : 'Drag & drop your image here'}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Supported formats: JPEG, PNG, WebP. Max size: 5MB per image.
                </div>
                <Button
                  variant="outline"
                  disabled={disabled}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select {allowMultiple ? 'Images' : 'Image'}
                </Button>
              </>
            )}
          </div>
        </FileUploader>
      )}
      
      {/* Hidden file input for image selection */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple={allowMultiple}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(Array.from(e.target.files));
          }
        }}
        disabled={disabled || isUploading}
      />
    </div>
  );
}