"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { anyId } from 'promptparse/generate';
import { 
  Download, 
  Settings, 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Phone, 
  Wifi, 
  Mail, 
  Maximize,
  CheckCircle,
  Palette,
  LayoutGrid,
  Upload,
  Sparkles,
  Heart,
  Contact,
  MessageSquare,
  MessageCircle,
  MapPin,
  Building2,
  Globe,
  Banknote,
  LucideIcon
} from 'lucide-react';

// TypeScript interfaces and types
interface VCardData {
  firstName: string;
  lastName: string;
  mobile: string;
  phone: string;
  email: string;
  website: string;
  company: string;
  job: string;
  street: string;
  city: string;
  country: string;
}

type DataType = 'url' | 'text' | 'phone' | 'email' | 'wifi' | 'sms' | 'whatsapp' | 'vcard' | 'promptpay';
type FileExtension = 'png' | 'jpeg' | 'svg';
type DotStyle = 'rounded' | 'dots' | 'classy' | 'extra-rounded' | 'square' | 'classy-rounded';
type CornerSquareStyle = 'extra-rounded' | 'square' | 'dot';
type CornerDotStyle = 'dot' | 'square';
type WifiEncryption = 'WPA' | 'nopass';

interface QRCodeStylingOptions {
  width: number;
  height: number;
  type: 'canvas' | 'svg';
  data: string;
  image?: string | null;
  margin: number;
  qrOptions: {
    typeNumber: number;
    mode: 'Byte';
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  };
  imageOptions: {
    hideBackgroundDots: boolean;
    imageSize: number;
    margin: number;
    crossOrigin: 'anonymous';
  };
  dotsOptions: {
    color: string;
    type: DotStyle;
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    color: string;
    type: CornerSquareStyle;
  };
  cornersDotOptions: {
    color: string;
    type: CornerDotStyle;
  };
}

interface QRCodeStylingInstance {
  append: (element: HTMLElement | null) => void;
  update: (options: Partial<QRCodeStylingOptions>) => void;
  download: (options: { name: string; extension: FileExtension }) => void;
}

declare global {
  interface Window {
    QRCodeStyling: new (options: QRCodeStylingOptions) => QRCodeStylingInstance;
  }
}

interface InputWrapperProps {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

// InputWrapper Component - moved outside to avoid React render errors
const InputWrapper: React.FC<InputWrapperProps> = ({ label, children, icon: Icon }) => (
  <div className="relative">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-3.5 text-slate-400" size={16} />}
      {children}
    </div>
  </div>
);

const QRCodeGenerator: React.FC = () => {
  const [libLoaded, setLibLoaded] = useState<boolean>(false);
  const qrCodeInstance = useRef<QRCodeStylingInstance | null>(null);
  const refContainer = useRef<HTMLDivElement | null>(null);

  // --- State for Data Content ---
  const [dataType, setDataType] = useState<DataType>('url'); 
  const [content, setContent] = useState<string>('');
  
  // Specific inputs
  const [wifiSsid, setWifiSsid] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const [wifiEncryption, setWifiEncryption] = useState<WifiEncryption>('WPA');

  // SMS & WhatsApp
  const [smsPhone, setSmsPhone] = useState<string>('');
  const [smsMessage, setSmsMessage] = useState<string>('');
  
  // vCard
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '',
    lastName: '',
    mobile: '',
    phone: '',
    email: '',
    website: '',
    company: '',
    job: '',
    street: '',
    city: '',
    country: ''
  });

  const updateVcard = (field: keyof VCardData, value: string): void => {
    setVcardData(prev => ({ ...prev, [field]: value }));
  };

  // PromptPay
  const [promptpayId, setPromptpayId] = useState<string>('');
  const [promptpayAmount, setPromptpayAmount] = useState<string>('');
  const [promptpayIdType, setPromptpayIdType] = useState<'mobile' | 'citizen' | 'tax' | 'ewallet'>('mobile');

  // Generate PromptPay QR String using promptparse library
  const generatePromptPayQR = useCallback((id: string, amount: string, idType: string): string => {
    try {
      // Prepare the ID based on type
      let formattedId = id.trim();
      
      // For mobile numbers, remove spaces and dashes
      if (idType === 'mobile') {
        formattedId = formattedId.replace(/[\s-]/g, '');
      }
      
      // Map our idType to ProxyType
      let proxyType: 'MSISDN' | 'NATID' | 'EWALLETID';
      
      if (idType === 'mobile') {
        proxyType = 'MSISDN';
      } else if (idType === 'citizen' || idType === 'tax') {
        proxyType = 'NATID';
      } else {
        proxyType = 'EWALLETID';
      }
      
      // Use promptparse library to generate PromptPay QR
      const payload = anyId({
        type: proxyType,
        target: formattedId,
        amount: amount && parseFloat(amount) > 0 ? parseFloat(amount) : undefined,
      });
      
      return payload;
    } catch (error) {
      console.error('Error generating PromptPay QR:', error);
      return 'https://qr.mhalong.com'; // Fallback
    }
  }, []);

  // --- State for Styles ---
  const [size, setSize] = useState<number>(1000);
  const [fileExt, setFileExt] = useState<FileExtension>('png');
  // Updated default color to #14b8a6 (Teal)
  const [qrColor, setQrColor] = useState<string>('#000000'); 
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  
  const [dotStyle, setDotStyle] = useState<DotStyle>('rounded'); 
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareStyle>('extra-rounded'); 
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>('dot'); 

  // --- State for Logo ---
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url'>('upload');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoUrlValid, setLogoUrlValid] = useState<boolean>(false);
  const [logoUrlLoading, setLogoUrlLoading] = useState<boolean>(false);
  const [logoUrlError, setLogoUrlError] = useState<string>('');

  // --- Validate Logo URL ---
  useEffect(() => {
    let isMounted = true;
    
    if (!logoUrl) {
      // Use microtask to avoid synchronous setState
      Promise.resolve().then(() => {
        if (isMounted) {
          setLogoUrlValid(false);
          setLogoUrlLoading(false);
          setLogoUrlError('');
        }
      });
      return () => { isMounted = false; };
    }

    // Start loading
    Promise.resolve().then(() => {
      if (isMounted) {
        setLogoUrlLoading(true);
        setLogoUrlError('');
        setLogoUrlValid(false);
      }
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLogoUrlLoading(false);
        setLogoUrlError('โหลดรูปใช้เวลานานเกินไป');
      }
    }, 10000); // 10 second timeout

    img.onload = () => {
      clearTimeout(timeoutId);
      if (isMounted) {
        setLogoUrlLoading(false);
        setLogoUrlValid(true);
        setLogoUrlError('');
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      if (isMounted) {
        setLogoUrlLoading(false);
        setLogoUrlValid(false);
        setLogoUrlError('ไม่สามารถโหลดรูปได้ กรุณาตรวจสอบ URL');
      }
    };

    img.src = logoUrl;

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [logoUrl]);

  // --- Load External Library Script ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js";
    script.async = true;
    script.onload = () => setLibLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // --- Initialize & Update QR Code ---
  useEffect(() => {
    if (!libLoaded || !window.QRCodeStyling) return;

    let finalData = content || 'https://qr.mhalong.com';
    
    // Construct data string based on type
    if (dataType === 'phone') finalData = `tel:${content}`;
    if (dataType === 'email') finalData = `mailto:${content}`;
    if (dataType === 'wifi') finalData = `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
    if (dataType === 'sms') finalData = `SMSTO:${smsPhone}:${smsMessage}`;
    if (dataType === 'whatsapp') finalData = `https://wa.me/${smsPhone}?text=${encodeURIComponent(smsMessage)}`;
    
    if (dataType === 'vcard') {
      finalData = `BEGIN:VCARD
VERSION:3.0
N:${vcardData.lastName};${vcardData.firstName};;;
FN:${vcardData.firstName} ${vcardData.lastName}
ORG:${vcardData.company}
TITLE:${vcardData.job}
TEL;TYPE=CELL:${vcardData.mobile}
TEL;TYPE=WORK:${vcardData.phone}
EMAIL:${vcardData.email}
URL:${vcardData.website}
ADR;TYPE=WORK:;;${vcardData.street};${vcardData.city};;${vcardData.country}
END:VCARD`;
    }
    
    if (dataType === 'promptpay') {
      if (promptpayId) {
        finalData = generatePromptPayQR(promptpayId, promptpayAmount, promptpayIdType);
      } else {
        finalData = 'https://qr.mhalong.com'; // Default if no ID provided
      }
    }

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

  }, [libLoaded, dataType, content, wifiSsid, wifiPassword, wifiEncryption, smsPhone, smsMessage, vcardData, promptpayId, promptpayAmount, promptpayIdType, qrColor, bgColor, isTransparent, dotStyle, cornerSquareStyle, cornerDotStyle, logoUrl, logoFile, logoUrlValid, generatePromptPayQR]);

  // --- Handlers ---
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

  const handleDownload = (): void => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        width: Number(size),
        height: Number(size)
      });
      qrCodeInstance.current.download({
        name: `qr-${dataType} from qr.mhalong.com`,
        extension: fileExt
      });
      qrCodeInstance.current.update({
        width: 600,
        height: 600
      });
    }
  };

  // Updated focus ring to teal-400 and focus border to teal-400
  const inputClass = (hasIcon: boolean): string => `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-medium text-slate-600 text-sm placeholder:text-slate-300`;

  if (!libLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-teal-50 text-teal-400">
        <div className="animate-bounce flex flex-col items-center">
          <Heart className="w-12 h-12 fill-current mb-4" />
          <span className="font-bold text-lg">กำลังเตรียมความน่ารัก...</span>
        </div>
      </div>
    );
  }

  return (
    // Updated background gradient to match Teal theme
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-100 font-sans text-slate-700 pb-12 selection:bg-teal-200">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Header Icon Gradient Updated */}
            <div className="w-10 h-10 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200 transform rotate-3 hover:rotate-6 transition-transform">
              <Sparkles size={20} />
            </div>
            <div>
              {/* Title Gradient Updated */}
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500">
                QR<span className="text-teal-200">AFT</span>
              </h1>
              <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">By PSKCLUB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-4 py-1.5 bg-white border border-teal-100 text-teal-600 rounded-full text-xs font-bold shadow-sm">
               ✨ Free
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Settings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Content Type */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                    <Settings size={20} />
                  </div>
                  <h2 className="font-bold text-lg text-slate-700">จะสร้าง QR อะไรดี?</h2>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'url', icon: LinkIcon, label: 'URL' },
                    { id: 'text', icon: Type, label: 'Text' },
                    { id: 'phone', icon: Phone, label: 'Call' },
                    { id: 'wifi', icon: Wifi, label: 'WiFi' },
                    { id: 'email', icon: Mail, label: 'Email' },
                    { id: 'vcard', icon: Contact, label: 'vCard' },
                    { id: 'sms', icon: MessageSquare, label: 'SMS' },
                    { id: 'promptpay', icon: Banknote, label: 'PromptPay' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDataType(t.id as DataType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl text-[10px] font-bold transition-all duration-200 cursor-pointer ${
                        dataType === t.id 
                          // Updated Active State Gradient
                          ? 'bg-gradient-to-b from-teal-400 to-teal-500 text-white shadow-lg shadow-teal-200 transform scale-105' 
                          : 'bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-400'
                      }`}
                    >
                      <t.icon size={18} className="mb-1.5" />
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  
                  {/* URL */}
                  {dataType === 'url' && (
                    <InputWrapper label="วางลิงก์ตรงนี้เลย">
                        <input type="url" value={content} onChange={(e) => setContent(e.target.value)} placeholder="https://..." className={inputClass(false)} />
                    </InputWrapper>
                  )}

                  {/* Text */}
                  {dataType === 'text' && (
                    <InputWrapper label="ข้อความของคุณ">
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4} className={inputClass(false)} />
                    </InputWrapper>
                  )}

                  {/* Phone */}
                  {dataType === 'phone' && (
                     <InputWrapper label="เบอร์โทรศัพท์" icon={Phone}>
                        <input type="tel" value={content} onChange={(e) => setContent(e.target.value)} placeholder="081 234 5678" className={inputClass(true)} />
                     </InputWrapper>
                  )}

                  {/* Email */}
                  {dataType === 'email' && (
                     <InputWrapper label="อีเมลปลายทาง" icon={Mail}>
                        <input type="email" value={content} onChange={(e) => setContent(e.target.value)} placeholder="hello@example.com" className={inputClass(true)} />
                     </InputWrapper>
                  )}

                  {/* WiFi */}
                  {dataType === 'wifi' && (
                    <div className="space-y-3">
                        <InputWrapper label="ชื่อ WiFi (SSID)" icon={Wifi}>
                            <input type="text" value={wifiSsid} onChange={(e)=>setWifiSsid(e.target.value)} className={inputClass(true)} />
                        </InputWrapper>
                        <InputWrapper label="รหัสผ่าน">
                            <input type="text" value={wifiPassword} onChange={(e)=>setWifiPassword(e.target.value)} className={inputClass(false)} />
                        </InputWrapper>
                        <InputWrapper label="ระบบความปลอดภัย">
                            <select value={wifiEncryption} onChange={(e)=>setWifiEncryption(e.target.value as WifiEncryption)} className={inputClass(false)}>
                                <option value="WPA">WPA/WPA2</option>
                                <option value="nopass">ไม่มีรหัสผ่าน</option>
                            </select>
                        </InputWrapper>
                    </div>
                  )}

                  {/* SMS */}
                  {dataType === 'sms' && (
                    <div className="space-y-3">
                        <InputWrapper label="เบอร์โทรศัพท์" icon={Phone}>
                            <input type="tel" value={smsPhone} onChange={(e)=>setSmsPhone(e.target.value)} placeholder="081 234 5678" className={inputClass(true)} />
                        </InputWrapper>
                        <InputWrapper label="ข้อความ">
                            <textarea value={smsMessage} onChange={(e)=>setSmsMessage(e.target.value)} rows={3} className={inputClass(false)} />
                        </InputWrapper>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {dataType === 'whatsapp' && (
                    <div className="space-y-3">
                         <InputWrapper label="เบอร์ WhatsApp (มีรหัสประเทศ เช่น 66)" icon={Phone}>
                            <input type="tel" value={smsPhone} onChange={(e)=>setSmsPhone(e.target.value)} placeholder="66812345678" className={inputClass(true)} />
                        </InputWrapper>
                        <InputWrapper label="ข้อความเริ่มต้น">
                            <textarea value={smsMessage} onChange={(e)=>setSmsMessage(e.target.value)} rows={3} className={inputClass(false)} />
                        </InputWrapper>
                    </div>
                  )}

                  {/* vCard */}
                  {dataType === 'vcard' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InputWrapper label="ชื่อจริง">
                                <input type="text" value={vcardData.firstName} onChange={(e) => updateVcard('firstName', e.target.value)} placeholder="สมชาย" className={inputClass(false)} />
                            </InputWrapper>
                            <InputWrapper label="นามสกุล">
                                <input type="text" value={vcardData.lastName} onChange={(e) => updateVcard('lastName', e.target.value)} placeholder="ใจดี" className={inputClass(false)} />
                            </InputWrapper>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <InputWrapper label="มือถือ" icon={Phone}>
                                <input type="tel" value={vcardData.mobile} onChange={(e) => updateVcard('mobile', e.target.value)} placeholder="081 234 5678" className={inputClass(true)} />
                            </InputWrapper>
                            <InputWrapper label="โทรศัพท์ (งาน)" icon={Phone}>
                                <input type="tel" value={vcardData.phone} onChange={(e) => updateVcard('phone', e.target.value)} placeholder="02 123 4567" className={inputClass(true)} />
                            </InputWrapper>
                        </div>
                        <InputWrapper label="อีเมล" icon={Mail}>
                            <input type="email" value={vcardData.email} onChange={(e) => updateVcard('email', e.target.value)} placeholder="somchai@example.com" className={inputClass(true)} />
                        </InputWrapper>
                        <InputWrapper label="เว็บไซต์" icon={Globe}>
                            <input type="url" value={vcardData.website} onChange={(e) => updateVcard('website', e.target.value)} placeholder="https://example.com" className={inputClass(true)} />
                        </InputWrapper>
                         <div className="grid grid-cols-2 gap-3">
                            <InputWrapper label="บริษัท" icon={Building2}>
                                <input type="text" value={vcardData.company} onChange={(e) => updateVcard('company', e.target.value)} placeholder="บริษัท ABC จำกัด" className={inputClass(true)} />
                            </InputWrapper>
                            <InputWrapper label="ตำแหน่ง">
                                <input type="text" value={vcardData.job} onChange={(e) => updateVcard('job', e.target.value)} placeholder="ผู้จัดการ" className={inputClass(false)} />
                            </InputWrapper>
                        </div>
                         <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <InputWrapper label="ถนน/ซอย" icon={MapPin}>
                                    <input type="text" value={vcardData.street} onChange={(e) => updateVcard('street', e.target.value)} placeholder="123 ถนนสุขุมวิท" className={inputClass(true)} />
                                </InputWrapper>
                            </div>
                            <InputWrapper label="จังหวัด">
                                <input type="text" value={vcardData.city} onChange={(e) => updateVcard('city', e.target.value)} placeholder="กรุงเทพฯ" className={inputClass(false)} />
                            </InputWrapper>
                            <InputWrapper label="ประเทศ">
                                <input type="text" value={vcardData.country} onChange={(e) => updateVcard('country', e.target.value)} placeholder="ประเทศไทย" className={inputClass(false)} />
                            </InputWrapper>
                        </div>
                    </div>
                  )}

                  {/* PromptPay */}
                  {dataType === 'promptpay' && (
                    <div className="space-y-4">
                        <InputWrapper label="ประเภทบัญชี">
                            <select 
                              value={promptpayIdType} 
                              onChange={(e) => setPromptpayIdType(e.target.value as 'mobile' | 'citizen' | 'tax' | 'ewallet')} 
                              className={inputClass(false)}
                            >
                                <option value="mobile">เบอร์โทรศัพท์</option>
                                <option value="citizen">เลขบัตรประชาชน</option>
                                <option value="ewallet">e-Wallet ID</option>
                            </select>
                        </InputWrapper>
                        <InputWrapper 
                          label={
                            promptpayIdType === 'mobile' ? 'เบอร์โทรศัพท์' :
                            promptpayIdType === 'citizen' ? 'เลขบัตรประชาชน' :
                            promptpayIdType === 'tax' ? 'เลขประจำตัวผู้เสียภาษี' :
                            'e-Wallet ID'
                          } 
                          icon={promptpayIdType === 'mobile' ? Phone : Banknote}
                        >
                            <input 
                              type="text" 
                              value={promptpayId} 
                              onChange={(e) => setPromptpayId(e.target.value)} 
                              placeholder={
                                promptpayIdType === 'mobile' ? '0812345678' :
                                promptpayIdType === 'citizen' ? '1234567890123' :
                                promptpayIdType === 'tax' ? '0123456789012' :
                                'ewallet123'
                              }
                              className={inputClass(true)} 
                            />
                        </InputWrapper>
                        <InputWrapper label="จำนวนเงิน (บาท) - ไม่ระบุก็ได้" icon={Banknote}>
                            <input 
                              type="number" 
                              value={promptpayAmount} 
                              onChange={(e) => setPromptpayAmount(e.target.value)} 
                              placeholder="0.00" 
                              step="0.01"
                              min="0"
                              className={inputClass(true)} 
                            />
                        </InputWrapper>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                          <p className="text-xs text-blue-600 font-medium">
                            💡 <strong>คำแนะนำ:</strong><br/>
                            • เบอร์โทร: ใส่ 10 หลัก (เช่น 0812345678)<br/>
                            • บัตรประชาชน/เลขผู้เสียภาษี: ใส่ 13 หลัก<br/>
                            • ไม่ระบุจำนวนเงิน = ให้ผู้จ่ายกรอกเอง
                          </p>
                        </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* 2. Colors & Styles */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
              <div className="p-5 space-y-6">
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

            {/* 3. Logo (Updated for better touch response) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-orange-100 rounded-xl text-orange-500">
                            <ImageIcon size={20} />
                        </div>
                        <h2 className="font-bold text-lg text-slate-700">ใส่โลโก้หน่อยมั้ย</h2>
                    </div>
                    
                    {/* Toggle between Upload and URL */}
                    <div className="flex bg-slate-50 p-1 rounded-xl mb-4">
                        <button
                            onClick={() => { setLogoInputType('upload'); setLogoUrl(''); }}
                            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                logoInputType === 'url'
                                    ? 'bg-white text-orange-500 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <LinkIcon size={14} />
                            URL
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
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Preview & Download */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-6">
              
              {/* Preview Card */}
              <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl shadow-teal-200/50 border border-white overflow-hidden relative">
                {/* Decorative blobs updated colors */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-20 -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative p-8 flex flex-col items-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/5 rounded-full mb-6">
                    <Maximize size={14} className="text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
                  </div>

                  {/* QR Canvas Container */}
                  <div className="relative group">
                    {/* Background blob updated */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-500 rounded-3xl opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
                    <div 
                        ref={refContainer} 
                        className="relative bg-white p-6 rounded-2xl shadow-xl overflow-hidden [&_canvas]:max-w-full [&_canvas]:h-auto"
                        style={{ backgroundColor: isTransparent ? 'transparent' : bgColor }}
                    >
                        {/* Canvas renders here */}
                    </div>
                  </div>
                </div>

                {/* Download Area */}
                <div className="bg-slate-50/80 p-6 border-t border-slate-100 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row items-end gap-4">
                    
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
                        className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-teal-200 transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          </div>

        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            Made with <Heart size={14} className="text-teal-400 fill-teal-400 animate-pulse" /> for everyone By PskCluB
        </p>
      </footer>
    </div>
  );
};

export default QRCodeGenerator;