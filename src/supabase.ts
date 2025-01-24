import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types.';

const dotenv = require('dotenv');

dotenv.config();

const supabase = createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default supabase;
