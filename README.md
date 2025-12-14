# Stock Broker Client Web Dashboard

A real-time stock price monitoring dashboard built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io for live updates.

## Features

- **Simplified Authentication**: Login with just your email address
- **Stock Subscriptions**: Subscribe/Unsubscribe to supported stocks (GOOG, TSLA, AMZN, META, NVDA)
- **Real-Time Price Updates**: Live stock prices updated every second via WebSocket
- **Multi-User Support**: Each user maintains their own independent subscriptions
- **Persistent Storage**: Subscriptions are saved in MongoDB and persist across sessions

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io
- **Tools**: Concurrently (to run both servers simultaneously)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

## Installation

1. **Install all dependencies** (root, server, and client):
```bash
npm run install-all
```

Or install manually:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Set up MongoDB**:
   - Make sure MongoDB is running locally on `mongodb://localhost:27017`
   - Or update the `MONGODB_URI` in `server/.env` (create this file if needed)

3. **Configure Environment Variables** (optional):
   Create a `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock_dashboard
CLIENT_URL=http://localhost:5173
```

## Running the Application

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend dev server (port 5173) simultaneously.

### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter your email address to login (new users are automatically created)
3. Subscribe to stocks from the available list (GOOG, TSLA, AMZN, META, NVDA)
4. Watch real-time price updates for your subscribed stocks
5. Unsubscribe from stocks as needed
6. Your subscriptions persist across browser sessions

## Project Structure

```
stock-dashboard/
├── server/
│   ├── models/
│   │   └── User.js          # Mongoose user schema
│   ├── index.js             # Express server + Socket.io
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx    # Login component
│   │   │   └── Dashboard.jsx # Main dashboard component
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Tailwind CSS imports
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json             # Root package.json with concurrently
└── README.md
```

## API Endpoints

- `POST /api/login` - Login or create user by email
- `POST /api/subscribe` - Subscribe to a stock ticker
- `POST /api/unsubscribe` - Unsubscribe from a stock ticker

## Socket.io Events

- `stockUpdates` - Emitted every second with current prices for all supported stocks

## Notes

- Stock prices are randomly generated between $100-$1000 for demonstration purposes
- Each user's subscriptions are stored independently in MongoDB
- The application supports multiple concurrent users/tabs with independent subscriptions

