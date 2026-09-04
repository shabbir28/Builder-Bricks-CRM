const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const AUTH_DIR = path.join(__dirname, '../../whatsapp_auth');
const OFFICIAL_SENDER = '03190225136';

let sock = null;
let isConnected = false;
let currentQR = null;
let currentPairingCode = null;
let reconnectTimeout = null;

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

/**
 * Sanitize and format phone number to WhatsApp JID format
 * e.g. 03190225136 -> 923190225136@s.whatsapp.net
 */
const formatJid = (phone) => {
  if (!phone) return null;
  let clean = String(phone).replace(/[^0-9]/g, '');

  if (clean.startsWith('0092')) {
    clean = '92' + clean.slice(4);
  } else if (clean.startsWith('92') && clean.length === 12) {
    // Already in 923XXXXXXXXX format
  } else if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }

  if (clean.length < 10) return null;
  return `${clean}@s.whatsapp.net`;
};

/**
 * Initialize Baileys WhatsApp Connection
 */
const initWhatsApp = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQR = await QRCode.toDataURL(qr, {
            width: 360,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'M',
          });
          isConnected = false;
        } catch (err) {
          console.error('[WhatsApp] Failed to generate QR data URL:', err);
        }
      }

      if (connection === 'close') {
        isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[WhatsApp] Connection closed. Reason: ${statusCode || 'Unknown'}. Reconnecting: ${shouldReconnect}`);

        if (shouldReconnect) {
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => {
            initWhatsApp();
          }, 4000);
        } else {
          console.log('[WhatsApp] Logged out. Clearing credentials...');
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            fs.mkdirSync(AUTH_DIR, { recursive: true });
          } catch (e) {
            console.error('[WhatsApp] Error clearing auth dir:', e);
          }
          currentQR = null;
          currentPairingCode = null;
          if (reconnectTimeout) clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(() => {
            initWhatsApp();
          }, 3000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        currentQR = null;
        currentPairingCode = null;
        console.log('[WhatsApp] Connection opened successfully! Ready to send messages in background.');
      }
    });

    return sock;
  } catch (err) {
    console.error('[WhatsApp] Error during initialization:', err);
    return null;
  }
};

/**
 * Request an 8-character Pairing Code for WhatsApp (phone number based pairing)
 */
const requestPairingCode = async (phoneNumber) => {
  if (isConnected) {
    throw new Error('WhatsApp is already connected!');
  }
  if (!sock) {
    await initWhatsApp();
    await new Promise((r) => setTimeout(r, 2000));
  }

  let clean = String(phoneNumber || OFFICIAL_SENDER).replace(/[^0-9]/g, '');
  if (clean.startsWith('0092')) {
    clean = '92' + clean.slice(4);
  } else if (clean.startsWith('03') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }

  if (clean.length < 10) {
    throw new Error('Please enter a valid phone number (e.g. 03190225136)');
  }

  try {
    const code = await sock.requestPairingCode(clean);
    currentPairingCode = code?.match(/.{1,4}/g)?.join('-') || code;
    return currentPairingCode;
  } catch (err) {
    console.error('[WhatsApp] Error requesting pairing code:', err);
    throw new Error(err?.message || 'Failed to request pairing code. WhatsApp server did not respond.');
  }
};

/**
 * Send message silently in background
 */
const sendMessage = async (phone, message) => {
  if (!isConnected || !sock) {
    throw new Error('WhatsApp is not connected yet. Please link your device via Pairing Code or QR scan.');
  }

  const jid = formatJid(phone);
  if (!jid) {
    throw new Error(`Invalid recipient phone number: ${phone}`);
  }

  try {
    const result = await sock.sendMessage(jid, { text: message });
    return {
      success: true,
      messageId: result.key?.id,
      recipient: jid,
    };
  } catch (error) {
    console.error(`[WhatsApp] Failed to send message to ${jid}:`, error);
    throw error;
  }
};

/**
 * Get current connection status and QR code if waiting for link
 */
const getStatus = () => {
  return {
    isConnected,
    qrCode: currentQR,
    pairingCode: currentPairingCode,
    senderNumber: OFFICIAL_SENDER,
  };
};

/**
 * Disconnect / Log out
 */
const logout = async () => {
  try {
    if (sock) {
      await sock.logout();
    }
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    isConnected = false;
    currentQR = null;
    currentPairingCode = null;
    initWhatsApp();
    return { success: true, message: 'Logged out successfully' };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

module.exports = {
  initWhatsApp,
  sendMessage,
  getStatus,
  requestPairingCode,
  logout,
  formatJid,
  OFFICIAL_SENDER,
};
