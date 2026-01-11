const express = require('express');
const router = express.Router();
const { sendText } = require('../whatsapp/sender').default;

module.exports = (wa) => {
    
    // Authentication middleware (simple token-based for demonstration)
    router.use((req, res, next) => {
        const token = req.headers.authorization
        console.log('HEADER:', JSON.stringify(token))
        console.log('ENV   :', JSON.stringify(`Bearer ${process.env.API_TOKEN}`))
        if (token !== `Bearer ${process.env.API_TOKEN}`) {
            return res.status(401).json({ error: 'Unauthorized' })
        }
        next()
    })

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
            res.status(200).json({ 
                status: true, 
                message: 'Message sent successfully!' 
            });
        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ 
                status: false, 
                message: 'Failed to send message: ' + error.message
            });
        }
    });

    router.get('/status', (req, res) => {
        res.status(200).json({ 
            status: true, 
            message: 'WhatsApp client is connected.' 
        });
    });

    return router;
};
            