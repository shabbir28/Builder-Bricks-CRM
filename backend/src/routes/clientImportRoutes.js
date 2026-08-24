const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const { Client, Property } = require('../models/index');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/Rs\.?|,|\s/gi, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const getRightValue = (data, r, c) => {
  for (let i = c + 1; i < c + 15; i++) {
    if (data[r] && data[r][i] !== undefined && String(data[r][i]).trim() !== '') {
      return data[r][i];
    }
  }
  return '';
};

const findLabelDown = (data, startR, c, possibleLabels) => {
  for (let r = startR + 1; r < startR + 12; r++) {
    if (!data[r] || data[r][c] === undefined) continue;
    const cell = String(data[r][c]).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (possibleLabels.some(pl => cell.includes(pl))) {
       return getRightValue(data, r, c);
    }
  }
  return '';
};

const extractSchedule = (data, startR, c) => {
  const schedule = [];
  
  let headerRow = -1;
  let monthCol = -1;
  for (let r = startR + 1; r < startR + 15; r++) {
    if (!data[r]) continue;
    const searchStart = Math.max(0, c - 4);
    const searchEnd = c + 4;
    for (let col = searchStart; col <= searchEnd; col++) {
      const cellVal = String(data[r][col] || '').trim().toLowerCase();
      if (cellVal === 'month') {
        headerRow = r;
        monthCol = col;
        break;
      }
    }
    if (headerRow !== -1) break;
  }

  if (headerRow === -1 || monthCol === -1) return [];

  const monthMapping = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };

  for (let r = headerRow + 1; r < data.length; r++) {
    if (!data[r]) break;
    const monthVal = String(data[r][monthCol] || '').trim();
    if (!monthVal) break; 
    
    const downPayment = parseCurrency(data[r][monthCol + 1]);
    const installment = parseCurrency(data[r][monthCol + 2]);
    const surcharges = parseCurrency(data[r][monthCol + 3]);
    const adjustment = parseCurrency(data[r][monthCol + 4]);
    const payment = parseCurrency(data[r][monthCol + 5]);
    
    let rawDate = data[r][monthCol + 6];
    let paidDate = null;
    if (rawDate) {
      if (typeof rawDate === 'number') {
        const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        paidDate = d.toISOString().split('T')[0];
      } else {
        const parts = String(rawDate).trim().split(/[-/]/);
        if (parts.length === 3) {
          let y = parts[2], m = parts[1], d = parts[0];
          if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2]; }
          paidDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
      }
    }

    const transactionRef = String(data[r][monthCol + 7] || '').trim();

    let monthDate = monthVal;
    if (typeof data[r][monthCol] === 'number') {
      const d = new Date(Math.round((data[r][monthCol] - 25569) * 86400 * 1000));
      monthDate = d.toISOString().split('T')[0];
    } else {
       const mParts = monthVal.toLowerCase().split('-');
       if (mParts.length === 2 && monthMapping[mParts[0]]) {
         let yr = mParts[1];
         if (yr.length === 2) yr = '20' + yr;
         monthDate = `${yr}-${monthMapping[mParts[0]]}-01`;
       }
    }

    schedule.push({
      id: Date.now() + r,
      date: monthDate,
      monthDate: monthDate,
      details: `Installment ${schedule.length + 1}`,
      downPayment,
      installment,
      surcharges,
      adjustment,
      payment,
      paidDate,
      transactionRef
    });
  }

  return schedule;
};

// @desc    Preview Client Excel Import
// @route   POST /api/clients/import/preview
// @access  Admin
router.post('/preview', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Read as 2D array
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    let validRows = 0;
    let invalidRows = 0;
    let skippedRows = 0;
    const parsedClients = [];

    for (let r = 0; r < data.length; r++) {
      if (!data[r]) continue;
      for (let c = 0; c < data[r].length; c++) {
        if (data[r][c] === undefined) continue;
        const cellValue = String(data[r][c]).trim().toLowerCase();
        
        // Find the starting point for a client (Owner Name)
        if (cellValue.includes('owner name')) {
          const name = getRightValue(data, r, c);
          if (!name) continue;

          // Now search downwards for the other fields in the same column `c`
          const unitNo = findLabelDown(data, r, c, ['shopno', 'flatno', 'unitno', 'property']);
          const totalPayment = parseCurrency(findLabelDown(data, r, c, ['totalpayment', 'totalprice', 'netprice']));
          const downPayment = parseCurrency(findLabelDown(data, r, c, ['downpayment', 'dp']));
          const possessionPayment = parseCurrency(findLabelDown(data, r, c, ['possession', 'possesion']));
          const monthlyInstallment = parseCurrency(findLabelDown(data, r, c, ['installment', 'monthlyinstallment']));
          
          if (unitNo) {
            parsedClients.push({
              name: String(name).trim(),
              unitNo: String(unitNo).trim(),
              totalPayment,
              downPayment,
              possessionPayment,
              monthlyInstallment,
              actualSchedule: extractSchedule(data, r, c),
              cnic: '',
              phone: ''
            });
            validRows++;
          }
        }
      }
    }

    // cleanup temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      stats: {
        totalRows: data.length,
        validRows,
        invalidRows,
        skippedRows,
      },
      data: parsedClients
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Confirm Client Import
// @route   POST /api/clients/import/confirm
// @access  Admin
router.post('/confirm', auth, async (req, res) => {
  const { clients } = req.body;
  if (!clients || !Array.isArray(clients)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  const transaction = await sequelize.transaction();
  let importedCount = 0;
  let errorCount = 0;

  try {
    for (const clientData of clients) {
      try {
        let schedule = [];
        if (clientData.actualSchedule && clientData.actualSchedule.length > 0) {
          schedule = clientData.actualSchedule;
        } else {
          // Fallback Generate default installment schedule (24 months)
          const today = new Date();
          for (let i = 1; i <= 24; i++) {
            const dueDate = new Date(today.getFullYear(), today.getMonth() + i, today.getDate());
            schedule.push({
              id: Date.now() + i,
              date: dueDate.toISOString().split('T')[0],
              monthDate: dueDate.toISOString().split('T')[0],
              details: `Installment ${i}`,
              downPayment: i === 1 ? clientData.downPayment : 0,
              installment: clientData.monthlyInstallment,
              payment: 0,
              surcharges: 0,
              adjustment: 0,
            });
          }
        }
        
        // Find existing property by unit number robustly
        const unit = String(clientData.unitNo).trim();
        const property = await Property.findOne({ 
          where: { 
            [Op.or]: [
              { unitNumber: { [Op.iLike]: `%${unit}%` } },
              { propertyCode: { [Op.iLike]: `%${unit}%` } },
              { title: { [Op.iLike]: `%${unit}%` } },
              { apartmentNumber: { [Op.iLike]: `%${unit}%` } }
            ]
          },
          transaction 
        });

        const newClient = await Client.create({
          name: clientData.name,
          cnic: clientData.cnic,
          phone: clientData.phone,
          unitNo: clientData.unitNo,
          netPrice: clientData.totalPayment,
          totalPrice: clientData.totalPayment,
          downPayment: clientData.downPayment,
          possessionPayment: clientData.possessionPayment,
          installmentsCount: "24",
          perMonthInstallment: clientData.monthlyInstallment,
          installmentSchedule: schedule,
        }, { transaction });

        if (property) {
          // Link property to client and mark as sold
          await property.update({
            clientId: newClient.id,
            status: 'sold',
            ownerName: clientData.name,
            clientPaidAmount: clientData.downPayment || 0,
            price: clientData.totalPayment || property.price
          }, { transaction });
        }

        importedCount++;
      } catch (err) {
        console.error('Import insert error for client:', clientData.name, err.message);
        errorCount++;
      }
    }
    
    await transaction.commit();
    res.json({ success: true, importedCount, errorCount, message: `Successfully imported ${importedCount} clients.` });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: 'Transaction failed: ' + error.message });
  }
});

module.exports = router;
