const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersCollection = mongoose.connection.collection("users");
    const allUsers = await usersCollection.find({}).toArray();

    let output = `Found ${allUsers.length} users:\n`;
    allUsers.forEach((u) => {
      output += `Email: [${u.email}], Role: ${u.role}, Active: ${u.isActive}, ID: ${u._id}\n`;
    });

    fs.writeFileSync("users_list.txt", output);
    console.log("Users list written to users_list.txt");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listUsers();
