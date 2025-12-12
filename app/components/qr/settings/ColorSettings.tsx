
import React from 'react';
import { Palette } from 'lucide-react';
import { DotStyle, CornerSquareStyle, CornerDotStyle } from '../../../types/qrcode';

interface ColorSettingsProps {
  qrColor: string;
  setQrColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  isTransparent: boolean;
  setIsTransparent: (isTransparent: boolean) => void;
  dotStyle: DotStyle;
  setDotStyle: (style: DotStyle) => void;
  cornerSquareStyle: CornerSquareStyle;
  setCornerSquareStyle: (style: CornerSquareStyle) => void;
  cornerDotStyle: CornerDotStyle;
  setCornerDotStyle: (style: CornerDotStyle) => void;
}

const ColorSettings: React.FC<ColorSettingsProps> = ({
  qrColor, setQrColor,
  bgColor, setBgColor,
  isTransparent, setIsTransparent,
  dotStyle, setDotStyle,
  cornerSquareStyle, setCornerSquareStyle,
  cornerDotStyle, setCornerDotStyle
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
      <div className="p-3 md:p-5 space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
            <Palette size={20} />
          </div>
          <h2 className="font-bold text-lg text-slate-700">แต่งสี & ทรง</h2>
        </div>

        {/* Color Pickers */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">สี QR</label>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-2 ring-white">
                <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
              </div>
              <span className="text-xs font-bold text-slate-600 font-mono">{qrColor}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">พื้นหลัง</label>
            <div className={`flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 ${isTransparent ? 'opacity-50' : ''}`}>
              <div className="relative overflow-hidden w-10 h-10 rounded-full shadow-sm ring-2 ring-white">
                <input type="color" value={bgColor} disabled={isTransparent} onChange={(e) => setBgColor(e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={isTransparent} 
                    onChange={(e) => setIsTransparent(e.target.checked)} 
                    className="peer sr-only" 
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-teal-400 peer-checked:to-emerald-400 transition-all duration-300 shadow-inner"></div>
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5 peer-checked:shadow-lg"></div>
                </div>
                <span className="text-xs font-bold text-slate-500 group-hover:text-teal-500 transition-colors">ใสๆ</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dot Style */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">จุดแบบไหนดี?</label>
          <div className="grid grid-cols-3 gap-2">
            {['rounded', 'dots', 'classy', 'extra-rounded', 'square', 'classy-rounded'].map((style) => (
              <button
                key={style}
                onClick={() => setDotStyle(style as DotStyle)}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border-2 uppercase transition-all cursor-pointer ${
                  dotStyle === style 
                  ? 'bg-teal-50 border-teal-400 text-teal-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {style.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Corner Styles */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">กรอบมุม</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['extra-rounded', 'square', 'dot'] as CornerSquareStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setCornerSquareStyle(style)}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border-2 uppercase transition-all cursor-pointer ${
                  cornerSquareStyle === style 
                  ? 'bg-teal-50 border-teal-400 text-teal-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {style === 'extra-rounded' ? 'Extra Round' : style}
              </button>
            ))}
          </div>
          
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">จุดมุม</label>
          <div className="grid grid-cols-2 gap-2">
            {(['dot', 'square'] as CornerDotStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setCornerDotStyle(style)}
                className={`py-2 px-1 text-[10px] font-bold rounded-xl border-2 uppercase transition-all cursor-pointer ${
                  cornerDotStyle === style 
                  ? 'bg-teal-50 border-teal-400 text-teal-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ColorSettings;
