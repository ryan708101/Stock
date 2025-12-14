import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import UserModel from './models/User.js';

dotenv.config();

const expressApp = express();
const httpServerInstance = createServer(expressApp);
const socketIOServer = new Server(httpServerInstance, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const SERVER_PORT = process.env.PORT || 5000;
const DATABASE_CONNECTION_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock_dashboard';

// Express middleware configuration
expressApp.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
expressApp.use(express.json());

// Establish MongoDB connection
mongoose.connect(DATABASE_CONNECTION_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((connectionError) => {
    console.error('❌ MongoDB connection error:', connectionError);
  });

// Available stock tickers
const AVAILABLE_STOCK_TICKERS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// API route handlers

// POST /api/register - Register a new user account
expressApp.post('/api/register', async (request, response) => {
  try {
    const { email, password, fullName } = request.body;

    // Input validation
    if (!email || !email.trim()) {
      return response.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return response.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    if (!fullName || !fullName.trim()) {
      return response.status(400).json({ error: 'Full name is required' });
    }

    // Verify if user already exists
    const existingUserRecord = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUserRecord) {
      return response.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user record
    const newUserRecord = new UserModel({
      email: email.trim().toLowerCase(),
      password: password,
      fullName: fullName.trim(),
      subscriptions: []
    });

    await newUserRecord.save();
    console.log(`✅ New user registered: ${newUserRecord.email}`);

    response.json({
      success: true,
      user: {
        email: newUserRecord.email,
        fullName: newUserRecord.fullName,
        subscriptions: newUserRecord.subscriptions
      }
    });
  } catch (registrationError) {
    console.error('Registration error:', registrationError);
    if (registrationError.code === 11000) {
      return response.status(400).json({ error: 'User with this email already exists' });
    }
    response.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/login - Authenticate user credentials
expressApp.post('/api/login', async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email || !email.trim()) {
      return response.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Password is required' });
    }

    // Locate user by email
    const userRecord = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!userRecord) {
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    // Validate password
    const passwordIsValid = await userRecord.comparePassword(password);
    if (!passwordIsValid) {
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    console.log(`✅ User logged in: ${userRecord.email}`);

    response.json({
      success: true,
      user: {
        email: userRecord.email,
        fullName: userRecord.fullName,
        subscriptions: userRecord.subscriptions
      }
    });
  } catch (loginError) {
    console.error('Login error:', loginError);
    response.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/subscribe - Add stock ticker to user's subscription list
expressApp.post('/api/subscribe', async (request, response) => {
  try {
    const { email, ticker } = request.body;

    if (!email || !ticker) {
      return response.status(400).json({ error: 'Email and ticker are required' });
    }

    if (!AVAILABLE_STOCK_TICKERS.includes(ticker)) {
      return response.status(400).json({ error: 'Invalid ticker symbol' });
    }

    const userRecord = await UserModel.findOne({ email: email.trim().toLowerCase() });

    if (!userRecord) {
      return response.status(404).json({ error: 'User not found' });
    }

    // Append subscription if not already present
    if (!userRecord.subscriptions.includes(ticker)) {
      userRecord.subscriptions.push(ticker);
      await userRecord.save();
    }

    response.json({
      success: true,
      subscriptions: userRecord.subscriptions
    });
  } catch (subscriptionError) {
    console.error('Subscribe error:', subscriptionError);
    response.status(500).json({ error: 'Server error during subscription' });
  }
});

// POST /api/unsubscribe - Remove stock ticker from user's subscription list
expressApp.post('/api/unsubscribe', async (request, response) => {
  try {
    const { email, ticker } = request.body;

    if (!email || !ticker) {
      return response.status(400).json({ error: 'Email and ticker are required' });
    }

    const userRecord = await UserModel.findOne({ email: email.trim().toLowerCase() });

    if (!userRecord) {
      return response.status(404).json({ error: 'User not found' });
    }

    // Filter out the specified ticker from subscriptions
    userRecord.subscriptions = userRecord.subscriptions.filter(subscriptionTicker => subscriptionTicker !== ticker);
    await userRecord.save();

    response.json({
      success: true,
      subscriptions: userRecord.subscriptions
    });
  } catch (unsubscriptionError) {
    console.error('Unsubscribe error:', unsubscriptionError);
    response.status(500).json({ error: 'Server error during unsubscription' });
  }
});

// WebSocket connection event handlers
socketIOServer.on('connection', (clientSocket) => {
  console.log(`✅ Client connected: ${clientSocket.id}`);

  clientSocket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${clientSocket.id}`);
  });
});

// Generate randomized stock prices and broadcast to all connected clients every second
setInterval(() => {
  const currentStockPrices = {};
  
  AVAILABLE_STOCK_TICKERS.forEach(stockTicker => {
    // Generate random price value between 100 and 1000
    currentStockPrices[stockTicker] = (Math.random() * 900 + 100).toFixed(2);
  });

  // Broadcast price updates to all connected clients
  socketIOServer.emit('stockUpdates', currentStockPrices);
}, 1000);

// Initialize server
httpServerInstance.listen(SERVER_PORT, () => {
  console.log(`🚀 Server running on port ${SERVER_PORT}`);
  console.log(`📡 Socket.io server ready`);
});

