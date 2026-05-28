import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knrzvwptvhpfpvoobyas.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtucnp2d3B0dmhwZnB2b29ieWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4Mzg5MzgsImV4cCI6MjA5MjQxNDkzOH0.MaFfrv_pSrLcZlUt9A3O0LDgK8C_lE-8toimC4oDZzA';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);