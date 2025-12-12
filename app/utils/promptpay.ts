
import { anyId } from 'promptparse/generate';

export const generatePromptPayQR = (id: string, amount: string, idType: string): string => {
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
};
