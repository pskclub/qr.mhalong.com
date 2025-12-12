
import React from 'react';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200 transform rotate-3 hover:rotate-6 transition-transform">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500">
              QR<span className="text-teal-200">AFT</span>
            </h1>
            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">By PSKCLUB</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 px-4 py-1.5 bg-white border border-teal-100 text-teal-600 rounded-full text-xs font-bold shadow-sm">
             ✨ Free
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
