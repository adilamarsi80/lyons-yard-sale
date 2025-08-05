'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Vendor {
  id?: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  registration_type: 'early-bird' | 'regular' | 'day-of';
  number_of_spaces: number;
  items_description?: string;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  stripe_payment_intent_id?: string;
  created_at?: string;
  updated_at?: string;
}