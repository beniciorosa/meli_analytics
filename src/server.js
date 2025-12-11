const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ML Constants
const ML_AUTH_URL = 'https://auth.mercadolivre.com.br/authorization';
const ML_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token';
const ML_API_URL = 'https://api.mercadolibre.com';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Meli Analytics Backend is running');
});

// Authentication Routes
app.get('/api/auth/url', (req, res) => {
  const url = `${ML_AUTH_URL}?response_type=code&client_id=${process.env.ML_CLIENT_ID}&redirect_uri=${process.env.ML_REDIRECT_URI}`;
  res.json({ url });
});

app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(ML_TOKEN_URL, querystring.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ML_REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    // In a real app, store tokens in session/db. Sending back to client for demo.
    // Redirect to frontend with token
    const { access_token, refresh_token, user_id, expires_in } = response.data;

    // Check environment to determine redirect base
    // Vercel sets NODE_ENV=production. In prod, we want relative path '/callback'
    // Locally, we want 'http://localhost:5173/callback'
    const redirectBase = process.env.NODE_ENV === 'production' ? '/callback' : 'http://localhost:5173/callback';

    res.redirect(`${redirectBase}?access_token=${access_token}&refresh_token=${refresh_token}&user_id=${user_id}&expires_in=${expires_in}`);

  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate' });
  }
});

// Manual Code Exchange Route
app.get('/api/auth/exchange', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(ML_TOKEN_URL, querystring.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ML_REDIRECT_URI,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to authenticate', details: error.response?.data });
  }
});

// Proxy for Orders
app.get('/api/orders', async (req, res) => {
  const { access_token, seller_id } = req.query;

  if (!access_token || !seller_id) {
    return res.status(400).json({ error: 'Missing access_token or seller_id' });
  }

  try {
    const response = await axios.get(`${ML_API_URL}/orders/search?seller=${seller_id}&order.status=paid`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Export for Vercel
module.exports = app;

// Only listen if running locally (not in Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
