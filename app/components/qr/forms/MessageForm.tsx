
import React from 'react';
import { Phone } from 'lucide-react';
import InputWrapper from '../../InputWrapper';

interface MessageFormProps {
  type: 'sms' | 'whatsapp';
  phone: string;
  setPhone: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  inputClass: (hasIcon: boolean) => string;
}

const MessageForm: React.FC<MessageFormProps> = ({ type, phone, setPhone, message, setMessage, inputClass }) => (
  <div className="space-y-3">
    <InputWrapper 
      label={type === 'whatsapp' ? "เบอร์ WhatsApp (มีรหัสประเทศ เช่น 66)" : "เบอร์โทรศัพท์"} 
      icon={Phone}
    >
      <input 
        type="tel" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        placeholder={type === 'whatsapp' ? "66812345678" : "081 234 5678"} 
        className={inputClass(true)} 
      />
    </InputWrapper>
    <InputWrapper label={type === 'whatsapp' ? "ข้อความเริ่มต้น" : "ข้อความ"}>
      <textarea 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        rows={3} 
        className={inputClass(false)} 
      />
    </InputWrapper>
  </div>
);

export default MessageForm;
