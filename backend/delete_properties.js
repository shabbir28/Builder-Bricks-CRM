const { Property, Deal, Lead, Activity, Task, Visit, Receipt, InstallmentRequest } = require('./src/models');

async function run() {
  console.log('Connecting to database and deleting properties...');
  try {
    const deletedCount = await Property.destroy({ where: {}, cascade: true });
    console.log(`Successfully deleted ${deletedCount} properties.`);
  } catch (error) {
    console.error('Error deleting properties:', error.message);
    
    // Fallback: fetch and delete one by one
    try {
      console.log('Attempting to delete properties one by one...');
      const properties = await Property.findAll();
      let count = 0;
      for (const prop of properties) {
        await prop.destroy();
        count++;
      }
      console.log(`Successfully deleted ${count} properties individually.`);
    } catch (innerError) {
       console.error('Failed to delete properties individually:', innerError.message);
    }
  }
}

run().catch(console.error).finally(() => process.exit(0));
