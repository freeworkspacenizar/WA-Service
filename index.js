const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

// Inisialisasi client dengan sesi tersimpan otomatis (LocalAuth)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.initialize();

// Endpoint POST untuk mengirim pesan
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ status: 'error', message: 'Parameter number dan message wajib ada' });
    }

    try {
        // Format nomor ke ID WhatsApp (contoh: 628123456789 -> 628123456789@c.us)
        const formattedNumber = `${number.replace(/[^0-9]/g, '')}@c.us`;
        await client.sendMessage(formattedNumber, message);

        res.json({ status: 'success', message: 'Pesan berhasil dikirim!' });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.toString() });
    }
});

app.listen(3000, () => {
    console.log('Server API berjalan di http://localhost:3000');
});