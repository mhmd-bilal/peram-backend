import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.SUPABASE_HOST,
  port: parseInt(process.env.SUPABASE_PORT),
  database: process.env.SUPABASE_DATABASE,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  ssl: { rejectUnauthorized: false }, // Required for secure connection
});

export default pool;
