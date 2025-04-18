import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

// For client components only
export const createClient = () => {
  return createClientComponentClient<Database>();
};