import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { upload } from '@vercel/blob/client';

interface FileFormProps {
  onUploadStart: () => void;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  inputClass: (hasIcon: boolean) => string;
}

const FileForm: React.FC<FileFormProps> = ({ onUploadStart, onUploadComplete, onUploadError, inputClass }) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    setFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);
    onUploadStart();

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
           setUploadProgress(progressEvent.percentage);
        }
      });

      onUploadComplete(newBlob.url);
    } catch (error) {
      console.error(error);
      onUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Upload File</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Upload size={18} />
          </div>
          <input
            ref={inputFileRef}
            type="file"
            onChange={handleUpload}
            className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 ${inputClass(true)} py-2`} 
            disabled={isUploading}
            
            accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv,application/rtf"
          />
        </div>
      </div>

       {isUploading && (
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div 
             className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
             style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-xs text-slate-500 mt-1 text-right">{uploadProgress}%</p>
        </div>
      )}
      
      {fileName && !isUploading && (
          <p className="text-xs text-slate-500 ml-1">Selected: {fileName}</p>
      )}
    </div>
  );
};

export default FileForm;
