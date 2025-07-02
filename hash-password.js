#!/usr/bin/env node

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function hashPassword() {
  rl.question('Enter your admin password: ', async (password) => {
    if (!password || password.trim() === '') {
      console.log('❌ Password cannot be empty');
      rl.close();
      return;
    }

    if (password.trim().length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      rl.close();
      return;
    }

    try {
      // Generate SHA-256 hash (matching the Worker code)
      const hash = crypto.createHash('sha256').update(password.trim()).digest('hex');
      
      console.log('\n✅ Password hashed successfully!');
      console.log('\n📋 Your password hash:');
      console.log(hash);
      console.log('\n💡 To set this as your admin password, run:');
      console.log(`wrangler secret put ADMIN_PASSWORD_HASH`);
      console.log('\nThen paste the hash above when prompted.');
      
    } catch (error) {
      console.error('❌ Error hashing password:', error.message);
    } finally {
      rl.close();
    }
  });
}

console.log('🔐 HDYSPA Admin Password Hasher');
console.log('================================\n');

hashPassword();
