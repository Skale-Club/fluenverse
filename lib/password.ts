import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

function derive(password: string, salt: string, n: number, r: number, p: number) {
  return scryptSync(password, salt, KEY_LEN, {
    N: n,
    r,
    p,
    maxmem: 32 * 1024 * 1024,
  });
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = derive(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P).toString("hex");
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  try {
    const [algo, nValue, rValue, pValue, salt, expectedHashHex] = storedHash.split("$");
    if (algo !== "scrypt" || !salt || !expectedHashHex) {
      return false;
    }

    const n = Number(nValue);
    const r = Number(rValue);
    const p = Number(pValue);
    if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
      return false;
    }

    const expected = Buffer.from(expectedHashHex, "hex");
    const actual = derive(password, salt, n, r, p);

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
