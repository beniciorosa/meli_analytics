const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Determine correct path for Vercel
// In Vercel, CWD is usually the project root
const frontendPath = path.join(process.cwd(), 'frontend', 'dist');

console.log('Serving static files from:', frontendPath);
app.use(express.static(frontendPath));

// ML Constants
const ML_AUTH_URL = 'https://auth.mercadolivre.com.br/authorization';
const ML_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
const ML_API_URL = 'https://api.mercadolibre.com';

app.use(cors());
app.use(express.json());

// Manager Route: Refresh Token -> Get Orders
app.get('/api/manager/orders', async (req, res) => {
  const { refresh_token, seller_id } = req.query;

  if (!refresh_token || !seller_id) {
    return res.status(400).json({ error: 'Missing refresh_token or seller_id' });
  }

  try {
    // 1. Refresh the Token
    const tokenResponse = await axios.post(ML_TOKEN_URL, querystring.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: refresh_token
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, new_refresh_token } = tokenResponse.data;

    // 2. Fetch Orders with new Access Token
    const ordersResponse = await axios.get(`${ML_API_URL}/orders/search?seller=${seller_id}&order.status=paid`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Return orders + new refresh token (so user can update their DB/list)
    res.json({
      orders: ordersResponse.data.results,
      new_refresh_token: new_refresh_token || refresh_token // ML rotates tokens, send back new one
    });

  } catch (error) {
    console.error('Error in manager flow:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.response?.data
    });
  }
});

// Serve Frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
});

// Export for Vercel
module.exports = app;

// Only listen if running locally (not in Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
