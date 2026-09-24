import type { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  // --- MOODS ---
  {
    id: 'calm',
    name: 'Calm',
    group: 'mood',
    iconName: 'Feather',
    description: 'Serene landscapes, still waters, and gentle horizons.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-sky-900/80 to-indigo-950/90'
  },
  {
    id: 'peaceful',
    name: 'Peaceful',
    group: 'mood',
    iconName: 'Sun',
    description: 'Soft lighting, tranquil mornings, and quiet natural sanctuaries.',
    coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-emerald-950/80 to-teal-950/90'
  },
  {
    id: 'cozy',
    name: 'Cozy',
    group: 'mood',
    iconName: 'Coffee',
    description: 'Warm hearths, rainy window views, and intimate wooden nooks.',
    coverUrl: 'https://images.unsplash.com/photo-1517840905240-472988babdf9?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-950/80 to-orange-950/90'
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    group: 'mood',
    iconName: 'Sparkles',
    description: 'Pastel skies, ethereal clouds, and soft twilight glow.',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-purple-950/80 to-pink-950/90'
  },
  {
    id: 'focus',
    name: 'Focus',
    group: 'mood',
    iconName: 'Compass',
    description: 'Minimal geometry, calming symmetry, and non-distracting balance.',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-slate-900/80 to-zinc-950/90'
  },
  {
    id: 'energizing',
    name: 'Energizing',
    group: 'mood',
    iconName: 'Zap',
    description: 'Vibrant golden hour sunbursts, dramatic peaks, and radiant seas.',
    coverUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-900/80 to-rose-950/90'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    group: 'mood',
    iconName: 'Film',
    description: 'Anamorphic vistas, moody atmospheres, and master photography.',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-cyan-950/80 to-blue-950/90'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    group: 'mood',
    iconName: 'Eye',
    description: 'Fog-shrouded firs, deep obsidian waters, and midnight silhouettes.',
    coverUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-gray-950/90 to-slate-950/90'
  },
  {
    id: 'luxurious',
    name: 'Luxurious',
    group: 'mood',
    iconName: 'Crown',
    description: 'High-end architectural sanctuaries, infinity pools, and penthouse horizons.',
    coverUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-stone-900/80 to-amber-950/90'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    group: 'mood',
    iconName: 'CircleDot',
    description: 'Pure aesthetic restraint, negative space, and tonal gradients.',
    coverUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-neutral-900/80 to-neutral-950/90'
  },
  {
    id: 'meditative',
    name: 'Meditative',
    group: 'mood',
    iconName: 'HeartHandshake',
    description: 'Zen gardens, rhythmic oceanic swells, and deep stillness.',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-teal-950/80 to-emerald-950/90'
  },
  {
    id: 'dark',
    name: 'Dark & Deep',
    group: 'mood',
    iconName: 'Moon',
    description: 'Deep cosmic voids, midnight rain streets, and moody dark tones.',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-slate-950/90 to-black'
  },

  // --- LOCATIONS ---
  {
    id: 'mountains',
    name: 'Mountains',
    group: 'location',
    iconName: 'Mountain',
    description: 'Alpine summits, jagged ridges, and panoramic valleys.',
    coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-sky-950/80 to-slate-950/90'
  },
  {
    id: 'beaches',
    name: 'Beaches & Coast',
    group: 'location',
    iconName: 'Waves',
    description: 'Crystal turquoise shores, rolling surf, and secluded coves.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-cyan-950/80 to-teal-950/90'
  },
  {
    id: 'forests',
    name: 'Forests & Woods',
    group: 'location',
    iconName: 'Trees',
    description: 'Emerald canopies, sun-dappled trails, and ancient giant redwoods.',
    coverUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-emerald-950/80 to-green-950/90'
  },
  {
    id: 'cities',
    name: 'Cities & Skylines',
    group: 'location',
    iconName: 'Building2',
    description: 'Metropolitan neon, luminous skyscrapers, and iconic skylines.',
    coverUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-indigo-950/80 to-purple-950/90'
  },
  {
    id: 'architecture',
    name: 'Architecture',
    group: 'location',
    iconName: 'Landmark',
    description: 'Modernist structures, brutalist lines, and timeless glass designs.',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-zinc-900/80 to-slate-950/90'
  },
  {
    id: 'cafes',
    name: 'Cafés & Interiors',
    group: 'location',
    iconName: 'Coffee',
    description: 'Warm espresso bars, book-lined libraries, and Scandinavian lofts.',
    coverUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-950/80 to-stone-950/90'
  },
  {
    id: 'desert',
    name: 'Deserts & Dunes',
    group: 'location',
    iconName: 'Compass',
    description: 'Golden undulating sands, carved canyons, and stark horizons.',
    coverUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-orange-950/80 to-amber-950/90'
  },
  {
    id: 'snow',
    name: 'Snow & Arctic',
    group: 'location',
    iconName: 'Snowflake',
    description: 'Glacial wilderness, snow-frosted pines, and frozen fjords.',
    coverUrl: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-sky-950/80 to-blue-950/90'
  },

  // --- TIME OF DAY ---
  {
    id: 'sunrise',
    name: 'Sunrise & Morning',
    group: 'time',
    iconName: 'Sunrise',
    description: 'First light breaking over misty valleys and calm waters.',
    coverUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-950/80 to-rose-950/90'
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    group: 'time',
    iconName: 'SunMedium',
    description: 'Rich amber sunlight bathing landscapes in warm cinematic glory.',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-900/80 to-orange-950/90'
  },
  {
    id: 'sunset',
    name: 'Sunset & Dusk',
    group: 'time',
    iconName: 'Sunset',
    description: 'Crimson, violet, and gold fading into twilight.',
    coverUrl: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-rose-950/80 to-purple-950/90'
  },
  {
    id: 'night',
    name: 'Night & Midnight',
    group: 'time',
    iconName: 'MoonStar',
    description: 'Starlit nocturnal realms, urban glow, and quiet darkness.',
    coverUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-blue-950/90 to-black'
  },
  {
    id: 'rainy-day',
    name: 'Rainy & Foggy',
    group: 'time',
    iconName: 'CloudRain',
    description: 'Gentle raindrops on glass, low clouds hanging over misty peaks.',
    coverUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-slate-900/80 to-cyan-950/90'
  },

  // --- WORLDS & THEMES ---
  {
    id: 'anime',
    name: 'Anime & Aesthetic',
    group: 'world',
    iconName: 'Tv',
    description: 'Makoto Shinkai skies, Studio Ghibli countryside, cozy lofi nooks, and sakura blossoms.',
    coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-fuchsia-950/80 via-purple-950/90 to-indigo-950/90'
  },
  {
    id: 'space',
    name: 'Space & Cosmos',
    group: 'world',
    iconName: 'Orbit',
    description: 'Galaxies, planetary rings, deep nebulae, and stellar constellations.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-indigo-950/90 to-purple-950/90'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk & Future',
    group: 'world',
    iconName: 'Cpu',
    description: 'Neon drenched rain streets, futuristic architecture, and synthwave vibes.',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-fuchsia-950/90 to-cyan-950/90'
  },
  {
    id: 'fantasy',
    name: 'Fantasy & Surreal',
    group: 'world',
    iconName: 'Sparkle',
    description: 'Ethereal floating realms, mythical forests, and dreamscapes.',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-violet-950/90 to-fuchsia-950/90'
  },
  {
    id: 'abstract',
    name: 'Abstract & Digital Art',
    group: 'world',
    iconName: 'Layers',
    description: 'Flowing chromatic fluid gradients, generative patterns, and 3D forms.',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-purple-950/80 to-blue-950/90'
  },
  {
    id: 'underwater',
    name: 'Underwater & Marine',
    group: 'world',
    iconName: 'Fish',
    description: 'Sunbeams penetrating the deep blue, coral reefs, and silent currents.',
    coverUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-cyan-950/90 to-blue-950/90'
  },

  // --- LIFESTYLE ---
  {
    id: 'workspace',
    name: 'Workspace & Studio',
    group: 'lifestyle',
    iconName: 'Laptop',
    description: 'Clean aesthetic desks, studio lighting, and serene work environments.',
    coverUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-stone-900/80 to-neutral-950/90'
  },
  {
    id: 'night-drive',
    name: 'Night Drive',
    group: 'lifestyle',
    iconName: 'Car',
    description: 'Illuminated highways, rainy windshield bokeh, and distant taillights.',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-rose-950/90 to-blue-950/90'
  },
  {
    id: 'travel',
    name: 'World Travel',
    group: 'lifestyle',
    iconName: 'Plane',
    description: 'Kyoto shrines, Parisian cobblestones, Amalfi cliffs, and Swiss valleys.',
    coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-sky-950/80 to-amber-950/90'
  },

  // --- NATURE ---
  {
    id: 'ocean',
    name: 'Ocean & Waves',
    group: 'nature',
    iconName: 'Waves',
    description: 'Deep sapphire swells, crashing sea spray, and endless tides.',
    coverUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-blue-950/90 to-cyan-950/90'
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    group: 'nature',
    iconName: 'Sparkles',
    description: 'Dancing emerald and violet northern lights shimmering across arctic skies.',
    coverUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-emerald-950/90 to-purple-950/90'
  },
  {
    id: 'clouds',
    name: 'Clouds & Sky',
    group: 'nature',
    iconName: 'Cloud',
    description: 'Billowing cumulus, high-altitude sunbeams, and dreamlike horizons.',
    coverUrl: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-sky-950/80 to-indigo-950/90'
  },

  // --- SMART MIXES ---
  {
    id: 'calm-mix',
    name: 'Calm Mix',
    group: 'mix',
    iconName: 'Sparkles',
    description: 'Mountains + Ocean + Forests + Clouds + Minimalist Interiors.',
    coverUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-teal-950/90 to-sky-950/90'
  },
  {
    id: 'cinematic-mix',
    name: 'Cinematic Mix',
    group: 'mix',
    iconName: 'Film',
    description: 'City Night + Luxury + Night Drives + Rain + Architecture + Golden Hour.',
    coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-cyan-950/90 to-blue-950/90'
  },
  {
    id: 'focus-mix',
    name: 'Focus Mix',
    group: 'mix',
    iconName: 'Compass',
    description: 'Minimal Architecture + Soft Nature + Calm Workspaces + Fluid Abstract.',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-slate-900/90 to-zinc-950/90'
  },
  {
    id: 'dream-mix',
    name: 'Dream Mix',
    group: 'mix',
    iconName: 'Moon',
    description: 'Deep Space + Aurora + Clouds + Fantasy Landscapes + Underwater.',
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-purple-950/90 to-indigo-950/90'
  },
  {
    id: 'travel-mix',
    name: 'Travel Mix',
    group: 'mix',
    iconName: 'Globe',
    description: 'Tokyo + Swiss Alps + Paris + Santorini + New York + Bali + Iceland.',
    coverUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    gradient: 'from-amber-950/90 to-sky-950/90'
  }
];
