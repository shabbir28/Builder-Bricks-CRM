/**
 * WhatsApp Helper Utilities for Builders Brick / Elite One CRM
 * Official Sender / Business Helpline: 03190225136
 */

export const OFFICIAL_SENDER_NUMBER = '03190225136';

/**
 * Clean and convert phone numbers to international WhatsApp format.
 * Handles Pakistani standard formats:
 * - 03001234567 -> 923001234567
 * - 03190225136 -> 923190225136
 * - +923001234567 -> 923001234567
 * - 00923001234567 -> 923001234567
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');
  
  if (clean.startsWith('0092')) {
    clean = '92' + clean.slice(4);
  } else if (clean.startsWith('92') && clean.length === 12) {
    // already 923XXXXXXXXX
  } else if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  return clean;
};

/**
 * Extract best phone number from client object.
 * Falls back to 03190225136 if client profile has no phone number yet.
 */
export const getClientPhone = (client) => {
  if (!client) return OFFICIAL_SENDER_NUMBER;
  return client.mobileNo || client.phone || client.residentialTel || client.nominee1Mobile || OFFICIAL_SENDER_NUMBER;
};

/**
 * Format currency number with commas and .00 decimals
 * Example: 500 -> 500.00, 300000 -> 300,000.00
 */
export const formatAmount = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0.00';
  const val = parseFloat(num);
  return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format unit text (e.g. "Flat No. 804", "Shop No. G 1")
 */
export const formatUnitLabel = (unitNo, type = '') => {
  let cleanUnit = String(unitNo || '').trim();
  if (!cleanUnit) return 'Flat / Unit';

  const lower = cleanUnit.toLowerCase();
  if (lower.includes('flat') || lower.includes('shop') || lower.includes('unit') || lower.includes('apartment') || lower.includes('suite') || lower.includes('office')) {
    return cleanUnit;
  }

  const lowerType = String(type || '').toLowerCase();
  if (lowerType.includes('shop')) {
    return `Shop No. ${cleanUnit}`;
  } else if (lowerType.includes('office')) {
    return `Office No. ${cleanUnit}`;
  } else {
    return `Flat No. ${cleanUnit}`;
  }
};

/**
 * Generate official Elite One installment receipt message
 * 
 * Template:
 * Dear [Client Name],
 * 
 * We are pleased to confirm receipt of your installment of Rs. [Amount] against [Unit], Elite One.
 * 
 * Your remaining installments are [Remaining Installments], totaling Rs. [Total Remaining].
 * 
 * Thank you for your timely payment and continued trust. Elite One is committed to delivering quality work and excellence to all our valued clients.
 * 
 * Regards,
 * Elite One Management
 */
export const generateInstallmentReceiptMessage = ({
  clientName = '',
  unitNo = '',
  type = '',
  amount = 0,
  remainingInstallmentsAmount = 0,
  remainingBalance = 0,
}) => {
  const name = clientName && String(clientName).trim() ? String(clientName).trim() : 'Valued Client';
  const unitText = formatUnitLabel(unitNo, type);
  const paidStr = formatAmount(amount);
  
  const remInstVal = remainingInstallmentsAmount > 0 ? remainingInstallmentsAmount : remainingBalance;
  const remInstStr = formatAmount(remInstVal);
  const remTotalStr = formatAmount(remainingBalance);

  return `Dear ${name},

We are pleased to confirm receipt of your installment of Rs. ${paidStr} against ${unitText}, Elite One.

Your remaining installments are ${remInstStr}, totaling Rs. ${remTotalStr}.

Thank you for your timely payment and continued trust. Elite One is committed to delivering quality work and excellence to all our valued clients.

Regards,
Elite One Management`;
};

/**
 * Generate universal WhatsApp web / app link
 */
export const createWhatsAppUrl = (phone, message) => {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(message);
  if (formattedPhone) {
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
};

/**
 * Open WhatsApp directly in a new window/tab
 */
export const openWhatsApp = (phone, message) => {
  const url = createWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
};
