const express = require("express");
const router = express.Router();
const Key = require("../models/Key");
const { fingerprint, generateKey } = require("../lib/crypto");

const TTL_HOURS = parseInt(process.env.KEY_TTL_HOURS || "24", 10);

// Issue a key on button click. Display ads on the page are independent of this
// (no incentivization). Soft-bound to the requester's fingerprint, and a given
// fingerprint reuses its still-valid key instead of minting infinite keys.
router.post("/issue", async (req, res) => {
  const fp = fingerprint(req);

  // Reuse an existing, non-expired key for this fingerprint if present.
  const existing = await Key.findOne({ fingerprint: fp });
  if (existing && existing.expiresAt > new Date()) {
    return res.json({ key: existing.key, expiresAt: existing.expiresAt });
  }

  const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000);
  const key = generateKey(fp, expiresAt);
  await Key.create({ key, fingerprint: fp, expiresAt });

  return res.json({ key, expiresAt });
});

// 4) Loader validation endpoint.
router.get("/validate", async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ valid: false, error: "missing key" });

  const record = await Key.findOne({ key });
  if (!record) return res.json({ valid: false, error: "not found" });
  if (record.expiresAt < new Date())
    return res.json({ valid: false, error: "expired" });

  return res.json({ valid: true, expiresAt: record.expiresAt });
});

module.exports = router;
