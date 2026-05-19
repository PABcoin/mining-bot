const express = require('express');
const router = express.Router();

// GET /api/mining/stats — mining statistics for the authenticated wallet
router.get('/stats', (req, res) => {
  const { address } = req.user;

  // Mock data — replace with real mining pool API calls
  // e.g., Ethermine: https://api.ethermine.org/miner/:address/currentStats
  // e.g., 2miners: https://eth.2miners.com/api/accounts/:address
  const stats = {
    address,
    hashrate: {
      current: parseFloat((Math.random() * 200 + 50).toFixed(2)),    // MH/s
      average1h: parseFloat((Math.random() * 180 + 60).toFixed(2)),
      average24h: parseFloat((Math.random() * 170 + 65).toFixed(2)),
    },
    shares: {
      valid: Math.floor(Math.random() * 5000 + 1000),
      stale: Math.floor(Math.random() * 50),
      invalid: Math.floor(Math.random() * 10),
    },
    earnings: {
      pending: parseFloat((Math.random() * 0.05 + 0.001).toFixed(6)),
      total: parseFloat((Math.random() * 2 + 0.5).toFixed(6)),
      usdRate: 2800 + Math.random() * 200,
    },
    workers: [
      { name: 'Worker-01', hashrate: parseFloat((Math.random() * 100 + 30).toFixed(2)), status: 'online', lastSeen: new Date().toISOString() },
      { name: 'Worker-02', hashrate: parseFloat((Math.random() * 100 + 30).toFixed(2)), status: 'online', lastSeen: new Date().toISOString() },
      { name: 'Worker-03', hashrate: 0, status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString() },
    ],
    pool: {
      name: 'JayNetwork Pool',
      luck: parseFloat((Math.random() * 30 + 85).toFixed(1)),
      blockTime: '13.2s',
      lastBlock: Math.floor(Math.random() * 1000) + 19000000,
    },
    updatedAt: new Date().toISOString(),
  };

  res.json(stats);
});

// GET /api/mining/history — earnings history (last 7 days)
router.get('/history', (req, res) => {
  const history = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      earnings: parseFloat((Math.random() * 0.008 + 0.002).toFixed(6)),
      hashrate: parseFloat((Math.random() * 50 + 130).toFixed(2)),
    };
  });

  res.json(history);
});

module.exports = router;
