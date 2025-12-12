import React, { useRef, useState } from 'react';
import { Upload, Trash2, FileText, RefreshCw, AlertTriangle } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const confirmDelete = async () => {
    if (!fileUrl) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fileUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFileName('');
      setFileUrl('');
      onUploadComplete('');
      if (inputFileRef.current) {
        inputFileRef.current.value = '';
      }
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error(error);
      alert('Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleValuesChange = () => {
     // If changing file, we might want to delete the old one first or just overwrite UI
     // For now, let's keep it simple: UI replace, but maybe warn?
     // Or just let user click input.
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
              suppressHydrationWarning={true}
            />
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="flex items-center gap-2 mt-4">
            <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div 
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
            ></div>
            </div>
            <p className="text-xs text-slate-500 whitespace-nowrap">{uploadProgress}%</p>
        </div>
      )}
      
      {/* 
        Condition 2: File Uploaded (and not currently uploading)
        Show File Card with actions
      */}
      {fileName && !isUploading && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 relative overflow-hidden">
             
             {/* Delete Confirmation Overlay */}
             {showDeleteConfirm && (
                <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center anim-fade-in">
                    <AlertTriangle className="text-amber-500 mb-2" size={24} />
                    <p className="text-sm font-semibold text-slate-800 mb-1">คุณแน่ใจว่าต้องการลบไฟล์นี้?</p>
                    <p className="text-xs text-slate-500 mb-3">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                            disabled={isDeleting}
                        >
                            ยกเลิก
                        </button>
                        <button 
                            onClick={confirmDelete}
                            className="px-3 py-1.5 bg-red-500 border border-red-500 rounded-lg text-xs font-medium text-white hover:bg-red-600 flex items-center gap-1.5"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                        </button>
                    </div>
                </div>
             )}

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
                      onClick={handleValuesChange}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-teal-600 transition-colors"
                   >
                      <RefreshCw size={14} />
                      เปลี่ยนไฟล์
                   </button>
                   
                   <button 
                      onClick={handleRemoveClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-red-500 text-xs font-medium border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                   >
                      <Trash2 size={14} />
                      ลบไฟล์
                   </button>
                </div>
             </div>
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
            suppressHydrationWarning={true}
          />
      )}
    </div>
  );
};

export default FileForm;
