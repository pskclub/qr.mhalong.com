
import React from 'react';
import { DataType } from '../../types/qrcode';
import { Link as LinkIcon, Type, Phone, Wifi, Mail, Contact, MessageSquare, Banknote, FileText } from 'lucide-react';

interface ContentTypeSelectorProps {
  dataType: DataType;
  setDataType: (type: DataType) => void;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({ dataType, setDataType }) => {
  const types = [
    { id: 'url', icon: LinkIcon, label: 'URL' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'phone', icon: Phone, label: 'Call' },
    { id: 'wifi', icon: Wifi, label: 'WiFi' },
    { id: 'email', icon: Mail, label: 'Email' },
    { id: 'vcard', icon: Contact, label: 'vCard' },
    { id: 'sms', icon: MessageSquare, label: 'SMS' },
    { id: 'promptpay', icon: Banknote, label: 'PromptPay' },
    { id: 'file', icon: FileText, label: 'File' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {types.map((t) => (
        <button
          key={t.id}
          onClick={() => setDataType(t.id as DataType)}
          className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-2xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
            dataType === t.id 
              ? 'bg-gradient-to-b from-teal-400 to-teal-500 text-white shadow-lg shadow-teal-200 transform scale-105' 
              : 'bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-400'
          }`}
        >
          <t.icon size={18} className="mb-1.5" />
          {t.label}
        </button>
      ))}
    </div>
  );
};

export default ContentTypeSelector;
