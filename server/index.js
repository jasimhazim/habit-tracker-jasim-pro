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

// AI Agent Endpoint (Gemini 2.5 Flash)
app.post('/api/agent', async (req, res, next) => {
  try {
    const { prompt, context } = req.body;
    // User provided the Gemini key directly, so we'll use it as fallback if not in ENV
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDCMq8GZnnUDy9ZLiLWYduQlLpoecTNiZQ';

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
    }

    const systemPrompt = `You are a high-end personal assistant AI integrated into a premium Habit and Goals tracker dashboard.
Your job is to read the user's message, understand their intent based on the app's current context, and return a strict JSON array of ACTION objects to execute.
Do not return conversational text outside the JSON.

Allowed Action Types:
1. { "type": "update_calories", "value": 500 } // Adds 500 to current
2. { "type": "check_habit", "habit": "Gym", "day": "Wed" } // Checks off a habit for a short day name (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
3. { "type": "update_weight", "value": 78.5 } // Sets current weight

Current Context:
${JSON.stringify(context)}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}` }] }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const messageContent = data.candidates[0].content.parts[0].text;
    let actions = [];
    try {
      const parsed = JSON.parse(messageContent);
      actions = Array.isArray(parsed) ? parsed : (parsed.actions || []);
    } catch(e) {
      const match = messageContent.match(/\[\s*\{.*\}\s*\]/s);
      if (match) actions = JSON.parse(match[0]);
    }

    res.json({ actions });
  } catch (error) {
    console.error("AI Error:", error);
    next(error);
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
