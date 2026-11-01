import { collection, getDocs, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryItem, GoodsOrServiceType } from '../types';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'grocery-daily-needs',
    name: 'Grocery & Daily Needs',
    type: 'goods',
    icon: 'ShoppingCart',
    subcategories: ['Supermarket', 'General Store', 'Bakery', 'Vegetables & Fruits', 'Dairy & Milk'],
    aliases: ['grocery', 'ration', 'daily needs', 'mart', 'supermarket', 'fruits', 'sabzi', 'karyana', 'atta', 'ghee'],
    order: 1,
    isActive: true,
  },
  {
    id: 'fashion-clothing',
    name: 'Fashion & Clothing',
    type: 'goods',
    icon: 'Shirt',
    subcategories: ['Men Fashion', 'Women Wear', 'Boutique', 'Children Clothing', 'Fabrics & Shawls'],
    aliases: ['clothes', 'clothing', 'fashion', 'kapray', 'boutique', 'suits', 'lawn', 'kurta', 'shoes', 'footwear'],
    order: 2,
    isActive: true,
  },
  {
    id: 'electronics-mobiles',
    name: 'Electronics & Mobiles',
    type: 'goods',
    icon: 'Smartphone',
    subcategories: ['Mobile Phones', 'Accessories', 'Computers & Laptops', 'Home Appliances', 'Repairs'],
    aliases: ['mobile', 'phone', 'electronics', 'charger', 'laptop', 'tv', 'fridge', 'ac', 'repair'],
    order: 3,
    isActive: true,
  },
  {
    id: 'pharmacy-health',
    name: 'Pharmacy & Health',
    type: 'goods',
    icon: 'PlusCircle',
    subcategories: ['Medical Store', 'Homeopathy', 'Baby Care', 'Organic Herbs', 'Diagnostic Clinic'],
    aliases: ['medical', 'pharmacy', 'medicine', 'dawakhana', 'dawa', 'doctor', 'clinic', 'tablets'],
    order: 4,
    isActive: true,
  },
  {
    id: 'food-restaurants',
    name: 'Food & Restaurants',
    type: 'both',
    icon: 'UtensilsCrossed',
    subcategories: ['Fast Food', 'Traditional BBQ', 'Chai & Cafes', 'Sweets & Bakers', 'Family Dining'],
    aliases: ['food', 'restaurant', 'hotel', 'biryani', 'karahi', 'cafe', 'chai', 'pizza', 'burgers', 'kabab'],
    order: 5,
    isActive: true,
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    type: 'goods',
    icon: 'Home',
    subcategories: ['Furniture', 'Kitchenware', 'Curtains & Rugs', 'Hardware & Sanitary', 'Lighting'],
    aliases: ['home', 'furniture', 'decor', 'hardware', 'sofa', 'bed', 'kitchen', 'sanitary', 'lights'],
    order: 6,
    isActive: true,
  },
  {
    id: 'beauty-personal-care',
    name: 'Beauty & Personal Care',
    type: 'both',
    icon: 'Sparkles',
    subcategories: ['Cosmetics', 'Beauty Salon', "Men's Barber Shop", 'Fragrances & Attar', 'Skin Care'],
    aliases: ['beauty', 'cosmetics', 'makeup', 'salon', 'parlour', 'barber', 'haircut', 'attar', 'perfume'],
    order: 7,
    isActive: true,
  },
  {
    id: 'automotive-repairs',
    name: 'Automotive & Repairs',
    type: 'services',
    icon: 'Wrench',
    subcategories: ['Auto Mechanics', 'Tyre Shop', 'Car Wash & Detailing', 'Spare Parts', 'Oil Change'],
    aliases: ['car', 'bike', 'motorcycle', 'mechanic', 'tyre', 'puncture', 'parts', 'workshop', 'repair'],
    order: 8,
    isActive: true,
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    type: 'services',
    icon: 'Briefcase',
    subcategories: ['Accountants & Tax', 'Legal Advisors', 'Electricians & Plumbers', 'Printing & Graphics', 'IT Solutions'],
    aliases: ['service', 'electrician', 'plumber', 'lawyer', 'tax', 'printing', 'developer', 'ac technician'],
    order: 9,
    isActive: true,
  },
  {
    id: 'books-stationery',
    name: 'Books & Stationery',
    type: 'goods',
    icon: 'BookOpen',
    subcategories: ['Book Depot', 'School Stationery', 'Office Supplies', 'Photocopy & Print'],
    aliases: ['books', 'kitab', 'stationery', 'pens', 'notebooks', 'copy', 'school', 'photostat'],
    order: 10,
    isActive: true,
  },
  {
    id: 'sports-toys',
    name: 'Sports & Toys',
    type: 'goods',
    icon: 'Trophy',
    subcategories: ['Cricket Gear', 'Fitness & Gym', 'Kids Toys', 'Sports Uniforms'],
    aliases: ['sports', 'cricket', 'bat', 'ball', 'gym', 'fitness', 'toys', 'games', 'football'],
    order: 11,
    isActive: true,
  },
];

/**
 * Fuzzy search & category autocorrect:
 * Matches misspelled user input against known category names and aliases.
 */
export function matchCategoryOrAlias(queryText: string): CategoryItem | null {
  if (!queryText) return null;
  const q = queryText.toLowerCase().trim();

  for (const cat of DEFAULT_CATEGORIES) {
    if (cat.name.toLowerCase().includes(q) || q.includes(cat.name.toLowerCase())) {
      return cat;
    }
    for (const alias of cat.aliases) {
      if (q.includes(alias) || alias.includes(q)) {
        return cat;
      }
    }
    for (const sub of cat.subcategories) {
      if (q.includes(sub.toLowerCase()) || sub.toLowerCase().includes(q)) {
        return cat;
      }
    }
  }
  return null;
}

export async function fetchCategoriesFromDb(): Promise<CategoryItem[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as CategoryItem);
    }
  } catch (err) {
    console.warn('Using default categories fallback:', err);
  }
  return DEFAULT_CATEGORIES;
}

export async function seedCategoriesIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'categories'));
    if (snap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }
  } catch (err) {
    console.warn('Could not seed categories to Firestore:', err);
  }
}
