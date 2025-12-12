
export interface VCardData {
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

export type DataType = 'url' | 'text' | 'phone' | 'email' | 'wifi' | 'sms' | 'whatsapp' | 'vcard' | 'promptpay';
export type FileExtension = 'png' | 'jpeg' | 'svg';
export type DotStyle = 'rounded' | 'dots' | 'classy' | 'extra-rounded' | 'square' | 'classy-rounded';
export type CornerSquareStyle = 'extra-rounded' | 'square' | 'dot';
export type CornerDotStyle = 'dot' | 'square';
export type WifiEncryption = 'WPA' | 'nopass';

export interface QRCodeStylingOptions {
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

export interface QRCodeStylingInstance {
  append: (element: HTMLElement | null) => void;
  update: (options: Partial<QRCodeStylingOptions>) => void;
  download: (options: { name: string; extension: FileExtension }) => void;
}
