// Homepage categories for Home & Yard Calcs, in display order. `name` must
// match the "category" in each tool's meta.json. `icon` is a key in
// src/components/CategoryIcon.astro (inline SVG drawn in this repo).
export const CATEGORIES = [
  { name: 'Concrete and Masonry', icon: 'concrete', blurb: 'Slabs, footings, columns, and rebar.' },
  { name: 'Decks', icon: 'deck', blurb: 'Boards, joists, screws, and stairs.' },
  { name: 'Fences and Outdoor', icon: 'fence', blurb: 'Posts, rails, pickets, and post concrete.' },
  { name: 'Driveways and Paths', icon: 'driveway', blurb: 'Gravel and asphalt by the yard and ton.' },
  { name: 'Patios and Hardscaping', icon: 'patio', blurb: 'Pavers, base gravel, and bedding sand.' },
  { name: 'Garden Walls', icon: 'wall', blurb: 'Wall block, brick, and mortar.' },
  { name: 'Garden Beds and Lawn', icon: 'garden', blurb: 'Mulch for beds and sod for lawns.' },
  { name: 'Roofing', icon: 'roof', blurb: 'Pitch, slope, and shingle bundles.' },
  { name: 'Siding and Exterior', icon: 'siding', blurb: 'Siding squares for house walls.' },
  { name: 'Insulation and Energy', icon: 'insulation', blurb: 'Attic R-value and ventilation.' },
  { name: 'Interiors', icon: 'interiors', blurb: 'Paint, drywall, and flooring.' },
];

// Highest-intent tools among those built (Keyword & Intent Register).
export const POPULAR = [
  'concrete-calculator',
  'fence-calculator',
  'paint-calculator',
  'insulation-calculator',
  'roof-pitch-calculator',
  'mulch-calculator',
];

// Quick-pick chips: each filters the directory to some categories (JS), and
// links to the first category's card without JavaScript.
export const QUICK_PICKS = [
  { label: 'Concrete', categories: ['Concrete and Masonry'] },
  { label: 'Fence', categories: ['Fences and Outdoor'] },
  { label: 'Paint', categories: ['Interiors'] },
  { label: 'Deck', categories: ['Decks'] },
  { label: 'Roof', categories: ['Roofing', 'Siding and Exterior'] },
  { label: 'Yard', categories: ['Garden Beds and Lawn', 'Driveways and Paths', 'Patios and Hardscaping', 'Garden Walls'] },
];

export const categorySlug = (name) => `cat-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
