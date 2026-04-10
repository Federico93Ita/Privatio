#!/bin/bash
# Deploy Privatio UX Redesign
cd "$(dirname "$0")"

echo "🚀 Deploy Privatio - Redesign UX Navy & Oro"
echo ""

# Rimuovi lock file se presente
rm -f .git/index.lock 2>/dev/null

# Stage solo i file del redesign
git add \
  src/app/globals.css \
  src/app/layout.tsx \
  src/app/page.tsx \
  src/components/layout/Footer.tsx \
  src/components/layout/Header.tsx \
  src/components/property/PropertyCard.tsx \
  src/components/home/AgencyCTA.tsx \
  src/components/home/HeroSection.tsx \
  src/components/home/HowItWorks.tsx \
  src/components/home/LeadSection.tsx \
  src/components/home/TestimonialsSection.tsx \
  src/components/home/WhyPrivatio.tsx \
  src/components/ui/AnimatedCounter.tsx \
  src/components/ui/ScrollReveal.tsx

echo "✅ File staged"

# Commit
git commit -m "Redesign UX: palette Navy & Oro, hero animata, scroll reveal, copy persuasivo

- Nuova palette Navy & Oro con sfondi crema caldi
- Font serif DM Serif Display per titoli
- Hero section su sfondo navy con contatori animati e trust bar
- Header trasparente sulla homepage
- Footer navy scuro coordinato
- ScrollReveal e AnimatedCounter con Framer Motion
- PropertyCard con hover arricchiti e badge Nuovo
- Copy aggiornato: benefit-driven e orientato al risparmio"

echo "✅ Commit creato"

# Push
echo "📤 Push in corso..."
git push origin main

echo ""
echo "✅ Deploy avviato! Vercel farà il build automaticamente."
echo "   Controlla su: https://privatio.it"
echo ""
read -p "Premi Invio per chiudere..."
