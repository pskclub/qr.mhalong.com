
import React from 'react';
import { Phone, Mail, Globe, Building2, MapPin } from 'lucide-react';
import InputWrapper from '../../InputWrapper';
import { VCardData } from '../../../types/qrcode';

interface VCardFormProps {
  data: VCardData;
  onChange: (field: keyof VCardData, value: string) => void;
  inputClass: (hasIcon: boolean) => string;
}

const VCardForm: React.FC<VCardFormProps> = ({ data, onChange, inputClass }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <InputWrapper label="ชื่อจริง">
          <input type="text" value={data.firstName} onChange={(e) => onChange('firstName', e.target.value)} placeholder="สมชาย" className={inputClass(false)} />
        </InputWrapper>
        <InputWrapper label="นามสกุล">
          <input type="text" value={data.lastName} onChange={(e) => onChange('lastName', e.target.value)} placeholder="ใจดี" className={inputClass(false)} />
        </InputWrapper>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InputWrapper label="มือถือ" icon={Phone}>
          <input type="tel" value={data.mobile} onChange={(e) => onChange('mobile', e.target.value)} placeholder="081 234 5678" className={inputClass(true)} />
        </InputWrapper>
        <InputWrapper label="โทรศัพท์ (งาน)" icon={Phone}>
          <input type="tel" value={data.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="02 123 4567" className={inputClass(true)} />
        </InputWrapper>
      </div>
      <InputWrapper label="อีเมล" icon={Mail}>
        <input type="email" value={data.email} onChange={(e) => onChange('email', e.target.value)} placeholder="somchai@example.com" className={inputClass(true)} />
      </InputWrapper>
      <InputWrapper label="เว็บไซต์" icon={Globe}>
        <input type="url" value={data.website} onChange={(e) => onChange('website', e.target.value)} placeholder="https://example.com" className={inputClass(true)} />
      </InputWrapper>
      <div className="grid grid-cols-2 gap-3">
        <InputWrapper label="บริษัท" icon={Building2}>
          <input type="text" value={data.company} onChange={(e) => onChange('company', e.target.value)} placeholder="บริษัท ABC จำกัด" className={inputClass(true)} />
        </InputWrapper>
        <InputWrapper label="ตำแหน่ง">
          <input type="text" value={data.job} onChange={(e) => onChange('job', e.target.value)} placeholder="ผู้จัดการ" className={inputClass(false)} />
        </InputWrapper>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <InputWrapper label="ถนน/ซอย" icon={MapPin}>
            <input type="text" value={data.street} onChange={(e) => onChange('street', e.target.value)} placeholder="123 ถนนสุขุมวิท" className={inputClass(true)} />
          </InputWrapper>
        </div>
        <InputWrapper label="จังหวัด">
          <input type="text" value={data.city} onChange={(e) => onChange('city', e.target.value)} placeholder="กรุงเทพฯ" className={inputClass(false)} />
        </InputWrapper>
        <InputWrapper label="ประเทศ">
          <input type="text" value={data.country} onChange={(e) => onChange('country', e.target.value)} placeholder="ประเทศไทย" className={inputClass(false)} />
        </InputWrapper>
      </div>
    </div>
  );
};

export default VCardForm;
