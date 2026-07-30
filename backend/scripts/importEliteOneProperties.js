const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();
const sequelize = require('../src/config/database');
const { Property, User } = require('../src/models/index');

const filePath = path.resolve(__dirname, '../../frontend/public/Elite one Remaining Apartments.xlsx');

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

const runImport = async () => {
  console.log('-----------------------------------------');
  console.log('🚀 Starting Elite One Properties Import...');
  console.log('Reading:', filePath);
  
  let workbook;
  try {
    workbook = xlsx.readFile(filePath);
  } catch (err) {
    console.error('❌ Error reading Excel file:', err.message);
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let totalRows = data.length;
  let validPropertyRows = 0;
  let skippedRows = 0;
  let invalidRows = 0;
  
  const parsedProperties = [];
  
  let currentFloor = '';
  let propertyType = 'apartment';

  // Find a default system user to assign these properties to
  await sequelize.authenticate();
  let defaultUser = await User.findOne({ where: { role: 'admin' } });
  if (!defaultUser) {
    defaultUser = await User.findOne();
  }
  if (!defaultUser) {
    console.error('❌ No user found in database to assign properties. Please run seed script first.');
    process.exit(1);
  }

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
        // Shop structure
        const unitNumber = String(row[0]);
        const area = parseCurrency(row[1]);
        // index 2 is also area sometimes, 3 is rate
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
          city: 'Islamabad', // Adjust if needed
          listedBy: defaultUser.id,
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
        validPropertyRows++;
      } else if (propertyType === 'apartment' && row.length >= 8) {
        // Apartment structure
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
          listedBy: defaultUser.id,
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
        validPropertyRows++;
      } else {
        invalidRows++;
      }
    } catch (e) {
      invalidRows++;
    }
  }

  let importedCount = 0;
  let duplicateCount = 0;
  let importErrors = 0;

  const transaction = await sequelize.transaction();

  try {
    for (const prop of parsedProperties) {
      const exists = await Property.findOne({
        where: {
          unitNumber: prop.unitNumber,
          projectName: prop.projectName,
          floor: prop.floor
        },
        transaction
      });

      if (exists) {
        duplicateCount++;
      } else {
        try {
          await Property.create(prop, { transaction });
          importedCount++;
        } catch (dbErr) {
          console.error(`Error inserting ${prop.unitNumber}:`, dbErr.message);
          importErrors++;
        }
      }
    }
    
    await transaction.commit();
    console.log('✅ Import Transaction Committed Successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Serious Error during import, Transaction Rolled Back:', error.message);
  }

  console.log('-----------------------------------------');
  console.log('📊 IMPORT SUMMARY');
  console.log('-----------------------------------------');
  console.log(`Total Workbook Rows: ${totalRows}`);
  console.log(`Valid Property Rows: ${validPropertyRows}`);
  console.log(`Imported Properties: ${importedCount}`);
  console.log(`Duplicate Properties: ${duplicateCount}`);
  console.log(`Invalid Rows: ${invalidRows}`);
  console.log(`Skipped Rows (Headers/Empty): ${skippedRows}`);
  console.log(`Import Errors: ${importErrors}`);
  console.log('-----------------------------------------');
  process.exit(0);
};

runImport();
