require('dotenv').config();
const express = require('express');
const initWhatsApp = require('./whatsapp/client');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

async function startServer() {
  try {
    console.log('[WA] Inisialisasi WhatsApp...')
    const wa = await initWhatsApp()
    console.log('[WA] WhatsApp already initialized, register API routes')

    // Register API routes
    app.use('/api', apiRoutes(wa))

    app.listen(PORT, () => {
      console.log(`[Server] WA Gateway running on port ${PORT}`)
    })

  } catch (err) {
    console.error('[Error] Failed running gateway:', err)
    process.exit(1)
  }
}

// Jalankan server
startServer()
