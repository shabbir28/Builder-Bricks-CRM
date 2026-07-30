const { Client } = require('./src/models');
const sequelize = require('./src/config/database');

async function fixSchedules() {
  await sequelize.authenticate();
  console.log("Connected to DB.");

  const clients = await Client.findAll();
  let updatedCount = 0;

  for (let client of clients) {
    if (!client.installmentSchedule || client.installmentSchedule.length === 0) continue;

    let schedule = [...client.installmentSchedule];
    
    // Check if the first month has a downpayment but also has an installment
    if (schedule[0].id === 1 && schedule[0].downPayment > 0 && schedule[0].installment > 0) {
      // It means they have installment on month 1
      const installmentAmount = schedule[0].installment;
      
      // Zero out the first month's installment
      schedule[0].installment = 0;
      
      // Append a new month at the end to make up for the shifted installments
      const lastMonth = schedule[schedule.length - 1];
      const newMonthDate = new Date(lastMonth.monthDate);
      newMonthDate.setMonth(newMonthDate.getMonth() + 1);

      schedule.push({
        id: schedule.length + 1,
        monthDate: newMonthDate.toISOString(),
        downPayment: 0,
        installment: installmentAmount,
        surcharges: 0,
        adjustment: 0,
        transactionRef: "",
        paidDate: "",
        payment: 0
      });

      client.installmentSchedule = schedule;
      client.changed("installmentSchedule", true);
      await client.save();
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} clients.`);
  process.exit();
}

fixSchedules().catch(console.error);
