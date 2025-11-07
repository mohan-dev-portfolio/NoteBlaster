
import React, { useState, useCallback } from 'react';
import { FileUp, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const ACCEPTED_FILES = ".pdf,.docx,.txt";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((files: FileList | null) => {
    setError(null);
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > MAX_SIZE_BYTES) {
        setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }
      if (!ACCEPTED_FILES.split(',').some(ext => file.name.endsWith(ext))) {
        setError("Invalid file type. Please upload a PDF, DOCX, or TXT file.");
        return;
      }
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFile(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleFile(e.target.files);
  };

  return (
    <div className="w-full max-w-lg text-center p-8 bg-surface rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-bold mb-2 text-text-primary">Upload Your Study Notes</h2>
      <p className="text-text-secondary mb-6">Let AI create your study guide and quiz game.</p>
      
      <div 
        onDragEnter={handleDrag} 
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative p-10 border-2 border-dashed rounded-lg transition-colors ${dragActive ? 'border-primary bg-gray-800' : 'border-gray-600 hover:border-primary'}`}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={ACCEPTED_FILES}
          onChange={handleChange}
        />
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
          <FileUp className="w-12 h-12 text-gray-500 mb-4" />
          <p className="font-semibold text-text-primary">
            <span className="text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or TXT (Max {MAX_SIZE_MB}MB)</p>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 text-red-300 border border-red-700 rounded-lg flex items-center text-sm">
          <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

       <div className="mt-6 text-left text-sm text-text-secondary space-y-3">
            <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-text-primary">AI Summaries:</span> Get key points instantly.</span>
            </div>
            <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-text-primary">Interactive Quizzes:</span> Turn notes into a fun game.</span>
            </div>
            <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-text-primary">Reinforce Learning:</span> Study smarter, not harder.</span>
            </div>
        </div>
    </div>
  );
};
