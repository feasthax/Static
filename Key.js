const mongoose = require("mongoose");

const KeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  fingerprint: { type: String, index: true }, // ties key to one client (IP+UA hash)
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// Auto-purge expired keys (also serves as the expiresAt index)
KeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Key", KeySchema);
