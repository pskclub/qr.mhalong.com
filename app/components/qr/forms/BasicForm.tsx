
import React from 'react';
import { Phone, Mail } from 'lucide-react';
import InputWrapper from '../../InputWrapper';

interface BasicFormProps {
  type: 'url' | 'text' | 'phone' | 'email';
  value: string;
  setValue: (val: string) => void;
  inputClass: (hasIcon: boolean) => string;
}

const BasicForm: React.FC<BasicFormProps> = ({ type, value, setValue, inputClass }) => {
  if (type === 'url') {
    return (
      <InputWrapper label="วางลิงก์ตรงนี้เลย">
        <input type="url" value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://..." className={inputClass(false)} />
      </InputWrapper>
    );
  }
  
  if (type === 'text') {
    return (
      <InputWrapper label="ข้อความของคุณ">
        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} className={inputClass(false)} />
      </InputWrapper>
    );
  }
  
  if (type === 'phone') {
    return (
      <InputWrapper label="เบอร์โทรศัพท์" icon={Phone}>
        <input type="tel" value={value} onChange={(e) => setValue(e.target.value)} placeholder="081 234 5678" className={inputClass(true)} />
      </InputWrapper>
    );
  }
  
  if (type === 'email') {
    return (
      <InputWrapper label="อีเมลปลายทาง" icon={Mail}>
        <input type="email" value={value} onChange={(e) => setValue(e.target.value)} placeholder="hello@example.com" className={inputClass(true)} />
      </InputWrapper>
    );
  }

  return null;
};

export default BasicForm;
