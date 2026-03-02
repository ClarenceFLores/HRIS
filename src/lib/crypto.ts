/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 * 
 * Password hashing and verification utilities
 */

// Simple password hashing using Web Crypto API (available in browsers)
export class PasswordUtils {
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000;
  private static readonly KEY_LENGTH = 32;

  /**
   * Generate a random salt
   */
  private static generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  /**
   * Convert array buffer to hex string
   */
  private static arrayBufferToHex(buffer: ArrayBufferLike): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hex string to array buffer
   */
  private static hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  /**
   * Derive key from password and salt using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    return await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      key,
      this.KEY_LENGTH * 8
    );
  }

  /**
   * Hash a password
   * Returns a string in format: salt$hashedPassword
   */
  public static async hashPassword(password: string): Promise<string> {
    const salt = this.generateSalt();
    const hashedKey = await this.deriveKey(password, salt);
    
    const saltHex = this.arrayBufferToHex(salt.buffer);
    const hashHex = this.arrayBufferToHex(hashedKey);
    
    return `${saltHex}$${hashHex}`;
  }

  /**
   * Verify a password against its hash
   */
  public static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const [saltHex, hashHex] = hash.split('$');
      if (!saltHex || !hashHex) {
        return false;
      }

      const salt = new Uint8Array(this.hexToArrayBuffer(saltHex));
      const expectedHash = this.hexToArrayBuffer(hashHex);
      const actualHash = await this.deriveKey(password, salt);

      // Compare the hashes using constant-time comparison
      return this.constantTimeEqual(new Uint8Array(expectedHash), new Uint8Array(actualHash));
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Constant-time comparison to prevent timing attacks
   */
  private static constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }

    return result === 0;
  }

  /**
   * Check if a string is already hashed (contains salt separator)
   */
  public static isHashed(password: string): boolean {
    return password.includes('$') && password.split('$').length === 2;
  }

  /**
   * Migrate plain text password to hashed format
   */
  public static async migratePassword(plainPassword: string): Promise<string> {
    if (this.isHashed(plainPassword)) {
      return plainPassword; // Already hashed
    }
    return await this.hashPassword(plainPassword);
  }
}

// Legacy simple hash for backward compatibility (NOT SECURE - only for demo)
export function legacySimpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}