// Publieke versie van de configuratie zonder gevoelige gegevens
// Dit bestand kan veilig worden geüpload naar GitHub of andere publieke repositories
// De leaderboard functionaliteit zal uitgeschakeld zijn, maar de rest van de game werkt

const config = {
  supabase: {
    url: '',  // Lege URL - leaderboard functionaliteit wordt uitgeschakeld
    key: ''   // Lege key - leaderboard functionaliteit wordt uitgeschakeld
  },
  version: 'public',
  publishDate: new Date().toISOString().split('T')[0] // Huidige datum in YYYY-MM-DD formaat
};

// Maak de configuratie beschikbaar in het window object
window.appConfig = config;
