const xlsx = require('xlsx');
const path = require('path');

const filePath = path.resolve('d:/builder-brick-crm/frontend/public/Elite one Remaining Apartments.xlsx');
console.log('Reading:', filePath);

try {
  const workbook = xlsx.readFile(filePath);
  console.log('Sheet Names:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    // Print first 20 rows to understand the structure
    data.slice(0, 500).forEach((row, i) => {
      console.log(`Row ${i + 1}:`, row);
    });
  });
} catch (e) {
  console.error('Error reading excel:', e);
}
