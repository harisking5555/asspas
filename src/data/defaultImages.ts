// Verified public external photography URLs (Unsplash CDN, HTTP 200 verified)
// Used across storefronts, category defaults, and hero banners without local generated images.

export const DEFAULT_HERO_MARKET_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80';

export const DEFAULT_ELEGANCIA_WATER_IMAGE =
  'https://images.unsplash.com/photo-1595994195534-d5219f02f99f?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_GROCERY_STORE_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_FASHION_STORE_IMAGE =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_SPORTS_STORE_IMAGE =
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_ELECTRONICS_STORE_IMAGE =
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_PHARMACY_STORE_IMAGE =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_FOOD_STORE_IMAGE =
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_BOOKS_STORE_IMAGE =
  'https://images.unsplash.com/photo-1576479854195-52883a461a68?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_HOME_STORE_IMAGE =
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80';

export const DEFAULT_BEAUTY_STORE_IMAGE =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80';

export function getCategoryDefaultImage(category?: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('water') || c.includes('elegancia') || c.includes('beverage')) {
    return DEFAULT_ELEGANCIA_WATER_IMAGE;
  }
  if (c.includes('fashion') || c.includes('cloth') || c.includes('tailor') || c.includes('boutique')) {
    return DEFAULT_FASHION_STORE_IMAGE;
  }
  if (c.includes('sport') || c.includes('fitness') || c.includes('toy')) {
    return DEFAULT_SPORTS_STORE_IMAGE;
  }
  if (c.includes('electronic') || c.includes('mobile') || c.includes('computer') || c.includes('solar')) {
    return DEFAULT_ELECTRONICS_STORE_IMAGE;
  }
  if (c.includes('pharmacy') || c.includes('health') || c.includes('hospital') || c.includes('clinic')) {
    return DEFAULT_PHARMACY_STORE_IMAGE;
  }
  if (c.includes('food') || c.includes('restaurant') || c.includes('bakery') || c.includes('cafe')) {
    return DEFAULT_FOOD_STORE_IMAGE;
  }
  if (c.includes('book') || c.includes('stationery') || c.includes('education')) {
    return DEFAULT_BOOKS_STORE_IMAGE;
  }
  if (c.includes('home') || c.includes('furniture') || c.includes('decor') || c.includes('building')) {
    return DEFAULT_HOME_STORE_IMAGE;
  }
  if (c.includes('beauty') || c.includes('cosmetic') || c.includes('jewelry') || c.includes('gift')) {
    return DEFAULT_BEAUTY_STORE_IMAGE;
  }
  if (c.includes('market') || c.includes('bazaar') || c.includes('hero')) {
    return DEFAULT_HERO_MARKET_IMAGE;
  }
  return DEFAULT_GROCERY_STORE_IMAGE;
}

/**
 * Transparently resolves empty strings or any legacy local `/images/...` generated asset paths
 * (including older records stored in Firestore) into reliable public CDN image URLs.
 */
export function resolveExternalImageUrl(rawUrl?: string | null, category?: string): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return getCategoryDefaultImage(category);
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('/images/') ||
    lower.startsWith('images/') ||
    lower.includes('src/assets/images/')
  ) {
    if (lower.includes('elegancia') || lower.includes('water')) {
      return DEFAULT_ELEGANCIA_WATER_IMAGE;
    }
    if (lower.includes('hero') || lower.includes('street')) {
      return category ? getCategoryDefaultImage(category) : DEFAULT_HERO_MARKET_IMAGE;
    }
    if (lower.includes('kamran') || lower.includes('sport')) {
      return DEFAULT_SPORTS_STORE_IMAGE;
    }
    if (lower.includes('outfitters') || lower.includes('cloth')) {
      return category ? getCategoryDefaultImage(category) : DEFAULT_FASHION_STORE_IMAGE;
    }
    return getCategoryDefaultImage(category);
  }

  return trimmed;
}
