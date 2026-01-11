require('dotenv').config();
const express = require('express');
const initWhatsApp = require('./whatsapp/client');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

;(async () => {
    const wa = await initWhatsApp()
    app.use('/api', apiRoutes(wa))
})();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});