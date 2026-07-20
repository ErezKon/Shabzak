/**
 * @deprecated Client-side AES encryption is no longer used.
 * Session management now uses JWT tokens from the backend.
 * The AES key was previously bundled in the client — a security vulnerability.
 * This file can be safely deleted once all references are confirmed removed.
 */

// No-op stubs to prevent build errors if any stale imports remain.
export const encryptAES = (_message: string): string => {
    throw new Error('Client-side AES encryption has been removed. Use JWT tokens.');
}

export const decryptAES = (_message: string): string => {
    throw new Error('Client-side AES decryption has been removed. Use JWT tokens.');
}