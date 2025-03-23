# AI Sentinel: Neurale Ruimteverdediging

Een ruimteschietspel gemaakt met p5.js waarbij je speelt als een AI-defensiesysteem dat de aarde beschermt tegen vijandige AI-entiteiten.

## Configuratie

Om het spel lokaal te kunnen draaien met alle functionaliteit, moet je de volgende stappen volgen:

1. Clone deze repository
2. Maak een kopie van `config.template.js` en noem het `config.js`
3. Open `config.js` en vul je eigen Supabase URL en API-sleutel in
4. Open `index.html` in je browser om het spel te spelen

Het `config.js` bestand wordt niet in de repository bewaard om de veiligheid van je API-sleutels te garanderen.

## Supabase Database Setup

Volg deze stappen om je Supabase-database in te stellen voor de leaderboard functionaliteit:

1. Maak een gratis account aan op https://supabase.com/
2. Maak een nieuw project
3. Ga naar SQL Editor en voer het volgende script uit:

```sql
-- Maak een tabel voor de leaderboard
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_email VARCHAR NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maak een beleid om het toevoegen van scores toe te staan
CREATE POLICY "Allow anonymous score submissions" 
ON leaderboard FOR INSERT 
TO anon 
WITH CHECK (true);

-- Maak een beleid om het lezen van alle scores toe te staan
CREATE POLICY "Allow anonymous score reading" 
ON leaderboard FOR SELECT 
TO anon 
USING (true);

-- Schakel Row Level Security in
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
```

4. Ga naar Authentication > Settings en zet "Enable anonymous sign-in" aan

## Functies

- Terminal-achtige gebruikersinterface bij de start
- Verschillende soorten vijanden met verschillende gedragingen
- Powerups om je schip te versterken
- Leaderboard functionaliteit met Supabase
- Deelfunctionaliteit voor sociale media

## Credits

&copy; 2024 | Gebouwd met AI | #AIGaming #AIVsAI
