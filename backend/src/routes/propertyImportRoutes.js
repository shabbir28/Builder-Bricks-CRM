const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const { Property, User } = require('../models/index');
const sequelize = require('../config/database');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const parseCurrency = (val) => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/Rs\.?|,|\s|Sq\.?Ft/gi, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const parseIntOrZero = (val) => {
  if (typeof val === 'number') return Math.floor(val);
  if (!val) return 0;
  const parsed = parseInt(String(val).replace(/[^0-9-]/g, ''), 10);
  return isNaN(parsed) ? 0 : parsed;
};

// @desc    Preview Excel Import
// @route   POST /api/properties/import/preview
// @access  Admin
router.post('/preview', auth, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    let validRows = 0;
    let invalidRows = 0;
    let skippedRows = 0;
    const parsedProperties = [];
    
    let currentFloor = '';
    let propertyType = 'apartment';

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0 || row.every(cell => !cell || String(cell).trim() === '')) {
        skippedRows++;
        continue;
      }

      const firstCell = String(row[0]).trim();
      
      if (firstCell.toLowerCase().includes('floor') || firstCell.toLowerCase().includes('shops')) {
        currentFloor = firstCell;
        propertyType = firstCell.toLowerCase().includes('shop') ? 'commercial' : 'apartment';
        skippedRows++;
        continue;
      }

      if (firstCell.toLowerCase() === 'sr#' || firstCell.toLowerCase() === 'total' || firstCell.toLowerCase() === 'type') {
        skippedRows++;
        continue;
      }

      try {
        if (propertyType === 'commercial' && row.length >= 8) {
          const unitNumber = String(row[0]);
          const area = parseCurrency(row[1]);
          const ratePerSqFt = parseCurrency(row[3]);
          const totalPrice = parseCurrency(row[4]);
          const dpAmt = parseCurrency(row[5]);
          const remAmt = parseCurrency(row[6]);
          const miAmt = parseCurrency(row[7]);
          const possAmt = parseCurrency(row[8] || 0);

          if (!unitNumber || !area || !totalPrice) {
            invalidRows++;
            continue;
          }

          parsedProperties.push({
            title: `${unitNumber} - ${currentFloor}`,
            description: `Elite One Property - ${unitNumber} located on ${currentFloor}.`,
            type: 'commercial',
            status: 'available',
            price: totalPrice,
            area: area,
            city: 'Islamabad',
            propertyCode: `ELT1-${unitNumber.replace(/\s+/g, '-')}`,
            projectName: 'Elite one',
            unitNumber: unitNumber,
            floor: currentFloor,
            ratePerSqFt: ratePerSqFt,
            totalPrice: totalPrice,
            downPaymentPercentage: 25,
            downPaymentAmount: dpAmt,
            remainingAmount: remAmt,
            installmentMonths: 24,
            monthlyInstallment: miAmt,
            possessionPercentage: 20,
            possessionAmount: possAmt,
            imageUrl: 'https://images.unsplash.com/photo-1541885962-421715af296c?q=80&w=1000&auto=format&fit=crop'
          });
          validRows++;
        } else if (propertyType === 'apartment' && row.length >= 8) {
          const unitNumber = String(row[0]);
          const typeStr = String(row[1]);
          const bedrooms = parseIntOrZero(typeStr);
          const area = parseCurrency(row[2]);
          const ratePerSqFt = parseCurrency(row[3]);
          const totalPrice = parseCurrency(row[4]);
          const dpAmt = parseCurrency(row[5]);
          const remAmt = parseCurrency(row[6]);
          const miAmt = parseCurrency(row[7]);
          const possAmt = parseCurrency(row[8] || 0);

          if (!unitNumber || !area || !totalPrice) {
            invalidRows++;
            continue;
          }

          parsedProperties.push({
            title: `${typeStr} Apartment - ${unitNumber}`,
            description: `Elite One Property - ${typeStr} Apartment (${unitNumber}) located on ${currentFloor}.`,
            type: 'apartment',
            status: 'available',
            price: totalPrice,
            area: area,
            city: 'Islamabad', 
            bedrooms: bedrooms > 0 ? bedrooms : null,
            propertyCode: `ELT1-${unitNumber.replace(/\s+/g, '-')}`,
            projectName: 'Elite one',
            unitNumber: unitNumber,
            apartmentNumber: unitNumber,
            floor: currentFloor,
            ratePerSqFt: ratePerSqFt,
            totalPrice: totalPrice,
            downPaymentPercentage: 25,
            downPaymentAmount: dpAmt,
            remainingAmount: remAmt,
            installmentMonths: 24,
            monthlyInstallment: miAmt,
            possessionPercentage: 20,
            possessionAmount: possAmt,
            imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop'
          });
          validRows++;
        } else {
          invalidRows++;
        }
      } catch (e) {
        invalidRows++;
      }
    }

    // Check duplicates bypassed as requested by user
    let duplicateCount = 0;
    for (const prop of parsedProperties) {
      prop.isDuplicate = false; // Always false, we want to insert all
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
        duplicateCount
      },
      data: parsedProperties
    });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Confirm Excel Import
// @route   POST /api/properties/import/confirm
// @access  Admin
router.post('/confirm', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }

  const { properties } = req.body;
  if (!properties || !Array.isArray(properties)) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }

  const transaction = await sequelize.transaction();
  let importedCount = 0;
  let errorCount = 0;

  try {
    for (const prop of properties) {
      // By passing the duplicate check to insert all properties

      try {
        await Property.create({ ...prop, listedBy: req.user.id }, { transaction });
        importedCount++;
      } catch (err) {
        console.error('Import insert error:', err.message);
        errorCount++;
      }
    }
    
    await transaction.commit();
    res.json({ success: true, importedCount, errorCount, message: `Successfully imported ${importedCount} properties.` });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: 'Transaction failed: ' + error.message });
  }
});

module.exports = router;
