import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ilbgawqnzetwcitbwntq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_4-_OkDIZFKoudJltuwJJ5g_NMxT6VXa";

window.supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client initialized:", !!window.supabaseClient);
