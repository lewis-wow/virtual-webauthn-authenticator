import { Upload } from "lucide-react";
import type { DragEvent, RefObject } from "react";

interface FileDropzoneProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleBoxClick: () => void;
  handleDragOver: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
  handleFileSelect: (files: FileList | null) => void;
}

export const FileDropzone = ({
  fileInputRef,
  handleBoxClick,
  handleDragOver,
  handleDrop,
  handleFileSelect,
}: FileDropzoneProps) => {
  return (
    <div className="px-6">
      <div
        className="border-border flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center"
        onClick={handleBoxClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="bg-muted mb-2 rounded-full p-3">
          <Upload className="text-muted-foreground h-5 w-5" />
        </div>
        <p className="text-foreground text-sm font-medium">
          Upload a project image
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          or,{" "}
          <label
            htmlFor="fileUpload"
            className="text-primary hover:text-primary/90 cursor-pointer font-medium"
            onClick={(e) => e.stopPropagation()} // Prevent triggering handleBoxClick
          >
            click to browse
          </label>{" "}
          (4MB max)
        </p>
        <input
          type="file"
          id="fileUpload"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>
    </div>
  );
};
