import { useState, useRef, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface FileUploadBoxProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: string;
  preview?: string;
  label?: string;
  disabled?: boolean;
}

export const FileUploadBox = ({ 
  onFileSelect, 
  onFileRemove,
  accept = "image/*",
  preview,
  label = "Upload an image",
  disabled = false
}: FileUploadBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileRemove?.();
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full max-h-96 object-contain rounded-xl border border-border"
          />
          {!disabled && onFileRemove && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-background/90 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-smooth"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-smooth",
            isDragging ? "border-primary bg-accent" : "border-border hover:border-primary hover:bg-accent/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};
