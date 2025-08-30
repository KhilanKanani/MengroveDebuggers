# Welcome to your Lovable project

## Project info

**URL**: https://mengrove-debuggers.vercel.app

Got it 👍 You want a tech stack recommendation for your Community Mangrove project (the one with maps, reports, points/coins, dashboards, etc.).
Here’s a solid modern, full-stack tech stack that balances free services, scalability, and developer productivity:

🌱 Frontend
* Framework: React + Vite (fast, modern dev setup)
* UI Styling: TailwindCSS (+ shadcn/ui for ready-made components like cards, modals, sidebar)
* Maps:
    * Leaflet.js (with React-Leaflet)
    * Tiles from OpenStreetMap (free)
    * State Management: Redux Toolkit or TanStack Query (to cache Supabase queries easily)
    * Notifications: Sonner (lightweight toast system)

🌿 Backend / Database
* Supabase (free tier)
* PostgreSQL DB for reports, profiles, gamification (points, verified reports, etc.)
* Authentication (email, Google, GitHub logins)
* Row-level security for user-specific data
* Realtime subscriptions (live updates when reports are added)
* Database logic: SQL triggers (like the one we wrote for points & verified reports)

🌍 Maps & Geospatial
* OpenStreetMap tiles (free alternative to Google Maps)
* Nominatim API (for reverse geocoding addresses ↔ lat/lng)
* Optional: Mapbox (free tier) if you want nicer styled maps & clustering

🛠️ APIs & Integrations
* Supabase Edge Functions (for custom server logic, e.g., sending emails when reports are verified)
* EmailJS or Resend (if you want notifications to users)
* Geocoding: Nominatim or OpenCage Data (free tier up to some limits)

🎨 Design / UX
* NextUI or shadcn/ui for polished components
* Framer Motion for smooth animations (badges, points increment animation, etc.)

📊 Gamification Layer
* Points & badges stored in profiles table
* Leaderboard UI → query sorted by points
* Triggers in DB update counts automatically when reports are created/verified