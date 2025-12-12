
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Settings } from 'lucide-react';

// Types
import { 
  DataType, FileExtension, DotStyle, 
  CornerSquareStyle, CornerDotStyle, WifiEncryption, VCardData 
} from './types/qrcode';
import { FrameType } from './utils/frameGenerator';
import { PRESET_ICONS } from './constants/icons';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ContentTypeSelector from './components/qr/ContentTypeSelector';
import QRCodePreview from './components/qr/QRCodePreview';

// Forms
import BasicForm from './components/qr/forms/BasicForm';
import WifiForm from './components/qr/forms/WifiForm';
import MessageForm from './components/qr/forms/MessageForm';
import VCardForm from './components/qr/forms/VCardForm';
import PromptPayForm from './components/qr/forms/PromptPayForm';
import FileForm from './components/qr/forms/FileForm';

// Settings
import FrameSettings from './components/qr/settings/FrameSettings';
import ColorSettings from './components/qr/settings/ColorSettings';
import LogoSettings from './components/qr/settings/LogoSettings';

// Utils
import { generatePromptPayQR } from './utils/promptpay';

const QRCodeGenerator: React.FC = () => {
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

  // File Upload
  const [fileUrl, setFileUrl] = useState<string>('');

  // --- State for Styles ---
  const [size, setSize] = useState<number>(1000);
  const [fileExt, setFileExt] = useState<FileExtension>('png');
  const [qrColor, setQrColor] = useState<string>('#000000'); 
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [isTransparent, setIsTransparent] = useState<boolean>(false);
  
  const [dotStyle, setDotStyle] = useState<DotStyle>('rounded'); 
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareStyle>('extra-rounded'); 
  const [cornerDotStyle, setCornerDotStyle] = useState<CornerDotStyle>('dot'); 

  // --- State for Frames ---
  const [frameType, setFrameType] = useState<FrameType>('none');
  const [frameText, setFrameText] = useState<string>('SCAN ME');
  const [frameColor, setFrameColor] = useState<string>('#000000');
  
  // --- State for Logo ---
  const [logoInputType, setLogoInputType] = useState<'upload' | 'url' | 'preset'>('upload');
  const [activePresetCategory, setActivePresetCategory] = useState<keyof typeof PRESET_ICONS>('social');
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

  // Validation errors (computed from current state)
  const currentError = useMemo(() => {
    let validationError = '';
    
    if (dataType === 'url') {
      if (!content) validationError = 'กรุณากรอก URL';
      else {
        try {
          new URL(content);
        } catch {
          validationError = 'URL ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)';
        }
      }
    } else if (dataType === 'text') {
      if (!content) validationError = 'กรุณากรอกข้อความ';
    } else if (dataType === 'phone') {
      if (!content) validationError = 'กรุณากรอกเบอร์โทรศัพท์';
      else {
        const cleaned = content.replace(/[\s-]/g, '');
        const phoneRegex = /^\+?\d{7,15}$/;
        if (!phoneRegex.test(cleaned)) validationError = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมีอย่างน้อย 7 หลัก)';
      }
    } else if (dataType === 'email') {
      if (!content) validationError = 'กรุณากรอกอีเมล';
      else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(content)) validationError = 'รูปแบบอีเมลไม่ถูกต้อง';
      }
    } else if (dataType === 'wifi') {
      if (!wifiSsid) validationError = 'กรุณากรอกชื่อ WiFi';
      else if (wifiEncryption === 'WPA' && !wifiPassword) validationError = 'กรุณากรอกรหัสผ่าน WiFi';
    } else if (dataType === 'sms' || dataType === 'whatsapp') {
      if (!smsPhone) validationError = 'กรุณากรอกเบอร์โทรศัพท์';
      else {
        const cleaned = smsPhone.replace(/[\s-]/g, '');
        const phoneRegex = /^\+?\d{7,15}$/;
        if (!phoneRegex.test(cleaned)) validationError = 'เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องมีอย่างน้อย 7 หลัก)';
        else if (!smsMessage) validationError = 'กรุณากรอกข้อความ';
      }
    } else if (dataType === 'vcard') {
      if (!vcardData.firstName && !vcardData.lastName) validationError = 'กรุณากรอกชื่อหรือนามสกุลอย่างน้อย 1 ช่อง';
      else if (vcardData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(vcardData.email)) validationError = 'รูปแบบอีเมลไม่ถูกต้อง';
      } else if (vcardData.website) {
        try {
          new URL(vcardData.website);
        } catch {
          validationError = 'รูปแบบเว็บไซต์ไม่ถูกต้อง (ต้องขึ้นต้นด้วย http:// หรือ https://)';
        }
      }
    } else if (dataType === 'promptpay') {
      if (!promptpayId) validationError = 'กรุณากรอกข้อมูล';
      else {
        const cleaned = promptpayId.replace(/[\s-]/g, '');
        if (promptpayIdType === 'mobile') {
          const phoneRegex = /^0\d{9}$/;
          if (!phoneRegex.test(cleaned)) validationError = 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก';
        } else if (promptpayIdType === 'citizen') {
          const citizenRegex = /^\d{13}$/;
          if (!citizenRegex.test(cleaned)) validationError = 'เลขบัตรประชาชนต้องมี 13 หลัก';
        } else if (promptpayIdType === 'ewallet') {
          if (cleaned.length === 0) validationError = 'กรุณากรอก e-Wallet ID';
        }
      }
    } else if (dataType === 'file') {
       if (!fileUrl) validationError = 'กรุณาอัปโหลดไฟล์';
    }
    
    return validationError;
  }, [dataType, content, wifiSsid, wifiPassword, wifiEncryption, smsPhone, smsMessage, vcardData, promptpayId, promptpayIdType, fileUrl]);


  // Construct finalData
  const finalData = useMemo(() => {
     let data = content || 'https://qr.mhalong.com';

     // Only construct meaningful data if no error (or use fallback logic)
     if (!currentError) {
        if (dataType === 'url') data = content;
        if (dataType === 'text') data = content;
        if (dataType === 'phone') data = `tel:${content}`;
        if (dataType === 'email') data = `mailto:${content}`;
        if (dataType === 'wifi') data = `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;`;
        if (dataType === 'sms') data = `SMSTO:${smsPhone}:${smsMessage}`;
        if (dataType === 'whatsapp') data = `https://wa.me/${smsPhone}?text=${encodeURIComponent(smsMessage)}`;
        
        if (dataType === 'vcard') {
          data = `BEGIN:VCARD
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
        
        if (dataType === 'promptpay' && promptpayId) {
          data = generatePromptPayQR(promptpayId, promptpayAmount, promptpayIdType);
        }

        if (dataType === 'file') {
           data = fileUrl;
        }
     }
     
     return data;
  }, [dataType, content, wifiSsid, wifiPassword, wifiEncryption, smsPhone, smsMessage, vcardData, promptpayId, promptpayAmount, promptpayIdType, currentError, fileUrl]);
  
  // Updated focus ring to teal-400 and focus border to teal-400
  const inputClass = (hasIcon: boolean): string => `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 md:py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 outline-none transition-all font-medium text-slate-600 text-sm placeholder:text-slate-300`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-100 font-sans text-slate-700 pb-12 selection:bg-teal-200">
      <Header />

      <main className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          
          {/* LEFT COLUMN: Settings */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Content Type */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-1 shadow-xl shadow-teal-500/5 border border-white">
              <div className="p-3 md:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-teal-100 rounded-xl text-teal-600">
                    <Settings size={20} />
                  </div>
                  <h2 className="font-bold text-lg text-slate-700">จะสร้าง QR อะไรดี?</h2>
                </div>
                
                <ContentTypeSelector dataType={dataType} setDataType={setDataType} />

                <div className="mt-6 bg-slate-50 p-2.5 md:p-4 rounded-2xl border border-slate-100 space-y-4">
                  
                  {['url', 'text', 'phone', 'email'].includes(dataType) && (
                    <BasicForm 
                      type={dataType as 'url' | 'text' | 'phone' | 'email'} 
                      value={content} 
                      setValue={setContent} 
                      inputClass={inputClass} 
                    />
                  )}

                  {dataType === 'wifi' && (
                    <WifiForm 
                      ssid={wifiSsid} setSsid={setWifiSsid}
                      password={wifiPassword} setPassword={setWifiPassword}
                      encryption={wifiEncryption} setEncryption={setWifiEncryption}
                      inputClass={inputClass}
                    />
                  )}

                  {(dataType === 'sms' || dataType === 'whatsapp') && (
                    <MessageForm 
                      type={dataType}
                      phone={smsPhone} setPhone={setSmsPhone}
                      message={smsMessage} setMessage={setSmsMessage}
                      inputClass={inputClass}
                    />
                  )}
                  
                  {dataType === 'vcard' && (
                    <VCardForm 
                        data={vcardData} 
                        onChange={updateVcard} 
                        inputClass={inputClass}
                    />
                  )}
                  
                  {dataType === 'promptpay' && (
                    <PromptPayForm 
                        id={promptpayId} setId={setPromptpayId}
                        amount={promptpayAmount} setAmount={setPromptpayAmount}
                        type={promptpayIdType} setType={setPromptpayIdType}
                        inputClass={inputClass}
                    />
                  )}

                  {dataType === 'file' && (
                    <FileForm 
                       onUploadStart={() => setFileUrl('')}
                       onUploadComplete={(url) => setFileUrl(url)}
                       onUploadError={(err) => alert(err)} // Simple alert for now
                       inputClass={inputClass}
                    />
                  )}

                  {/* Error Message */}
                  {currentError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-red-600">{currentError}</span>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* 2. Colors & Styles */}
            <ColorSettings 
                qrColor={qrColor} setQrColor={setQrColor}
                bgColor={bgColor} setBgColor={setBgColor}
                isTransparent={isTransparent} setIsTransparent={setIsTransparent}
                dotStyle={dotStyle} setDotStyle={setDotStyle}
                cornerSquareStyle={cornerSquareStyle} setCornerSquareStyle={setCornerSquareStyle}
                cornerDotStyle={cornerDotStyle} setCornerDotStyle={setCornerDotStyle}
            />

            {/* 3. Logo */}
            <LogoSettings 
                logoInputType={logoInputType} setLogoInputType={setLogoInputType}
                activePresetCategory={activePresetCategory} setActivePresetCategory={setActivePresetCategory}
                logoUrl={logoUrl} setLogoUrl={setLogoUrl}
                logoFile={logoFile} setLogoFile={setLogoFile}
                logoUrlValid={logoUrlValid}
                logoUrlLoading={logoUrlLoading}
                logoUrlError={logoUrlError}
                inputClass={inputClass}
            />

            {/* 4. Frames */}
            <FrameSettings 
                frameType={frameType} setFrameType={setFrameType}
                frameText={frameText} setFrameText={setFrameText}
                frameColor={frameColor} setFrameColor={setFrameColor}
                inputClass={inputClass}
            />

          </div>

          {/* RIGHT COLUMN: Preview & Download */}
          <div className="lg:col-span-7">
            <QRCodePreview 
                finalData={finalData}
                size={size} setSize={setSize}
                fileExt={fileExt} setFileExt={setFileExt}
                
                qrColor={qrColor}
                bgColor={bgColor}
                isTransparent={isTransparent}
                dotStyle={dotStyle}
                cornerSquareStyle={cornerSquareStyle}
                cornerDotStyle={cornerDotStyle}
                
                logoFile={logoFile}
                logoUrl={logoUrl}
                logoUrlValid={logoUrlValid}
                
                frameType={frameType}
                frameText={frameText}
                frameColor={frameColor}
            />
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default QRCodeGenerator;