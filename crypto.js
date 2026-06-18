const crypto = require("crypto");

const SECRET = process.env.KEY_SECRET || "insecure_default_change_me";

function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("hex");
}

// Fingerprint a client so a key issued to one user can't trivially be shared.
// Not bulletproof (IPs change, VPNs exist) but a reasonable soft binding.
function fingerprint(req) {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "";
  const ua = req.headers["user-agent"] || "";
  return crypto.createHash("sha256").update(ip + "|" + ua).digest("hex").slice(0, 32);
}

// HMAC-signed key: payload.signature. Lets the loader verify offline if you
// ever want that, while the DB remains the source of truth for revocation/TTL.
function generateKey(fp, expiresAt) {
  const payload = `${randomToken(12)}.${fp}.${expiresAt.getTime()}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex")
    .slice(0, 24);
  const raw = Buffer.from(`${payload}.${sig}`).toString("base64url");
  return raw;
}

// Verify a provider's server-to-server postback signature.
// Most providers sign as HMAC_SHA256(secret, token) — adjust per provider docs.
function verifyPostback(token, signature, secret) {
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(token).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature || "")
    );
  } catch {
    return false;
  }
}

module.exports = { randomToken, fingerprint, generateKey, verifyPostback };
