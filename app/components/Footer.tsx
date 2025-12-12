
import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="max-w-7xl mx-auto px-4 py-8 text-center">
      <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
          Made with <Heart size={14} className="text-teal-400 fill-teal-400 animate-pulse" /> for everyone By PskCluB
      </p>
    </footer>
  );
};

export default Footer;
