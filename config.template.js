// Dit is een template bestand. 
// Kopieer dit naar config.js en vul je eigen Supabase gegevens in.
// Het config.js bestand wordt niet naar GitHub gepusht door de .gitignore instelling.

const config = {
  supabase: {
    url: 'VOER_HIER_JE_SUPABASE_URL_IN',
    key: 'VOER_HIER_JE_SUPABASE_KEY_IN'
  }
};

// Maak de configuratie beschikbaar in het window object
window.appConfig = config;
