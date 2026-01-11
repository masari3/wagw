const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const qrcode = require('qrcode-terminal');

async function initWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const socket = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    socket.ev.on('creds.update', saveCreds);

    socket.ev.on('connection.update', (update) => {
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
                initWhatsApp();
            } else {
                console.log('[WA] Logged out from WhatsApp, please re-scan the QR code to log in again.');
            }
        }
    });

    return socket;
}

module.exports = initWhatsApp;