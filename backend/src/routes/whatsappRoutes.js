const express = require('express');
const { auth } = require('../middleware/auth');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @desc    Get WhatsApp connection status & QR code
// @route   GET /api/whatsapp/status
router.get('/status', (req, res) => {
  try {
    const status = whatsappService.getStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Request 8-character Pairing Code for phone number
// @route   POST /api/whatsapp/pair-code
router.post('/pair-code', async (req, res) => {
  try {
    const { phone } = req.body;
    const pairingCode = await whatsappService.requestPairingCode(phone);
    res.json({ success: true, pairingCode });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Send a WhatsApp message directly in the background
// @route   POST /api/whatsapp/send
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Recipient phone number is required' });
    }
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const result = await whatsappService.sendMessage(phone, message);
    res.json({ success: true, message: 'Message sent successfully via background WhatsApp', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Logout / Disconnect WhatsApp
// @route   POST /api/whatsapp/logout
router.post('/logout', async (req, res) => {
  try {
    const result = await whatsappService.logout();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
