#!/usr/bin/env node
/**
 * Generate APP_PASSWORD_HASH for Vercel / local env.
 * Usage: node scripts/hash-password.mjs "<your-password>"
 * Do not commit plaintext passwords or command history containing them.
 */
import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd || pwd === '-h' || pwd === '--help') {
  console.error('Usage: node scripts/hash-password.mjs "<plaintext-password>"');
  console.error('Prints a bcrypt hash (cost 12). Set the output as APP_PASSWORD_HASH.');
  process.exit(pwd ? 0 : 1);
}

const hash = await bcrypt.hash(pwd, 12);
console.log(hash);
