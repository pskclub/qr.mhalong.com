
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputWrapperProps {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

const InputWrapper: React.FC<InputWrapperProps> = ({ label, children, icon: Icon }) => (
  <div className="relative">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3.5 text-slate-400" size={16} />}
      {children}
    </div>
  </div>
);

export default InputWrapper;
