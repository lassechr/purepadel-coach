#!/bin/bash
# Deploy til GitHub Pages (coach.purepadel.dk)
# Brug: ./deploy.sh "beskrivelse af ændring"

MSG=${1:-"Opdatering"}

git add -A
git commit -m "$MSG" 2>/dev/null || echo "Ingen nye ændringer at committe"
git push origin main

echo ""
echo "✓ Udgivet på coach.purepadel.dk"
