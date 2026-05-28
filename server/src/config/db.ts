// server/src/config/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno del archivo .env
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DBNAME,
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Verificar la conexión inicial con la base de datos
pool.on('connect', () => {
  console.log('[Database]: Connected to PostgreSQL successfully!');
});

pool.on('error', (err) => {
  console.error('[Database]: Unexpected error on idle client', err);
  process.exit(-1);
});

export const initDatabase = async () => {
  // Tabla de usuarios
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Billeteras bajo seguimiento
  const createTrackedWalletsTable = `
    CREATE TABLE IF NOT EXISTS tracked_wallets (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      wallet_address VARCHAR(44) NOT NULL,
      label VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, wallet_address)
    );
  `;

  // Historial de transacciones capturadas
  const createWalletTransactionsTable = `
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id SERIAL PRIMARY KEY,
      wallet_id INT REFERENCES tracked_wallets(id) ON DELETE CASCADE,
      signature VARCHAR(88) UNIQUE NOT NULL,
      slot BIGINT NOT NULL,
      amount NUMERIC NOT NULL,
      token_symbol VARCHAR(10) DEFAULT 'SOL',
      tx_type VARCHAR(20) NOT NULL,
      block_time TIMESTAMP NOT NULL
    );
  `;
  
  const client = await pool.connect();
  
  try {
    await client.query(createUsersTable);
    await client.query(createTrackedWalletsTable);
    await client.query(createWalletTransactionsTable);
    console.log('✅ [Database]: All tables (Users, Wallets, Transactions) initialized properly');
  } catch (err) {
    console.error('❌ [Database]: Error initializing tables', err);
  } finally {
    client.release();
  }
};


export const query = async (text: string, params?: any[]) => {
  return await pool.query(text, params);
};

export default pool;