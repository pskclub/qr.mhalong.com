
import React from 'react';
import { Phone, Banknote } from 'lucide-react';
import InputWrapper from '../../InputWrapper';

interface PromptPayFormProps {
  id: string;
  setId: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  type: 'mobile' | 'citizen' | 'tax' | 'ewallet';
  setType: (value: 'mobile' | 'citizen' | 'tax' | 'ewallet') => void;
  inputClass: (hasIcon: boolean) => string;
}

const PromptPayForm: React.FC<PromptPayFormProps> = ({ id, setId, amount, setAmount, type, setType, inputClass }) => {
  return (
    <div className="space-y-4">
      <InputWrapper label="ประเภทบัญชี">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as 'mobile' | 'citizen' | 'tax' | 'ewallet')} 
          className={inputClass(false)}
        >
          <option value="mobile">เบอร์โทรศัพท์</option>
          <option value="citizen">เลขบัตรประชาชน</option>
          <option value="ewallet">e-Wallet ID</option>
        </select>
      </InputWrapper>
      <InputWrapper 
        label={
          type === 'mobile' ? 'เบอร์โทรศัพท์' :
          type === 'citizen' ? 'เลขบัตรประชาชน' :
          type === 'tax' ? 'เลขประจำตัวผู้เสียภาษี' :
          'e-Wallet ID'
        } 
        icon={type === 'mobile' ? Phone : Banknote}
      >
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          placeholder={
            type === 'mobile' ? '0812345678' :
            type === 'citizen' ? '1234567890123' :
            type === 'tax' ? '0123456789012' :
            'ewallet123'
          }
          className={inputClass(true)} 
        />
      </InputWrapper>
      <InputWrapper label="จำนวนเงิน (บาท) - ไม่ระบุก็ได้" icon={Banknote}>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
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
  );
};

export default PromptPayForm;
