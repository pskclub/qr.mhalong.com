import React from 'react';
import { Clock, Trash2, ArrowRightCircle } from 'lucide-react';
import { QRHistoryItem, useQRHistory } from '../../hooks/useQRHistory'; // Adjust path if needed
import { DataType } from '../../types/qrcode';

interface HistorySectionProps {
  onRestore: (item: QRHistoryItem) => void;
  currentHistory: ReturnType<typeof useQRHistory>;
}

const HistorySection: React.FC<HistorySectionProps> = ({ onRestore, currentHistory }) => {
  const { history, removeFromHistory, clearHistory } = currentHistory;

  if (history.length === 0) {
    return null;
  }

  const getIconForType = (type: DataType) => {
    switch (type) {
      case 'url': return '🔗';
      case 'text': return '📝';
      case 'phone': return '📞';
      case 'email': return '📧';
      case 'wifi': return '📶';
      case 'vcard': return '📇';
      case 'sms': return '💬';
      case 'whatsapp': return '📱';
      case 'promptpay': return '💰';
      case 'file': return '📁';
      default: return '📄';
    }
  };

  const cleanContent = (item: QRHistoryItem) => {
     if (item.dataType === 'url') return item.content.replace(/^https?:\/\//, '');
     if (item.dataType === 'wifi') return `WiFi: ${item.wifiSsid}`;
     if (item.dataType === 'vcard') return `${item.vcardData?.firstName} ${item.vcardData?.lastName}`;
     if (item.dataType === 'promptpay') return `PromptPay: ${item.promptpayId}`;
     return item.content.length > 30 ? item.content.substring(0, 30) + '...' : item.content;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white mt-6">
      <div className="p-3 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
              <Clock size={20} />
            </div>
            <h2 className="font-bold text-lg text-slate-700">ประวัติการสร้าง</h2>
          </div>
          <button 
            onClick={clearHistory}
            className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            ล้างประวัติ
          </button>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {history.map((item) => (
            <div 
                key={item.id} 
                className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-teal-200 rounded-xl p-3 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                onClick={() => onRestore(item)}
            >
               <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 overflow-hidden">
                     <span className="text-xl mt-0.5">{getIconForType(item.dataType)}</span>
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-700 text-sm truncate">{item.name || cleanContent(item)}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
                            {new Date(item.timestamp).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                     >
                        <Trash2 size={14} />
                     </button>
                     <div className="p-1.5 text-teal-500 bg-teal-50 rounded-lg">
                        <ArrowRightCircle size={14} />
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistorySection;
