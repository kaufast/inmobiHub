import React, { useCallback, useState, forwardRef } from 'react';
import { useDropzone, FileRejection, type Accept } from 'react-dropzone';
import { cn } from '@/lib/utils';

export interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void;
  onFilesRejected?: (fileRejections: FileRejection[]) => void;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  minSize?: number;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
}

export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  (
    {
      onFilesSelected,
      onFilesRejected,
      accept,
      maxFiles = 10,
      maxSize = 5 * 1024 * 1024, // 5MB
      minSize = 0,
      disabled = false,
      multiple = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);

    const onDrop = useCallback(
      (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        if (acceptedFiles.length > 0) {
          onFilesSelected(acceptedFiles);
        }

        if (fileRejections.length > 0 && onFilesRejected) {
          onFilesRejected(fileRejections);
        }
      },
      [onFilesSelected, onFilesRejected]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: accept || { 'image/*': [] },
      maxFiles,
      maxSize,
      minSize,
      disabled,
      multiple,
      onDragEnter: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
      onDropAccepted: () => setIsDragging(false),
      onDropRejected: () => setIsDragging(false),
    });

    // Convert the external ref to a React ref for internal use
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Use effect to sync external ref with internal ref
    React.useEffect(() => {
      if (ref && 'current' in ref) {
        ref.current = inputRef.current;
      }
    }, [ref]);

    return (
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-md transition-colors cursor-pointer',
          disabled ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:border-primary/50',
          isDragActive || isDragging ? 'border-primary bg-primary/5' : 'border-border',
          className
        )}
        {...props}
      >
        <input {...getInputProps()} ref={inputRef} />
        {children}
      </div>
    );
  }
);