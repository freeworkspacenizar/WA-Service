const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const QRCode = require('qrcode');

const app = express();
app.use(express.json());

let qrImageBase64 = '';
let isReady = false;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR Code menjadi Format Gambar Base64
client.on('qr', async (qr) => {
    console.log('QR Code baru berhasil digenerate!');
    qrImageBase64 = await QRCode.toDataURL(qr);
    isReady = false;
});

client.on('ready', () => {
    console.log('WhatsApp API Siap Digunakan!');
    qrImageBase64 = '';
    isReady = true;
});

client.initialize();

// Endpoint khusus untuk melihat QR Code di Browser
app.get('/qr', (req, res) => {
    if (isReady) {
        return res.send('<h2>WhatsApp sudah terhubung / siap!</h2>');
    }
    if (!qrImageBase64) {
        return res.send('<h2>QR Code sedang digenerate, silakan refresh halaman ini dalam beberapa detik...</h2>');
    }
    res.send(`
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
            <h2>Scan QR Code WhatsApp</h2>
            <img src="${qrImageBase64}" alt="QR Code" style="width:300px;height:300px;border:1px solid #ccc;padding:10px;border-radius:8px;"/>
            <p>Refresh halaman jika QR expired.</p>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});