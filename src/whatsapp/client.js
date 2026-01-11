const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    delay
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const authPath = 'auth';

async function initWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const socket = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    // Simpan kredensial otomatis
    socket.ev.on('creds.update', saveCreds);

    // Connection update handler
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('[WA] QR Code received, scan please:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('[WA] Connected to WhatsApp');
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`[WA] Disconnected from WhatsApp, reason: ${reason}`);

            if (reason !== DisconnectReason.loggedOut) {
                console.log('[WA] Attempting to reconnect in 3 seconds...');
                await delay(3000);
                initWhatsApp();
            } else {
                console.log('[WA] Logged out. Please re-scan the QR code to log in again.');
            }
        }
    });

    // Fungsi logout graceful
    socket.logoutAndDelete = async () => {
        try {
            console.log('[WA] Logging out...');
            await socket.logout();
            console.log('[WA] Logout successful, removing session files...');
            fs.rmSync(path.resolve(authPath), { recursive: true, force: true });
            console.log('[WA] Session removed');
            process.exit(0); // optional, untuk restart gateway harus manual
        } catch (err) {
            console.error('[WA] Logout error:', err);
        }
    };

    return socket;
}

module.exports = initWhatsApp;