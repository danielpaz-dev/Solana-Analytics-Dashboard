# Solana Real-Time Analytics Dashboard

A full-stack Web3 investment-style platform designed to track on-chain Solana wallets and display real-time transaction data and volume metrics through an interactive dashboard.

## Features
- **Real-Time Polling Engine**: Simulates live on-chain Solana transaction data streaming at high frequency.
- **Dynamic Charting**: Interactive area charts built with Recharts to visualize transaction spikes, flows, and volume metrics.
- **Multi-Wallet Radar**: Track multiple Solana wallet addresses simultaneously with a secure, automated data injection pipeline.
- **Secure Authentication**: JWT-based session architecture with encrypted credentials via bcrypt.

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Recharts, Axios.
- **Backend**: Node.js, Express, TypeScript, JWT, Bcrypt.
- **Database**: PostgreSQL.
- **Blockchain Interface**: @solana/web3.js.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL instance running locally or remotely

### Installation

1. **Clone the repository:**
```bash
   git clone git@github.com:danielpaz-dev/Solana-Analytics-Dashboard.git
   cd solana-analytics-dashboard

2. **Configure Environment Variables:**
    Go to the server directory, copy the example environment file, and update it with your local credentials:
    cd server
    cp .env.example .env

3. Install Dependencies:
    Install packages for both the backend and frontend:
    # From the root directory, install server dependencies
   cd server && npm install

   # Navigate to the client directory and install frontend dependencies
   cd ../client && npm install

4. Run the Application:
    # Start the backend server (from the server directory)
    npm run dev

    # Start the frontend development server (from the client directory)
    npm run dev

    License
    Distributed under the MIT License. See LICENSE for more information.