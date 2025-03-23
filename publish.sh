#!/bin/bash

# Script om de game te publiceren op GitHub Pages
echo "AI Sentinel: Publicatiescript"
echo "=============================="

# Zorg ervoor dat we op de gh-pages branch zitten
git checkout gh-pages || { echo "Kon niet overschakelen naar gh-pages branch"; exit 1; }

# Kopieer het publieke configuratiebestand naar config.js voor de gepubliceerde versie
cp config.public.js config.js

# Voeg alle bestanden toe aan git
git add .

# Commit de wijzigingen
git commit -m "Update gepubliceerde versie met datum $(date +'%Y-%m-%d')"

# Push naar GitHub
git push origin gh-pages

echo ""
echo "✓ Publicatie voltooid!"
echo "Je game is nu beschikbaar op: https://superfreak75.github.io/AI-Sentinel/"
echo ""
echo "Let op: Deze versie heeft geen leaderboard functionaliteit om je Supabase sleutels te beschermen."
echo "De lokale versie met config.js (niet gepubliceerd) heeft wel alle functionaliteit."
