import crypto from "node:crypto";
import env from "@/config/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96-bit IV is standard for GCM

interface EncryptedBlob {
  version: 1;
  iv: string;
  tag: string;
  ciphertext: string;
}

function getKey(): Buffer {
  const key = Buffer.from(env.CRED_ENCRYPTION_KEY, "hex");
  if (key.length !== 32) {
    throw new Error("CRED_ENCRYPTION_KEY must be 64 hex chars (32 bytes)");
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  const blob: EncryptedBlob = {
    version: 1,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
  return JSON.stringify(blob);
}

export function decrypt(raw: string): string {
  const key = getKey();
  const { version, iv, tag, ciphertext } = JSON.parse(raw) as EncryptedBlob;
  if (version !== 1) throw new Error(`Unknown encryption version: ${version}`);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
