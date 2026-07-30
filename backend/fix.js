const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

mongoose.connect('mongodb+srv://shabbirahmeddevv_db_user:ovDN9riisDPPun5f@builderbrick.wlevkfa.mongodb.net/?appName=builderbrick').then(async () => {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash('asdfgh', salt);
  await User.updateOne({ email: 'hamad@gmail.com' }, { password: hash });
  console.log('Fixed Hamad password');
  process.exit(0);
});
