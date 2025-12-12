
import React, { useEffect, useRef, useState } from 'react';
import { Download, Maximize, Sparkles, Heart } from 'lucide-react';
import { 
  FileExtension, DotStyle, CornerSquareStyle, CornerDotStyle,
  QRCodeStylingOptions, QRCodeStylingInstance
} from '../../types/qrcode';
import { generateFramedCanvas, FrameType } from '../../utils/frameGenerator';

interface QRCodePreviewProps {
  finalData: string;
  size: number;
  setSize: (size: number) => void;
  fileExt: FileExtension;
  setFileExt: (ext: FileExtension) => void;
  
  // Style Props
  qrColor: string;
  bgColor: string;
  isTransparent: boolean;
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  
  // Logo Props
  logoFile: string | null;
  logoUrl: string;
  logoUrlValid: boolean;
  
  // Frame Props
  frameType: FrameType;
  frameText: string;
  frameColor: string;
}

declare global {
  interface Window {
    QRCodeStyling: new (options: QRCodeStylingOptions) => QRCodeStylingInstance;
  }
}

const QRCodePreview: React.FC<QRCodePreviewProps> = ({
  finalData,
  size, setSize,
  fileExt, setFileExt,
  qrColor, bgColor, isTransparent,
  dotStyle, cornerSquareStyle, cornerDotStyle,
  logoFile, logoUrl, logoUrlValid,
  frameType, frameText, frameColor
}) => {
  const [libLoaded, setLibLoaded] = useState<boolean>(false);
  const qrCodeInstance = useRef<QRCodeStylingInstance | null>(null);
  const refContainer = useRef<HTMLDivElement | null>(null);

  // --- Load External Library Script ---
  useEffect(() => {
    // Check if script is already present
    if (document.querySelector('script[src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"]')) {
        setTimeout(() => setLibLoaded(true), 0);
        return;
    }

    const script = document.createElement('script');
    script.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Don't remove script on unmount to unnecessary reloads if component toggles
      // document.body.removeChild(script); 
    };
  }, []);

  // --- Initialize & Update QR Code ---
  useEffect(() => {
    if (!libLoaded || !window.QRCodeStyling || !refContainer.current) return;

    const options: QRCodeStylingOptions = {
        width: 600,
        height: 600,
        type: 'canvas' as const,
        data: finalData,
        image: logoFile || (logoUrlValid ? logoUrl : null),
        margin: 20,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte' as const,
          errorCorrectionLevel: 'H' as const
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 10,
          crossOrigin: 'anonymous' as const,
        },
        dotsOptions: {
          color: qrColor,
          type: dotStyle
        },
        backgroundOptions: {
          color: isTransparent ? 'transparent' : bgColor,
        },
        cornersSquareOptions: {
          color: qrColor,
          type: cornerSquareStyle,
        },
        cornersDotOptions: {
          color: qrColor,
          type: cornerDotStyle,
        }
      };

    if (!qrCodeInstance.current) {
      qrCodeInstance.current = new window.QRCodeStyling(options);
      qrCodeInstance.current.append(refContainer.current);
    } else {
      qrCodeInstance.current.update(options);
    }

  }, [libLoaded, finalData, qrColor, bgColor, isTransparent, dotStyle, cornerSquareStyle, cornerDotStyle, logoFile, logoUrl, logoUrlValid]);


  const handleDownload = async (): Promise<void> => {
    if (qrCodeInstance.current && refContainer.current) {
      // 1. Update QR to high res for download
      qrCodeInstance.current.update({
        width: Number(size),
        height: Number(size)
      });
      
      // 2. Initial delay to ensure render
      await new Promise(resolve => setTimeout(resolve, 50));

      // 3. Get the raw QR canvas
      const qrCanvas = refContainer.current.querySelector('canvas');
      if (qrCanvas) {
        let finalCanvas = qrCanvas;

        // 4. Apply Frame if selected
        if (frameType !== 'none') {
            finalCanvas = await generateFramedCanvas(qrCanvas, {
                type: frameType,
                text: frameText,
                color: frameColor,
                bgColor: isTransparent ? '#ffffff' : bgColor, // Frames usually need solid background if transparent
                textColor: frameColor
            });
        }

        // 5. Download logic
        const url = finalCanvas.toDataURL(`image/${fileExt}`);
        const link = document.createElement('a');
        link.download = `qr-${new Date().getTime()}.${fileExt}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // 6. Reset QR size for preview
      qrCodeInstance.current.update({
        width: 600,
        height: 600
      });
    }
  };

  if (!libLoaded) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-teal-400">
             <div className="animate-bounce mb-4">
                 <Heart className="w-8 h-8 fill-current" />
             </div>
             <span className="text-sm font-bold animate-pulse">กำลังโหลดระบบ QR...</span>
          </div>
      );
  }

  return (
    <div className="sticky top-24 space-y-6">
              
      {/* Preview Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-teal-200/50 border border-white overflow-hidden relative">
        {/* Decorative blobs updated colors */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-20 -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative p-4 md:p-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/5 rounded-full mb-6">
            <Maximize size={14} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
          </div>

          {/* QR Canvas Container with Frame Preview */}
          <div className="relative group transition-all duration-300 flex flex-col items-center"
               style={{
                    backgroundColor: frameType === 'none' ? 'transparent' : (isTransparent ? '#ffffff' : bgColor), // Frame bg
                    border: (frameType === 'border' || frameType === 'bottom-text' || frameType === 'top-bottom') ? `15px solid ${frameColor}` : 'none',
                    borderRadius: frameType !== 'none' ? '24px' : '0',
                    padding: frameType === 'none' ? '0' : '20px',
               }}
          >
             {/* Text for Top Frame */}
             {frameType === 'top-bottom' && (
                <div className="w-full text-center pb-4 font-bold text-xl z-10" style={{ color: frameColor }}>
                    {frameText}
                </div>
             )}

            {/* Background blob updated */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl opacity-30 blur group-hover:opacity-60 transition duration-500 -z-10"></div>
            
            <div 
                ref={refContainer} 
                className="relative bg-white p-6 rounded-2xl shadow-xl overflow-hidden [&_canvas]:max-w-full [&_canvas]:h-auto flex items-center justify-center"
                style={{ backgroundColor: isTransparent ? 'transparent' : bgColor }}
            >
                {/* Canvas renders here */}
            </div>

             {/* Text for Bottom/Top-Bottom Frame */}
             {(frameType === 'bottom-text' || frameType === 'top-bottom') && (
                <div className="w-full text-center pt-4 font-bold text-xl z-10" style={{ color: frameColor }}>
                    {frameText}
                </div>
             )}
          </div>
        </div>

        {/* Download Area */}
        <div className="bg-slate-50/80 p-4 md:p-6 border-t border-slate-100 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-end gap-4">
            
            <div className="flex-1 w-full space-y-4">
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                     {['png', 'jpeg', 'svg'].map((ext) => (
                        <button key={ext} onClick={() => setFileExt(ext as FileExtension)} className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${fileExt === ext ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                            {ext === 'jpeg' ? 'jpg' : ext}
                        </button>
                     ))}
                </div>
                <div>
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                        <span>Size</span>
                        <span>{size}px</span>
                    </div>
                    <input type="range" min="300" max="2000" step="100" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                </div>
            </div>

            <button 
                onClick={handleDownload}
                // Updated Button Gradient
                className="w-full md:w-auto shrink-0 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-teal-200 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
                <Download size={20} />
                <span>Download</span>
            </button>

          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white text-xs text-slate-500 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 bg-yellow-100 rounded-lg text-yellow-600 shrink-0">
            <Sparkles size={14} />
        </div>
        <p className="mt-1 font-medium">ทิปส์: ถ้าใส่รูปโลโก้ อย่าลืมเลือกสี QR Code ให้เข้มกว่าพื้นหลังนะ ไม่งั้นสแกนยาก!</p>
      </div>

    </div>
  );
};

export default QRCodePreview;
