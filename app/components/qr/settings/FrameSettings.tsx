
import React from 'react';
import { Frame, CaseLower } from 'lucide-react';
import { FrameType } from '../../../utils/frameGenerator';
import InputWrapper from '../../InputWrapper';

interface FrameSettingsProps {
  frameType: FrameType;
  setFrameType: (type: FrameType) => void;
  frameText: string;
  setFrameText: (text: string) => void;
  frameColor: string;
  setFrameColor: (color: string) => void;
  inputClass: (hasIcon: boolean) => string;
}

const FrameSettings: React.FC<FrameSettingsProps> = ({ 
  frameType, setFrameType, 
  frameText, setFrameText, 
  frameColor, setFrameColor, 
  inputClass 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
      <div className="p-3 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
            <Frame size={20} />
          </div>
          <h2 className="font-bold text-lg text-slate-700">เลือกกรอบ (Frame)</h2>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { id: 'none', label: 'None' },
            { id: 'border', label: 'Border' },
            { id: 'bottom-text', label: 'Bottom Text' },
            { id: 'top-bottom', label: 'Top & Bottom' },
          ].map((f) => (
             <button
                key={f.id}
                onClick={() => setFrameType(f.id as FrameType)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer border-2 ${
                    frameType === f.id
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-600'
                        : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
             >
                <div className="w-8 h-8 border-2 border-current rounded-lg mb-1 flex items-center justify-center">
                    {f.id === 'none' && <span className="text-xs">🚫</span>}
                    {f.id === 'border' && <div className="w-6 h-6 border border-current rounded-sm"></div>}
                    {f.id === 'bottom-text' && <div className="flex flex-col items-center justify-end h-full pb-0.5"><div className="w-4 h-0.5 bg-current"></div></div>}
                    {f.id === 'top-bottom' && <div className="flex flex-col items-center justify-between h-full py-0.5"><div className="w-4 h-0.5 bg-current"></div><div className="w-4 h-0.5 bg-current"></div></div>}
                </div>
                {f.label}
             </button>
          ))}
        </div>

        {frameType !== 'none' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                {frameType !== 'border' && (
                     <InputWrapper label="ข้อความบนกรอบ" icon={CaseLower}>
                        <input 
                            type="text" 
                            value={frameText} 
                            onChange={(e) => setFrameText(e.target.value)} 
                            maxLength={20}
                            className={inputClass(true)} 
                        />
                    </InputWrapper>
                )}
                
                 <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-slate-500 uppercase">สีกรอบ/ตัวหนังสือ</span>
                     <div className="flex-1 h-px bg-slate-100"></div>
                     <input 
                        type="color" 
                        value={frameColor} 
                        onChange={(e) => setFrameColor(e.target.value)} 
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-slate-200 p-0.5" 
                     />
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default FrameSettings;
