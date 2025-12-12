
import React from 'react';
import { 
  Image as ImageIcon, Upload, Link as LinkIcon, LayoutGrid, CheckCircle 
} from 'lucide-react';
import { PRESET_ICONS } from '../../../constants/icons';
import InputWrapper from '../../InputWrapper';
// import { renderToStaticMarkup } from 'react-dom/server'; // This might need to be passed or imported. 
// Moving renderToStaticMarkup logic to parent or keeping it here? 
// It's used in handlePresetSelect. If I keep it here, I need to import it.
// It is a server-side method but commonly used in Next.js/React for SVG string generation.
import { renderToStaticMarkup } from 'react-dom/server';
import { LucideIcon } from 'lucide-react';

interface LogoSettingsProps {
  logoInputType: 'upload' | 'url' | 'preset';
  setLogoInputType: (type: 'upload' | 'url' | 'preset') => void;
  activePresetCategory: keyof typeof PRESET_ICONS;
  setActivePresetCategory: (category: keyof typeof PRESET_ICONS) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  logoFile: string | null;
  setLogoFile: (file: string | null) => void;
  logoUrlValid: boolean;
  logoUrlLoading: boolean;
  logoUrlError: string;
  inputClass: (hasIcon: boolean) => string;
}

const LogoSettings: React.FC<LogoSettingsProps> = ({
  logoInputType, setLogoInputType,
  activePresetCategory, setActivePresetCategory,
  logoUrl, setLogoUrl,
  logoFile, setLogoFile,
  logoUrlValid, logoUrlLoading, logoUrlError,
  inputClass
}) => {

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (iconObj: { icon: LucideIcon; color: string }) => {
    const Icon = iconObj.icon;
    const color = iconObj.color;
    
    // Create SVG string with specific color
    const svgString = renderToStaticMarkup(
      <Icon 
        color={color} 
        size={512} // High res
        strokeWidth={1.5}
        xmlns="http://www.w3.org/2000/svg"
        fill="none" 
      />
    );
    
    // Check for browser environment before using btoa
    const base64 = typeof window !== 'undefined' ? window.btoa(svgString) : '';
    const dataUri = `data:image/svg+xml;base64,${base64}`;
    
    setLogoFile(dataUri); // Treat as uploaded file
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
        <div className="p-3 md:p-5">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-500">
                    <ImageIcon size={20} />
                </div>
                <h2 className="font-bold text-lg text-slate-700">ใส่โลโก้หน่อยมั้ย</h2>
            </div>
            
            {/* Toggle between Upload, URL, and Icons */}
            <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                <button
                    onClick={() => { setLogoInputType('upload'); setLogoUrl(''); }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        logoInputType === 'upload'
                            ? 'bg-white text-orange-500 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <Upload size={14} />
                    อัปโหลด
                </button>
                <button
                    onClick={() => { setLogoInputType('url'); setLogoFile(null); }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        logoInputType === 'url'
                            ? 'bg-white text-orange-500 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <LinkIcon size={14} />
                    URL
                </button>
                <button
                    onClick={() => { setLogoInputType('preset'); setLogoFile(null); setLogoUrl(''); }}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        logoInputType === 'preset'
                            ? 'bg-white text-orange-500 shadow-sm'
                            : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <LayoutGrid size={14} />
                    ไอคอน
                </button>
            </div>
            
            {/* Upload Section */}
            {logoInputType === 'upload' && (
                <div className="relative w-full">
                    {/* The visual box */}
                    <div className="relative border-2 border-dashed border-orange-200 bg-orange-50/50 rounded-2xl p-6 text-center transition-all hover:bg-orange-50 hover:border-orange-300 group">
                        {/* The Input - covering this box with high Z-index */}
                        <input type="file" accept="image/*" onClick={(e) => ((e.target as HTMLInputElement).value = '')} onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        
                        {/* The Content */}
                        <div className="flex flex-col items-center pointer-events-none">
                            {logoFile ? (
                                <>
                                    <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-sm mb-2">
                                        <img src={logoFile} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-xs font-bold text-orange-500">เปลี่ยนรูป</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 text-orange-300 group-hover:text-orange-400 group-hover:scale-110 transition-transform">
                                        <Upload size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-500">แตะเพื่อเลือกรูป</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Delete Button - Outside the input area to avoid conflict */}
                    {logoFile && (
                        <button 
                            onClick={() => { setLogoFile(null); }} 
                            className="absolute top-2 right-2 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 z-20 shadow-sm cursor-pointer"
                            title="ลบโลโก้"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}
                </div>
            )}

            {/* URL Input Section */}
            {logoInputType === 'url' && (
                <div>
                    <InputWrapper label="ใส่ URL ของรูป" icon={LinkIcon}>
                        <input 
                            type="url" 
                            value={logoUrl} 
                            onChange={(e) => setLogoUrl(e.target.value)} 
                            placeholder="https://example.com/logo.png" 
                            className={inputClass(true)} 
                        />
                    </InputWrapper>
                    
                    {/* Loading State */}
                    {logoUrlLoading && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-blue-500">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-medium">กำลังโหลดรูป...</span>
                        </div>
                    )}
                    
                    {/* Error State */}
                    {logoUrlError && !logoUrlLoading && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-red-600">{logoUrlError}</span>
                        </div>
                    )}
                    
                    {/* Success State with Preview */}
                    {logoUrlValid && !logoUrlLoading && logoUrl && (
                        <div className="mt-3 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <div className="w-12 h-12 rounded-lg bg-white p-1.5 shadow-sm shrink-0">
                                <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                                    <span className="text-xs font-bold text-green-600">โหลดรูปสำเร็จ!</span>
                                </div>
                                <p className="text-[10px] text-green-600/70 mt-0.5 truncate">{logoUrl}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Preset Icons Section */}
            {logoInputType === 'preset' && (
                <div className="mt-4">
                    {/* Categories */}
                    <div className="flex overflow-x-auto gap-2 mb-4 pb-2 scrollbar-none">
                        {(Object.keys(PRESET_ICONS) as Array<keyof typeof PRESET_ICONS>).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActivePresetCategory(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    activePresetCategory === key
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {PRESET_ICONS[key].label}
                            </button>
                        ))}
                    </div>

                    {/* Icons Grid */}
                    <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {PRESET_ICONS[activePresetCategory].icons.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handlePresetSelect(item)}
                                    className="aspect-square flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-orange-100 transition-all group cursor-pointer"
                                    title={item.label}
                                >
                                    <Icon 
                                        size={24} 
                                        color={item.color} 
                                        className="mb-1 transition-transform group-hover:scale-110" 
                                    />
                                    {/* <span className="text-[9px] font-bold text-slate-400 group-hover:text-orange-400 truncate w-full text-center">{item.label}</span> */}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default LogoSettings;
