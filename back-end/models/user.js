const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  session_id: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
