import { generateSecret, generateURI, verifySync } from "otplib";
import { NobleCryptoPlugin } from "@otplib/plugin-crypto-noble";
import { ScureBase32Plugin } from "@otplib/plugin-base32-scure";
import QRCode from "qrcode";

const APP_NAME = "Privatio";

const cryptoPlugin = new NobleCryptoPlugin();
const base32Plugin = new ScureBase32Plugin();

/**
 * Generate a new TOTP secret and QR code for 2FA setup.
 */
export async function generateTwoFactorSetup(userEmail: string) {
  const secret = generateSecret({ crypto: cryptoPlugin });
  const otpAuthUrl = generateURI({
    secret,
    label: userEmail,
    issuer: APP_NAME,
  });
  const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

  return { secret, qrCodeDataUrl, otpAuthUrl };
}

/**
 * Verify a TOTP token against a secret.
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  try {
    const result = verifySync({
      token,
      secret,
      crypto: cryptoPlugin,
      base32: base32Plugin,
    });
    return result.valid;
  } catch {
    return false;
  }
}
