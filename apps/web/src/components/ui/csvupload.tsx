'use client';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';
const UploadArea = () => {
  const [files, setFiles] = useState<File[] | undefined>();
  const handleDrop = (files: File[]) => {
    console.log(files);
    setFiles(files);
  };
  return (
    <Dropzone onDrop={handleDrop} onError={console.error} src={files}>
      <DropzoneEmptyState>
        <div className="flex w-full flex-col items-start gap-3 p-6 text-left sm:flex-row sm:items-center sm:gap-4 sm:p-8">
          <div className="flex size-14 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:size-16">
            <UploadIcon size={24} />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Upload a file</p>
            <p className="text-muted-foreground text-xs">
              Drag and drop or click to upload
            </p>
          </div>
        </div>
      </DropzoneEmptyState>
      <DropzoneContent />
    </Dropzone>
  );
};
export default UploadArea;
