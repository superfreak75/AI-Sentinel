/*
 * Supabase Database Setup Instructies
 * ===================================
 * 
 * Volg deze stappen om je Supabase-database in te stellen voor de leaderboard functionaliteit:
 * 
 * 1. Maak een gratis account aan op https://supabase.com/
 * 
 * 2. Maak een nieuw project aan
 * 
 * 3. Zodra je project is aangemaakt, ga naar SQL Editor in het dashboard
 * 
 * 4. Maak een nieuwe query en voer de volgende SQL uit om de leaderboard tabel te maken:
 */

/*
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maak een index aan voor sneller sorteren op score
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);

-- Maak een Row Level Security (RLS) policy aan zodat alleen de server scores kan toevoegen
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Deze policy staat iedereen toe om scores te lezen
CREATE POLICY "Iedereen kan scores lezen" 
ON leaderboard FOR SELECT USING (true);

-- Deze policy staat iedereen toe om nieuwe scores toe te voegen
CREATE POLICY "Iedereen kan scores toevoegen" 
ON leaderboard FOR INSERT WITH CHECK (true);
*/

/*
 * 5. Configureer je Supabase in game.js:
 * 
 *    - Ga naar Project Settings > API 
 *    - Kopieer de "API URL" en "anon public" key
 *    - Vervang de placeholders in game.js met deze waarden:
 *
 *    const SUPABASE_URL = 'https://je-project-id.supabase.co';
 *    const SUPABASE_KEY = 'je-anon-key';
 * 
 * 6. Test de integratie
 *    - Speel het spel
 *    - Voer een e-mail in op het game over scherm
 *    - Controleer of je score wordt opgeslagen in de database
 * 
 * 7. Bekijk je data
 *    - Ga naar Table Editor in het Supabase dashboard
 *    - Selecteer de "leaderboard" tabel om je opgeslagen scores te zien
 */ 