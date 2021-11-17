const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  username: { type: String, required: true },
  session_id: { type: String, required: true },
  timestamp: { type: Date, required: true },
  content: { type: String, required: true }
});

module.exports = mongoose.model('Message', messageSchema);
