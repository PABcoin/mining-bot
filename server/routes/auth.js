const express = require('express');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Temporary nonce store (use Redis in production)
const nonceStore = new Map();

// POST /api/auth/nonce — request a message to sign
router.post('/nonce', (req, res) => {
  const { address } = req.body;
  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: 'Valid wallet address required' });
  }

  const nonce = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
  const timestamp = Date.now();

  nonceStore.set(address.toLowerCase(), { nonce, timestamp });

  // Nonce expires after 5 minutes
  setTimeout(() => nonceStore.delete(address.toLowerCase()), 5 * 60 * 1000);

  const message = `Welcome to Mining Dashboard\n\nSign this message to authenticate.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

  res.json({ message, nonce });
});

// POST /api/auth/verify — verify signature and issue JWT
router.post('/verify', (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(400).json({ error: 'Address and signature are required' });
  }

  const stored = nonceStore.get(address.toLowerCase());
  if (!stored) {
    return res.status(400).json({ error: 'No pending nonce. Please request a new one.' });
  }

  const { nonce, timestamp } = stored;
  const message = `Welcome to Mining Dashboard\n\nSign this message to authenticate.\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet: ${address}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;

  try {
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    nonceStore.delete(address.toLowerCase());

    const token = jwt.sign(
      { address: address.toLowerCase() },
      process.env.JWT_SECRET || 'change-this-secret-in-production',
      { expiresIn: '24h' }
    );

    res.json({ token, address });
  } catch (err) {
    console.error('Signature verification error:', err.message);
    res.status(401).json({ error: 'Signature verification failed' });
  }
});

module.exports = router;
