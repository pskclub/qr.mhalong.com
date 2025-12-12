import React, { useRef, useState } from 'react';
import { Upload, X, Trash2, FileText, RefreshCw } from 'lucide-react';
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
  const [fileUrl, setFileUrl] = useState<string>('');

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
      const ext = file.name.split('.').pop();
      const randomName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;

      const newBlob = await upload(randomName, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
           setUploadProgress(progressEvent.percentage);
        }
      });

      onUploadComplete(newBlob.url);
      setFileUrl(newBlob.url);
    } catch (error) {
      console.error(error);
      onUploadError('Upload failed. Please try again.');
      setFileName(''); // Reset on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setFileName('');
    setFileUrl('');
    onUploadComplete('');
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const handleChange = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  return (
    <div>
      {/* 
        Condition 1: No file selected OR currently uploading
        Show Input (disabled if uploading)
      */}
      {(!fileName || isUploading) && (
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
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="flex items-center gap-2">
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
          <div 
             className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
             style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-500 mt-1 text-right mb-3">{uploadProgress}%</p>
      </div>
      )}
      
      {/* 
        Condition 2: File Uploaded (and not currently uploading)
        Show File Card with actions
      */}
      {fileName && !isUploading && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
             <div className="p-2 bg-teal-100/50 rounded-lg text-teal-600 shrink-0">
                <FileText size={24} />
             </div>
             
             <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
                {fileUrl && (
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-700 hover:underline truncate block mt-0.5"
                  >
                    {fileUrl}
                  </a>
                )}
                
                <div className="flex items-center gap-2 mt-3">
                   <button 
                      onClick={handleChange}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-teal-600 transition-colors"
                   >
                      <RefreshCw size={14} />
                      เปลี่ยนไฟล์
                   </button>
                   
                   <button 
                      onClick={handleRemove}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-500 text-xs font-medium border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                   >
                      <Trash2 size={14} />
                      ลบไฟล์
                   </button>
                </div>
             </div>

             {/* Hidden input for "Change" action to work if the main input is hidden/removed from DOM 
                 Wait, if I remove the main input from DOM, I can't trigger it easily unless I keep it hidden or render it invisibly.
                 Better to render it hidden.
             */}
          </div>
      )}

      {/* Hidden input to support "Change" action when the main input is hidden */}
      {fileName && !isUploading && (
         <input
            ref={inputFileRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/csv,application/rtf"
          />
      )}
    </div>
  );
};

export default FileForm;
