'use client';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

type UploadAreaProps = {
  onFile: (file: File | null) => void;
};

export default function UploadArea({ onFile } : UploadAreaProps) {
  const [files, setFiles] = useState<File[] | undefined>();
  const handleDrop = (droppedFiles: File[]) => {
    if (droppedFiles.length > 1) {
      alert("Please upload only ONE CSV file");
    }
    console.log(droppedFiles);

    const firstFile = droppedFiles?.[0] ?? null;
    setFiles(firstFile ? [firstFile] : undefined);
    onFile(firstFile);
  };
  return (
    <Dropzone onDrop={handleDrop} onError={console.error} src={files}>
      <DropzoneEmptyState>
        <div className="flex w-full items-center gap-4 p-8">
          <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <UploadIcon size={24} />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Upload a file</p>
            <p className="text-muted-foreground text-xs">
              Drag and drop or click to upload (1 file only)
            </p>
          </div>
        </div>
      </DropzoneEmptyState>
      <DropzoneContent />
    </Dropzone>
  );
};