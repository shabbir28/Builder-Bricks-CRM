const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require("./src/models/User");
  const admin = await User.findOne({ role: "admin" });
  
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
  
  const formData = new FormData();
  formData.append('title', 'Test Form Data');
  formData.append('description', 'Test desc');
  formData.append('type', 'apartment');
  formData.append('price', 2000);
  formData.append('address[city]', 'Islamabad');
  formData.append('features[area]', 1000);
  formData.append('listedBy', admin._id.toString());
  
  try {
    const res = await fetch('http://localhost:5000/api/properties', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error Response:", err.message);
  }
  process.exit(0);
}
test();
