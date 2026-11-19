import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryItem } from '../types';

const RAW_CATEGORIES: CategoryItem[] = [
  {
    id: 'agriculture-seeds',
    name: 'Agriculture, Seeds & Livestock',
    type: 'both',
    icon: 'Leaf',
    subcategories: ['Fertilizers & Seeds', 'Dairy Farms', 'Poultry & Feed', 'Agricultural Tools', 'Veterinary Care'],
    aliases: ['agriculture', 'seeds', 'khad', 'kheti', 'farming', 'poultry', 'livestock', 'dairy', 'vet'],
    order: 1,
    isActive: true,
  },
  {
    id: 'arts-handicrafts',
    name: 'Arts, Gifts & Handicrafts',
    type: 'goods',
    icon: 'Gift',
    subcategories: ['Gift Shops', 'Peshawari Chappal Crafts', 'Pottery & Ceramics', 'Frames & Calligraphy', 'Wedding Favors'],
    aliases: ['gift', 'art', 'handicraft', 'chappal', 'calligraphy', 'pottery', 'flowers', 'bouquet'],
    order: 2,
    isActive: true,
  },
  {
    id: 'automotive-repairs',
    name: 'Automotive & Repairs',
    type: 'both',
    icon: 'Wrench',
    subcategories: ['Auto Mechanics', 'Bike Spare Parts', 'Car Wash & Detailing', 'Tyre & Wheel Alignment', 'Auto Electronics & AC', 'Car Showroom'],
    aliases: ['car', 'bike', 'motorcycle', 'mechanic', 'tyre', 'puncture', 'parts', 'workshop', 'repair', 'auto'],
    order: 3,
    isActive: true,
  },
  {
    id: 'bakery-sweets',
    name: 'Bakery, Sweets & Confectionery',
    type: 'goods',
    icon: 'Cake',
    subcategories: ['Mithai & Sweets', 'Cakes & Pastries', 'Bread & Rusks', 'Dry Fruits & Nimko', 'Ice Cream Parlour'],
    aliases: ['bakery', 'sweets', 'mithai', 'cake', 'nimko', 'biscuits', 'bread', 'halwa', 'ice cream'],
    order: 4,
    isActive: true,
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    type: 'both',
    icon: 'Sparkles',
    subcategories: ['Cosmetics & Makeup', 'Beauty Salon & Parlour', "Men's Barber Shop", 'Fragrances & Attar', 'Skin Care'],
    aliases: ['beauty', 'cosmetics', 'makeup', 'salon', 'parlour', 'barber', 'haircut', 'attar', 'perfume'],
    order: 5,
    isActive: true,
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    type: 'goods',
    icon: 'BookOpen',
    subcategories: ['Book Depot', 'School & College Stationery', 'Office Supplies', 'Photocopy & Printing'],
    aliases: ['books', 'kitab', 'stationery', 'pens', 'notebooks', 'copy', 'school', 'photostat', 'printing'],
    order: 6,
    isActive: true,
  },
  {
    id: 'building-construction',
    name: 'Building Materials & Hardware',
    type: 'goods',
    icon: 'Hammer',
    subcategories: ['Cement & Steel', 'Sanitary & Tiles', 'Paint & Varnish', 'Electrical Cables', 'Tools & Hardware'],
    aliases: ['hardware', 'cement', 'tiles', 'sanitary', 'paint', 'steel', 'marble', 'construction', 'plumber'],
    order: 7,
    isActive: true,
  },
  {
    id: 'computers-it',
    name: 'Computers, IT & Software',
    type: 'both',
    icon: 'Laptop',
    subcategories: ['Laptops & PCs', 'CCTV & Networking', 'Printers & Toners', 'Software & Web Agencies', 'IT Repairs'],
    aliases: ['computer', 'laptop', 'pc', 'it', 'cctv', 'printer', 'camera', 'software', 'web', 'networking'],
    order: 8,
    isActive: true,
  },
  {
    id: 'education-coaching',
    name: 'Education, Academies & Tuition',
    type: 'services',
    icon: 'GraduationCap',
    subcategories: ['Schools & Colleges', 'Entry Test Academies', 'Computer Institutes', 'Quran & Hifz Academies', 'Language Centers'],
    aliases: ['school', 'academy', 'tuition', 'college', 'coaching', 'english', 'courses', 'training', 'teacher'],
    order: 9,
    isActive: true,
  },
  {
    id: 'electronics-mobiles',
    name: 'Electronics & Mobiles',
    type: 'both',
    icon: 'Smartphone',
    subcategories: ['Mobile Phones', 'Mobile Accessories & Chargers', 'Home Appliances', 'Mobile & TV Repairs', 'LEDs & Audio'],
    aliases: ['mobile', 'phone', 'electronics', 'charger', 'tv', 'fridge', 'ac', 'repair', 'iphone', 'samsung'],
    order: 10,
    isActive: true,
  },
  {
    id: 'fashion-clothing',
    name: 'Fashion & Clothing',
    type: 'goods',
    icon: 'Shirt',
    subcategories: ['Men Fashion & Shalwar Kameez', 'Women Wear & Lawn', 'Boutique & Bridal', 'Children Clothing', 'Footwear & Bags', 'Winter Shawls'],
    aliases: ['clothes', 'clothing', 'fashion', 'kapray', 'boutique', 'suits', 'lawn', 'kurta', 'shoes', 'footwear'],
    order: 11,
    isActive: true,
  },
  {
    id: 'food-restaurants',
    name: 'Food & Restaurants',
    type: 'both',
    icon: 'UtensilsCrossed',
    subcategories: ['Fast Food & Pizza', 'Traditional BBQ & Karahi', 'Chai & Cafes', 'Biryani & Pulao', 'Catering & Events', 'Family Dining'],
    aliases: ['food', 'restaurant', 'hotel', 'biryani', 'karahi', 'cafe', 'chai', 'pizza', 'burgers', 'kabab', 'tikka'],
    order: 12,
    isActive: true,
  },
  {
    id: 'furniture-interiors',
    name: 'Furniture & Interiors',
    type: 'both',
    icon: 'Sofa',
    subcategories: ['Wooden Furniture', 'Office Chairs & Desks', 'Mattresses & Bedding', 'Curtains & Blinds', 'Interior Design'],
    aliases: ['furniture', 'sofa', 'bed', 'chair', 'table', 'mattress', 'wood', 'carpenter', 'interior'],
    order: 13,
    isActive: true,
  },
  {
    id: 'grocery-daily-needs',
    name: 'Grocery & Daily Needs',
    type: 'goods',
    icon: 'ShoppingCart',
    subcategories: ['Supermarket', 'Karyana / General Store', 'Fresh Vegetables & Fruits', 'Dairy & Fresh Milk', 'Flour, Rice & Pulses', 'Meat & Poultry'],
    aliases: ['grocery', 'ration', 'daily needs', 'mart', 'supermarket', 'fruits', 'sabzi', 'karyana', 'atta', 'ghee', 'milk'],
    order: 14,
    isActive: true,
  },
  {
    id: 'health-clinics',
    name: 'Hospitals, Clinics & Labs',
    type: 'services',
    icon: 'Stethoscope',
    subcategories: ['Medical Clinics', 'Dental Care', 'Diagnostic Labs', 'Opticians & Eye Care', 'Physiotherapy'],
    aliases: ['doctor', 'clinic', 'hospital', 'dentist', 'lab', 'eye', 'optician', 'glasses', 'xray'],
    order: 15,
    isActive: true,
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    type: 'goods',
    icon: 'Home',
    subcategories: ['Kitchenware & Crockery', 'Carpets & Rugs', 'Plastic & Household', 'LED Lighting', 'Home Decor'],
    aliases: ['home', 'decor', 'crockery', 'kitchen', 'lights', 'carpet', 'rugs', 'utensils'],
    order: 16,
    isActive: true,
  },
  {
    id: 'home-maintenance',
    name: 'Home Maintenance & Repair',
    type: 'services',
    icon: 'Wrench',
    subcategories: ['AC & Fridge Technicians', 'Electricians', 'Plumbers', 'Painters & Masons', 'Pest Control & Cleaning'],
    aliases: ['electrician', 'plumber', 'ac repair', 'painter', 'cleaning', 'mistri', 'carpenter', 'welding'],
    order: 17,
    isActive: true,
  },
  {
    id: 'jewelry-watches',
    name: 'Jewelry, Gold & Watches',
    type: 'both',
    icon: 'Gem',
    subcategories: ['Gold & Silver Jewelry', 'Artificial & Bridal Sets', 'Wrist Watches & Repairs', 'Gems & Stones'],
    aliases: ['gold', 'jewelry', 'jewellers', 'watch', 'watches', 'rings', 'bangles', 'gems'],
    order: 18,
    isActive: true,
  },
  {
    id: 'mineral-water-beverages',
    name: 'Mineral Water & Beverages',
    type: 'goods',
    icon: 'Droplet',
    subcategories: ['Elegancia Mineral Water', '19L Dispenser Delivery', 'Bottled Water Cartons', 'Juices & Cold Drinks'],
    aliases: ['water', 'mineral water', 'elegancia', 'dispenser', 'bottle', 'drinks', 'juice', 'soda'],
    order: 19,
    isActive: true,
  },
  {
    id: 'pharmacy-health',
    name: 'Pharmacy & Health',
    type: 'goods',
    icon: 'PlusCircle',
    subcategories: ['Medical Store', 'Homeopathy & Herbal', 'Baby Care & Formula', 'Surgical & First Aid'],
    aliases: ['medical', 'pharmacy', 'medicine', 'dawakhana', 'dawa', 'tablets', 'chemist', 'surgical'],
    order: 20,
    isActive: true,
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    type: 'services',
    icon: 'Briefcase',
    subcategories: ['Accountants & Tax Consultants', 'Legal Advisors', 'Travel & Visa Agencies', 'Real Estate & Property', 'Photography & Studio'],
    aliases: ['service', 'lawyer', 'tax', 'property', 'real estate', 'travel', 'visa', 'studio', 'photographer'],
    order: 21,
    isActive: true,
  },
  {
    id: 'solar-energy',
    name: 'Solar Energy & UPS Systems',
    type: 'both',
    icon: 'Sun',
    subcategories: ['Solar Panels & Plates', 'Hybrid Inverters', 'Batteries & UPS', 'Solar Installation'],
    aliases: ['solar', 'inverter', 'ups', 'battery', 'batteries', 'panels', 'generator'],
    order: 22,
    isActive: true,
  },
  {
    id: 'sports-toys',
    name: 'Sports & Toys',
    type: 'goods',
    icon: 'Trophy',
    subcategories: ['Cricket Bats & Gear', 'Fitness & Gym Equipment', 'Kids Toys & Bicycles', 'Trophies & Jerseys'],
    aliases: ['sports', 'cricket', 'bat', 'ball', 'gym', 'fitness', 'toys', 'games', 'football', 'cycle'],
    order: 23,
    isActive: true,
  },
  {
    id: 'tailoring-boutiques',
    name: 'Tailoring & Boutiques',
    type: 'services',
    icon: 'Scissors',
    subcategories: ["Men's Tailoring", "Ladies Stitching & Embroidery", 'Alterations', 'Uniform Stitching'],
    aliases: ['tailor', 'darzi', 'stitching', 'silai', 'embroidery', 'boutique', 'alteration'],
    order: 24,
    isActive: true,
  },
  {
    id: 'wholesale-trading',
    name: 'Wholesale, Distributors & Mandi',
    type: 'goods',
    icon: 'Package',
    subcategories: ['FMCG Distribution', 'Grain & Spice Mandi', 'Packaging & Bags', 'Bulk Supply Depot'],
    aliases: ['wholesale', 'distributor', 'dealer', 'mandi', 'bulk', 'packaging', 'factory', 'godown'],
    order: 25,
    isActive: true,
  },
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [...RAW_CATEGORIES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

/**
 * Compute Levenshtein edit distance between two strings for spelling guard.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Common Pakistani merchant vocabulary for custom category spellcheck
const DICTIONARY_WORDS = [
  'accessories', 'agriculture', 'appliances', 'apparel', 'attar', 'auto', 'automotive', 'baby',
  'bags', 'bakery', 'barber', 'batteries', 'bazar', 'beauty', 'beverages', 'bikes', 'books',
  'boutique', 'bridal', 'building', 'butcher', 'cafe', 'cameras', 'carpets', 'catering',
  'cement', 'ceramic', 'chicken', 'children', 'clinic', 'clothing', 'coffee', 'computer',
  'construction', 'consultants', 'cosmetics', 'crafts', 'crockery', 'curtains', 'cycles',
  'dairy', 'decoration', 'dental', 'design', 'diagnostic', 'digital', 'distribution',
  'drinks', 'dry', 'education', 'electrical', 'electrician', 'electronics', 'embroidery',
  'energy', 'equipment', 'fabrics', 'fashion', 'fast', 'fertilizer', 'fitness', 'flowers',
  'food', 'footwear', 'fragrances', 'fresh', 'fruits', 'furniture', 'garments', 'general',
  'generator', 'gifts', 'glass', 'gold', 'goods', 'graphics', 'grill', 'grocery', 'gym',
  'handicrafts', 'hardware', 'health', 'herbal', 'home', 'hospital', 'hotel', 'household',
  'ice', 'industrial', 'interior', 'inverters', 'jewelry', 'juices', 'karyana', 'kids',
  'kitchen', 'kitchenware', 'laboratory', 'ladies', 'laptops', 'laundry', 'leather', 'legal',
  'lighting', 'livestock', 'machinery', 'maintenance', 'makeup', 'marble', 'market', 'mart',
  'materials', 'mattress', 'meat', 'mechanic', 'medical', 'medicines', 'mens', 'milk',
  'mineral', 'mobile', 'mobiles', 'motorcycles', 'motors', 'music', 'networking', 'nursery',
  'office', 'oil', 'optical', 'organic', 'packaging', 'paint', 'panels', 'parlour', 'parts',
  'pastries', 'perfumes', 'personal', 'pet', 'pharmacy', 'photo', 'photography', 'plastics',
  'plumbing', 'poultry', 'printing', 'produce', 'professional', 'property', 'real', 'estate',
  'repair', 'repairs', 'restaurant', 'restaurants', 'retail', 'rice', 'rugs', 'salon',
  'sanitary', 'school', 'security', 'seeds', 'service', 'services', 'shoes', 'shop',
  'shawls', 'silver', 'skincare', 'snacks', 'software', 'solar', 'spare', 'spices', 'sports',
  'stationery', 'steel', 'stitching', 'store', 'studio', 'supermarket', 'surgical', 'sweets',
  'tailor', 'tailoring', 'tea', 'textile', 'tiles', 'tools', 'toys', 'trading', 'transport',
  'travel', 'tuition', 'tyres', 'uniforms', 'utensils', 'vegetables', 'veterinary', 'video',
  'watches', 'water', 'wear', 'wedding', 'welding', 'wholesale', 'women', 'wood', 'workshop'
];

export interface SpellCheckResult {
  hasIssue: boolean;
  suggestedTitleCase: string;
  matchedExistingCategory: CategoryItem | null;
  typoCorrections: { original: string; suggestion: string }[];
}

export function checkCategorySpellingAndMatch(
  inputText: string,
  allCategories: CategoryItem[] = DEFAULT_CATEGORIES
): SpellCheckResult {
  const clean = inputText.trim().replace(/\s+/g, ' ');
  const matchedExistingCategory = matchCategoryOrAlias(clean, allCategories);

  const words = clean.split(' ').filter(Boolean);
  const typoCorrections: { original: string; suggestion: string }[] = [];

  const correctedWords = words.map((rawWord) => {
    const lower = rawWord.toLowerCase().replace(/[^a-z]/g, '');
    if (lower.length < 3 || DICTIONARY_WORDS.includes(lower)) {
      return rawWord.charAt(0).toUpperCase() + rawWord.slice(1);
    }

    let bestWord = '';
    let bestDist = Infinity;
    for (const dictWord of DICTIONARY_WORDS) {
      if (Math.abs(dictWord.length - lower.length) > 2) continue;
      const dist = levenshtein(lower, dictWord);
      if (dist < bestDist && dist <= (lower.length <= 5 ? 1 : 2)) {
        bestDist = dist;
        bestWord = dictWord;
      }
    }

    if (bestWord) {
      const cap = bestWord.charAt(0).toUpperCase() + bestWord.slice(1);
      typoCorrections.push({ original: rawWord, suggestion: cap });
      return cap;
    }
    return rawWord.charAt(0).toUpperCase() + rawWord.slice(1);
  });

  const suggestedTitleCase = correctedWords.join(' ');
  return {
    hasIssue: typoCorrections.length > 0 || !!matchedExistingCategory,
    suggestedTitleCase,
    matchedExistingCategory,
    typoCorrections,
  };
}

/**
 * Fuzzy search & category autocorrect:
 * Matches user input against known category names, aliases, subcategories, or close typos.
 */
export function matchCategoryOrAlias(
  queryText: string,
  categoriesPool: CategoryItem[] = DEFAULT_CATEGORIES
): CategoryItem | null {
  if (!queryText) return null;
  const q = queryText.toLowerCase().trim();
  if (q.length < 2) return null;

  for (const cat of categoriesPool) {
    if (cat.name.toLowerCase().includes(q) || q.includes(cat.name.toLowerCase())) {
      return cat;
    }
    for (const alias of cat.aliases || []) {
      if (q === alias || (q.length >= 3 && (q.includes(alias) || alias.includes(q)))) {
        return cat;
      }
    }
    for (const sub of cat.subcategories || []) {
      if (q.includes(sub.toLowerCase()) || (q.length >= 3 && sub.toLowerCase().includes(q))) {
        return cat;
      }
    }
    // Check edit distance on each word inside category name
    const nameWords = cat.name.toLowerCase().split(/[\s,&/]+/);
    for (const nw of nameWords) {
      if (nw.length >= 4 && levenshtein(q, nw) <= 2) {
        return cat;
      }
    }
  }
  return null;
}

export async function fetchCategoriesFromDb(): Promise<CategoryItem[]> {
  try {
    const fetchPromise = (async () => {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        const dbCats = snap.docs.map((d) => d.data() as CategoryItem);
        const byName = new Map<string, CategoryItem>();
        for (const c of DEFAULT_CATEGORIES) {
          byName.set(c.name.toLowerCase(), c);
        }
        for (const c of dbCats) {
          if (c?.name && c.isActive !== false) {
            byName.set(c.name.toLowerCase(), c);
          }
        }
        return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
      }
      return DEFAULT_CATEGORIES;
    })();
    const timeoutPromise = new Promise<CategoryItem[]>((resolve) =>
      setTimeout(() => resolve(DEFAULT_CATEGORIES), 4000)
    );
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Using default categories fallback:', err);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCustomCategoryToDb(cat: CategoryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'categories', cat.id), cat);
  } catch (err) {
    console.warn('Could not save custom category to Firestore:', err);
  }
}

export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const fetchPromise = getDocs(collection(db, 'categories'));
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject('timeout'), 4000));
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap && snap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat).catch(() => {});
      }
    }
  } catch {
    // Graceful silent fallback if offline or backend is delayed
  }
}
