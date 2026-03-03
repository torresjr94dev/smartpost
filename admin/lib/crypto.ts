/**
 * AES-256-CBC encryption/decryption for social tokens.
 * Token format stored in DB: "<iv_hex>:<encrypted_hex>"
 *
 * Requires env: TOKEN_ENCRYPTION_KEY — 32 bytes as hex string (64 hex chars)
 * Generate with: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-cbc'

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be a 64-char hex string (32 bytes). ' +
      'Generate with: openssl rand -hex 32'
    )
  }
  return Buffer.from(key, 'hex')
}

/**
 * Encrypts a plaintext string (e.g. OAuth access token).
 * Returns "<iv_hex>:<ciphertext_hex>"
 */
export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypts a token stored in DB format "<iv_hex>:<ciphertext_hex>".
 * Throws if format is invalid.
 */
export function decryptToken(stored: string): string {
  const parts = stored.split(':')
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted token format. Expected "<iv_hex>:<ciphertext_hex>"')
  }
  const [ivHex, encryptedHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

/**
 * Returns true if a stored value looks like an encrypted token
 * (used to guard against double-encryption).
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  return parts.length === 2 && parts[0].length === 32 && /^[0-9a-f]+$/i.test(parts[0])
}
