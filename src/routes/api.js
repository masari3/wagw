const express = require('express');
const { sendText } = require('../whatsapp/sender');
const router = express.Router();

// Simple token-based auth middleware
function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    const expected = `Bearer ${process.env.API_TOKEN}`;

    if (token !== expected) {
        console.warn('[API] Unauthorized access attempt:', token);
        return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
    next();
}

module.exports = (wa) => {
    router.use(authMiddleware);

    // Send WhatsApp message
    router.post('/send', async (req, res) => {
        try {
            const { number, message } = req.body;
            if (!number || !message) {
                return res.status(422).json({ 
                    status: false, 
                    message: 'Number and message are required!' 
                });
            }

            await sendText(wa, number, message);

            console.log(`[API] Message sent to ${number}`);
            res.status(200).json({ status: true, message: 'Message sent successfully!' });

        } catch (error) {
            console.error('[API] Error sending message:', error);
            res.status(500).json({ 
                status: false, 
                message: 'Failed to send message: ' + error.message
            });
        }
    });

    // Check WhatsApp connection status
    router.get('/status', (req, res) => {
        const isConnected = !!wa.user; // socket.user tersedia jika connected
        res.status(200).json({
            status: isConnected,
            message: isConnected ? 'WhatsApp client is connected.' : 'WhatsApp client is disconnected.'
        });
    });

    // Logout WhatsApp
    router.post('/logout', async (req, res) => {
        try {
            if (!wa.logoutAndDelete) {
                return res.status(500).json({ status: false, message: 'WhatsApp client not ready.' });
            }

            await wa.logoutAndDelete();
            res.status(200).json({ status: true, message: 'Logout successful, session removed.' });

        } catch (error) {
            console.error('[API] Error during logout:', error);
            res.status(500).json({ status: false, message: 'Logout failed: ' + error.message });
        }
    });

    return router;
};
