import { useState, useEffect } from 'react';
import { DataType, DotStyle, CornerSquareStyle, CornerDotStyle, VCardData, WifiEncryption } from '../types/qrcode';
import { FrameType } from '../utils/frameGenerator';
import { PRESET_ICONS } from '../constants/icons';

// Define the shape of a saved QR code item
export interface QRHistoryItem {
  id: string;
  timestamp: number;
  name: string; // Auto-generated name or user provided
  
  // Data State
  dataType: DataType;
  content: string;
  wifiSsid?: string;
  wifiPassword?: string;
  wifiEncryption?: WifiEncryption;
  smsPhone?: string;
  smsMessage?: string;
  vcardData?: VCardData;
  promptpayId?: string;
  promptpayAmount?: string;
  promptpayIdType?: 'mobile' | 'citizen' | 'tax' | 'ewallet';
  fileUrl?: string;

  // Style State
  qrColor: string;
  bgColor: string;
  isTransparent: boolean;
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;

  // Frame State
  frameType: FrameType;
  frameText: string;
  frameColor: string;

  // Logo State
  logoInputType: 'upload' | 'url' | 'preset';
  activePresetCategory: keyof typeof PRESET_ICONS;
  logoUrl: string;
  // Note: We might skip saving the actual logo file blob/base64 to avoid quota limits, 
  // or only save small ones. For now let's just save the URL/Category.
}

const HISTORY_KEY = 'qr_generator_history';
const MAX_HISTORY_ITEMS = 20;

export const useQRHistory = () => {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse QR history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const addToHistory = (item: Omit<QRHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: QRHistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Remove duplicates if exactly same content? Maybe complex. 
      // Just start with prepending.
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    isLoaded
  };
};
