import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-dev';

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, displayName, profilePictureUrl } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName, profilePictureUrl: profilePictureUrl || null }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, profilePictureUrl: user.profilePictureUrl } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName, profilePictureUrl: user.profilePictureUrl } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName, profilePictureUrl: user.profilePictureUrl } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google payload');

    const { email, name, picture } = payload;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user using Google info
      user = await prisma.user.create({
        data: { 
          email, 
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10), // Random placeholder password
          displayName: name, 
          profilePictureUrl: picture || null 
        }
      });
    }

    const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: jwtToken, user: { id: user.id, email: user.email, displayName: user.displayName, profilePictureUrl: user.profilePictureUrl } });
  } catch (e) {
    console.error('Google Auth Error:', e);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// --- DATA ROUTES (HABITS & SETTINGS) ---
app.get('/api/data/habits', authMiddleware, async (req, res) => {
  try {
    const habits = await prisma.habitLog.findMany({ where: { userId: req.userId } });
    const formatted = habits.reduce((acc, h) => ({ ...acc, [h.key]: h.completed }), {});
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data/habits', authMiddleware, async (req, res) => {
  try {
    const { key, completed } = req.body;
    await prisma.habitLog.upsert({
      where: { userId_key: { userId: req.userId, key } },
      update: { completed },
      create: { userId: req.userId, key, completed }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/data/settings', authMiddleware, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany({ where: { userId: req.userId } });
    const formatted = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data/settings', authMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body;
    await prisma.setting.upsert({
      where: { userId_key: { userId: req.userId, key } },
      update: { value: String(value) },
      create: { userId: req.userId, key, value: String(value) }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/data/health', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query; // YYYY-MM-DD
    const isoDate = date || new Date().toISOString().split('T')[0];
    
    let health = await prisma.healthLog.findUnique({
      where: { userId_date: { userId: req.userId, date: isoDate } }
    });

    if (!health) {
      health = { calories: 0, weight: null, date: isoDate };
    }
    
    res.json(health);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data/health', authMiddleware, async (req, res) => {
  try {
    const { date, calories, weight } = req.body;
    const isoDate = date || new Date().toISOString().split('T')[0];
    
    await prisma.healthLog.upsert({
      where: { userId_date: { userId: req.userId, date: isoDate } },
      update: { 
        calories: calories !== undefined ? calories : undefined,
        weight: weight !== undefined ? weight : undefined
      },
      create: { 
        userId: req.userId, 
        date: isoDate, 
        calories: calories || 0,
        weight: weight || null
      }
    });
    
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

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

// AI Omni-Agent Endpoint (Gemini 2.5 Flash)
app.post('/api/agent', authMiddleware, async (req, res, next) => {
  try {
    const { prompt, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing. Please add it to your environment variables.' });
    }

    const systemPrompt = `You are a high-end personal assistant AI integrated into a premium Habit and Goals tracker dashboard.
Your job is to read the user's message, understand their intent based on the app's current context, and return a strict JSON array of ACTION objects to execute.
Do not return conversational text outside the JSON.

Allowed Action Types:
1. { "type": "update_calories", "value": 500 } // Adds 500 to current
2. { "type": "check_habit", "habit": "Gym", "day": "Wed" } // Checks off a habit for a short day name (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
3. { "type": "update_weight", "value": 78.5 } // Sets current weight
4. { "type": "update_setting", "key": "settings:budget", "value": "2200" } // Use "settings:budget" for budget and "settings:study" for study hours
5. { "type": "chat", "message": "تم التنفيذ يا بطل" } // A friendly arabic text message to show the user

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

    // Phase 4: Server-Side Execution
    // Go through actions and execute them in the DB directly
    const today = new Date().toISOString().split('T')[0];
    
    for (const action of actions) {
      if (action.type === 'update_calories') {
        let health = await prisma.healthLog.findUnique({ where: { userId_date: { userId: req.userId, date: today } } });
        const currentCal = health ? health.calories : 0;
        await prisma.healthLog.upsert({
          where: { userId_date: { userId: req.userId, date: today } },
          update: { calories: currentCal + action.value },
          create: { userId: req.userId, date: today, calories: action.value }
        });
      }
      else if (action.type === 'update_weight') {
        await prisma.healthLog.upsert({
          where: { userId_date: { userId: req.userId, date: today } },
          update: { weight: action.value },
          create: { userId: req.userId, date: today, weight: action.value }
        });
      }
      else if (action.type === 'check_habit') {
        // Assume key format: "mon-gym" based on action.day and action.habit
        const key = `${action.day.toLowerCase()}-${action.habit.toLowerCase()}`;
        await prisma.habitLog.upsert({
           where: { userId_key: { userId: req.userId, key } },
           update: { completed: true },
           create: { userId: req.userId, key, completed: true }
        });
      }
      else if (action.type === 'update_setting') {
        await prisma.setting.upsert({
          where: { userId_key: { userId: req.userId, key: action.key } },
          update: { value: String(action.value) },
          create: { userId: req.userId, key: action.key, value: String(action.value) }
        });
      }
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
