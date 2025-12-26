import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from './glass-panel';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFilesAccepted: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
  /**
   * Increment this value to clear any uploaded files and revoke previews from outside the component
   */
  resetToken?: number;
  children?: React.ReactNode;
}

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesAccepted,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi']
  },
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  resetToken = 0,
  children
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const filesRef = React.useRef<UploadedFile[]>([]);

  const revokePreviews = (files: UploadedFile[]) => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploadedFiles(prev => {
      const next = [...prev, ...newFiles];
      filesRef.current = next;
      return next;
    });
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple: maxFiles > 1,
    onDragOver: () => {},
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false)
  });

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const next = prev.filter(f => f.id !== id);
      filesRef.current = next;
      return next;
    });
  };

  // Clear uploaded files when resetToken changes or component unmounts
  React.useEffect(() => {
    setUploadedFiles(prev => {
      revokePreviews(prev);
      filesRef.current = [];
      return [];
    });
  }, [resetToken]);

  React.useEffect(() => {
    return () => {
      revokePreviews(filesRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerClasses = cn(
    'relative',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Drop Zone */}
      <GlassPanel
        variant={isDragActive || dropzoneActive ? 'selected' : 'default'}
        blur="md"
        padding="lg"
        animated
        {...getRootProps()}
        className={cn(
          'cursor-pointer',
          'transition-all',
          'duration-300',
          'border-2',
          'border-dashed',
          isDragActive || dropzoneActive 
            ? 'border-primary-500 scale-105' 
            : 'border-border-glass hover:border-primary-300'
        )}
      >
        <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
        
        <div className="flex flex-col items-center justify-center text-center min-h-[200px]">
          <motion.div
            animate={isDragActive || dropzoneActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mb-4"
          >
            {/* Upload Icon */}
            <div className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
              isDragActive || dropzoneActive 
                ? 'bg-primary-500/20 text-primary-400' 
                : 'bg-surface-glassLight text-text-muted'
            )}>
              <svg 
                className="w-8 h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
            </div>
          </motion.div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {isDragActive || dropzoneActive 
                ? 'Drop files here' 
                : 'Upload Images & Videos'
              }
            </h3>
            <p className="text-text-secondary text-sm">
              Drag and drop your files here, or click to browse
            </p>
            <p className="text-text-muted text-xs">
              Supports: PNG, JPG, JPEG, GIF, WebP, BMP, MP4, WebM, MOV, AVI
            </p>
            <p className="text-text-muted text-xs">
              Max size: {Math.round(maxSize / (1024 * 1024))}MB per file
            </p>
          </div>

          {/* Browse Button */}
          <motion.button
            className="mt-6 px-6 py-2 rounded-full bg-primary-500 text-bg-depth font-medium hover:bg-primary-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
          >
            Browse Files
          </motion.button>
        </div>

        {/* Custom Children */}
        {children && (
          <div className="absolute inset-0 pointer-events-none">
            {children}
          </div>
        )}
      </GlassPanel>

      {/* File List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-2"
          >
            <h4 className="text-sm font-medium text-text-secondary">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedFiles.map((uploadedFile) => (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="glass-panel p-3 flex items-center gap-3"
                >
                  {/* File Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-glassLight flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img 
                        src={uploadedFile.preview} 
                        alt={uploadedFile.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-text-muted" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 rounded-full bg-destructive/20 hover:bg-destructive/40 text-destructive transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { FileUpload };
