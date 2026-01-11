/**
 * sender.js
 * Modul untuk mengirim pesan WhatsApp
 */

async function sendText(sock, number, message) {
    try {
        if (!number || !message) {
            throw new Error('Number and message are required');
        }

        // Normalisasi nomor: 0812xxx -> 62812xxx
        const jid = number
            .replace(/^0/, '62')    // ganti 0 di depan dengan 62
            .replace(/\D/g, '') + '@s.whatsapp.net'; // hapus non-digit, tambah domain WA

        await sock.sendMessage(jid, { text: message });
        console.log(`[WA] Message sent to ${jid}`);
        return true;

    } catch (err) {
        console.error(`[WA] Failed to send message to ${number}:`, err);
        throw err;
    }
}

module.exports = { sendText };
