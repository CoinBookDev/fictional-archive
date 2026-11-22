const SUPABASE_URL = "https://ilbgawqnzetwcitbwntq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_4-_OkDIZFKoudJltuwJJ5g_NMxT6VXa";

if (!window.supabase) {
    console.error("ERROR: Supabase library did not load.");
} else {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log("SUCCESS: Supabase client initialized.");
}
