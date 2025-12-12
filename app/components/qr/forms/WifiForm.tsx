
import React from 'react';
import { Wifi } from 'lucide-react';
import InputWrapper from '../../InputWrapper';
import { WifiEncryption } from '../../../types/qrcode';

interface WifiFormProps {
  ssid: string;
  setSsid: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  encryption: WifiEncryption;
  setEncryption: (val: WifiEncryption) => void;
  inputClass: (hasIcon: boolean) => string;
}

const WifiForm: React.FC<WifiFormProps> = ({ ssid, setSsid, password, setPassword, encryption, setEncryption, inputClass }) => (
  <div className="space-y-3">
    <InputWrapper label="ชื่อ WiFi (SSID)" icon={Wifi}>
      <input type="text" value={ssid} onChange={(e) => setSsid(e.target.value)} className={inputClass(true)} />
    </InputWrapper>
    <InputWrapper label="รหัสผ่าน">
      <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass(false)} />
    </InputWrapper>
    <InputWrapper label="ระบบความปลอดภัย">
      <select value={encryption} onChange={(e) => setEncryption(e.target.value as WifiEncryption)} className={inputClass(false)}>
        <option value="WPA">WPA/WPA2</option>
        <option value="nopass">ไม่มีรหัสผ่าน</option>
      </select>
    </InputWrapper>
  </div>
);

export default WifiForm;
