// Symmetric encryption for API request/response bodies, matching
// backend/utils/crypto.js. Both sides share one key (VITE_API_CRYPTO_KEY on
// this side, API_CRYPTO_KEY on the server) — set them to the same base64
// 32-byte value.
//
// NOTE: this only obscures payloads from a casual glance at DevTools/Network
// tab. It is NOT a secrecy boundary against this browser's own user — the
// key ships in this bundle, so anyone willing to read the bundle or set a
// breakpoint after decryption can still see the data. Real security still
// depends on HTTPS (transport) + auth/authorization (access control) on the
// server.

const IV_LENGTH = 12; // recommended nonce size for AES-GCM

let cachedKeyPromise = null;

function getKey() {
  if (!cachedKeyPromise) {
    const keyB64 = import.meta.env.VITE_API_CRYPTO_KEY;
    if (!keyB64) {
      throw new Error("VITE_API_CRYPTO_KEY is not set");
    }
    const raw = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0));
    cachedKeyPromise = crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
      "encrypt",
      "decrypt",
    ]);
  }
  return cachedKeyPromise;
}

function bufToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// data -> base64(iv || ciphertext || authTag)
export async function encryptPayload(data) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bufToBase64(combined.buffer);
}

// base64(iv || ciphertext || authTag) -> data
export async function decryptPayload(payloadB64) {
  const key = await getKey();
  const combined = new Uint8Array(base64ToBuf(payloadB64));
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertext = combined.slice(IV_LENGTH);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
