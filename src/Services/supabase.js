import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://dncqfwbhphbhudkwerlt.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuY3Fmd2JocGhiaHVka3dlcmx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNjA2MjksImV4cCI6MjA0ODgzNjYyOX0.xNniMABD0cdjYk6cRU_KvT0zaIrpnCMX9AJ7L2jA9BY";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || DEFAULT_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
