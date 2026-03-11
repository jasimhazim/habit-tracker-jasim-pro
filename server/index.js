import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

// Helper to check if Plaid is configured
const isPlaidConfigured = () => !!(PLAID_CLIENT_ID && PLAID_SECRET);

app.post('/api/create_link_token', async (req, res) => {
  if (!isPlaidConfigured()) {
    return res.status(400).json({ error: 'Plaid keys not configured in .env' });
  }
  try {
    const request = {
      user: { client_user_id: 'user-id' },
      client_name: 'Habit Tracker Pro',
      products: ['transactions'],
      language: 'en',
      country_codes: ['US', 'CA', 'GB'],
    };
    const response = await plaidClient.linkTokenCreate(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/set_access_token', async (req, res) => {
  const { public_token } = req.body;
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    const access_token = response.data.access_token;
    // In production, save access_token securely to DB.
    res.json({ access_token });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  const { access_token } = req.query;
  if (!access_token) return res.status(400).json({ error: 'No access token provided' });
  
  try {
    // Fetch last 30 days of transactions
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const request = {
      access_token: access_token,
      start_date: thirtyDaysAgo.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    };
    const response = await plaidClient.transactionsGet(request);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('/{*wildcard}', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!isPlaidConfigured()) {
    console.warn('⚠️  Plaid keys are missing. Finance features will be disabled or simulated.');
  }
});
