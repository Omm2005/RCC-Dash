'use client';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { cn } from '@/lib/utils';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

type UploadAreaProps = {
  onFile: (file: File | null) => void;
  className?: string;
  isCompact?: boolean;
};

export default function UploadArea({ onFile, className, isCompact } : UploadAreaProps) {
  const [files, setFiles] = useState<File[] | undefined>();
  
  const handleDrop = (droppedFiles: File[]) => {
    if (droppedFiles.length > 1) {
      alert("Please upload only ONE CSV file");
      return;
    }

    const firstFile = droppedFiles?.[0];
    
    // Check if file is a CSV
    if (firstFile && !firstFile.name.toLowerCase().endsWith('.csv')) {
      alert("Please upload only CSV files");
      return;
    }

    setFiles(firstFile ? [firstFile] : undefined);
    onFile(firstFile ?? null);
  };

  return (
    <Dropzone
      onDrop={handleDrop}
      onError={console.error}
      src={files}
      accept={{ 'text/csv': ['.csv'] }}
      className={cn(isCompact && 'p-4', className)}
    >
      <DropzoneEmptyState>
        <div
          className={cn(
            'flex w-full flex-col items-start text-left',
            isCompact
              ? 'gap-2 p-3 sm:p-4'
              : 'gap-3 p-6 sm:flex-row sm:items-center sm:gap-4 sm:p-8'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center rounded-lg bg-muted text-muted-foreground',
              isCompact ? 'size-10' : 'size-14 sm:size-16'
            )}
          >
            <UploadIcon size={isCompact ? 18 : 24} />
          </div>
          <div className="text-left">
            <p className={cn('font-medium', isCompact ? 'text-xs' : 'text-sm')}>
              Upload a CSV file
            </p>
            <p className="text-muted-foreground text-xs">
              Drag and drop or click to upload (CSV only, 1 file)
            </p>
          </div>
        </div>
      </DropzoneEmptyState>
      <DropzoneContent />
    </Dropzone>
  );
};