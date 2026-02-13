import { createClient } from '@supabase/supabase-js';

// Nota: dejé los valores tal cual los pasaste.
const supabaseUrl = 'https://movapi.solargentinotv.com.ar';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrc2dhcWdha3p3dnFjdGVra2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5NTAwMzIsImV4cCI6MjA4NjUyNjAzMn0.dnJMB_Orqu_ldP7ODcs-VpZduaGPUEbe2u-yYJXk9Fc';

export const supabase = createClient(supabaseUrl, supabaseKey);
