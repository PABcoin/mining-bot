# ⛏️ Crypto Mining Dashboard

Dashboard monitoring mining ETH/BSC dengan autentikasi wallet menggunakan private key signing.

**Cara kerja autentikasi (aman):**
> Private key hanya digunakan secara lokal di browser untuk menandatangani pesan. Yang dikirim ke server hanyalah *signature* (tanda tangan kriptografi) — bukan private key-nya. Sama seperti cara kerja OpenSea, Uniswap, dll.

---

## 🛠 Tech Stack
- **Frontend**: React + Vite + TailwindCSS + ethers.js
- **Backend**: Node.js + Express + JWT
- **Deploy**: Docker → Railway (via GitHub)

---

## 🚀 Deploy ke Railway (via GitHub)

### Langkah 1 — Push ke GitHub

```bash
cd crypto-mining-dashboard
git init
git add .
git commit -m "feat: initial mining dashboard"
git branch -M main

# Buat repo baru di github.com lalu:
git remote add origin https://github.com/USERNAME/mining-dashboard.git
git push -u origin main
```

### Langkah 2 — Setup Railway

1. Buka [railway.app](https://railway.app) → Login
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo `mining-dashboard`
4. Railway akan otomatis detect `Dockerfile` dan mulai build

### Langkah 3 — Set Environment Variables di Railway

Di Railway dashboard → tab **Variables**, tambahkan:

| Variable | Value |
|---|---|
| `JWT_SECRET` | String random panjang (min 32 karakter) |
| `PORT` | `3000` (atau biarkan Railway yang set) |

> Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Langkah 4 — Generate Domain

Di Railway → tab **Settings** → **Networking** → **Generate Domain**

Selesai! App akan berjalan di `https://your-app.up.railway.app`

---

## 💻 Jalankan Secara Lokal

```bash
# 1. Install dependencies
cd server && npm install && cd ..
cd client && npm install && cd ..

# 2. Buat file .env di folder server/
cp .env.example server/.env
# Edit server/.env dan isi JWT_SECRET

# 3. Jalankan server (terminal 1)
cd server && npm run dev

# 4. Jalankan client (terminal 2)
cd client && npm run dev

# Buka http://localhost:5173
```

---

## 🔗 Menghubungkan ke Mining Pool Sungguhan

Edit `server/routes/mining.js` dan ganti mock data dengan API pool:

```js
// Ethermine
const res = await fetch(`https://api.ethermine.org/miner/${address}/currentStats`)

// 2miners
const res = await fetch(`https://eth.2miners.com/api/accounts/${address}`)

// FlexPool
const res = await fetch(`https://flexpool.io/api/v2/miner/stats/?coin=eth&address=${address}`)
```

---

## ⚠️ Keamanan

- Gunakan **wallet khusus mining**, bukan wallet utama
- Jangan pernah share private key ke siapapun
- Aktifkan HTTPS (Railway otomatis menyediakan ini)
- Ganti `JWT_SECRET` dengan string yang benar-benar random

---

## 📁 Struktur Project

```
crypto-mining-dashboard/
├── Dockerfile          ← Build & deploy config
├── railway.json        ← Railway config
├── .env.example        ← Template env vars
├── server/
│   ├── index.js        ← Express server
│   ├── routes/
│   │   ├── auth.js     ← Nonce + signature verification
│   │   └── mining.js   ← Mining stats API
│   └── middleware/
│       └── auth.js     ← JWT verification
└── client/
    └── src/
        ├── App.jsx
        ├── pages/
        │   ├── Login.jsx     ← Private key signing
        │   └── Dashboard.jsx ← Mining stats UI
        └── index.css
```
