import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFileContent: (content: string[]) => void;
}

function FileUploader({ onFileContent }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (file) {
      const text = await file.text();
      const emails = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line));
      onFileContent(emails);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
        dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.csv"
        onChange={handleChange}
        className="hidden"
      />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Drag and drop your file here, or{' '}
        <button
          type="button"
          onClick={onButtonClick}
          className="text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
        >
          browse
        </button>
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Only .txt or .csv files with one email per line
      </p>
    </div>
  );
}

export default FileUploader;