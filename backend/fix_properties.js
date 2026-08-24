const { Client, Property } = require('./src/models/index');

async function fixProperties() {
  console.log('Fixing property amounts from linked clients...');
  try {
    const clients = await Client.findAll({
      include: [{ model: Property, as: 'purchasedProperties' }]
    });

    let updatedCount = 0;

    for (const client of clients) {
      if (client.purchasedProperties && client.purchasedProperties.length > 0) {
        // Only fix if the property has 0 paid amount
        for (const property of client.purchasedProperties) {
          if (!property.clientPaidAmount || property.clientPaidAmount === 0) {
            
            const dp = parseFloat(String(client.downPayment || 0).replace(/[^0-9.]/g, '')) || 0;
            const net = parseFloat(String(client.netPrice || client.totalPrice || 0).replace(/[^0-9.]/g, '')) || property.price;

            await property.update({
              clientPaidAmount: dp,
              price: net
            });
            console.log(`Updated Property ${property.unitNumber || property.id} for client ${client.name} (DP: ${dp}, Net: ${net})`);
            updatedCount++;
          }
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} properties.`);
  } catch (error) {
    console.error('Error updating properties:', error);
  } finally {
    process.exit(0);
  }
}

fixProperties();
