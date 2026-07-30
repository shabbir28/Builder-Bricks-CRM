const { Client, Property } = require('./src/models');
const { Op } = require('sequelize');

async function run() {
  const clientsToDelete = await Client.findAll({
    where: {
      name: {
        [Op.notILike]: '%Tahir%'
      }
    }
  });

  for (const client of clientsToDelete) {
    // Unlink properties
    await Property.update(
      { status: 'available', clientId: null, clientPaidAmount: 0 },
      { where: { clientId: client.id } }
    );
    // Delete client
    await client.destroy();
  }
  console.log(`Deleted ${clientsToDelete.length} clients.`);
}

run().catch(console.error).finally(() => process.exit(0));
