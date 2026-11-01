export type ShopCategory =
  | 'All Categories'
  | 'Grocery & Daily Needs'
  | 'Fashion & Clothing'
  | 'Electronics & Mobiles'
  | 'Home & Living'
  | 'Pharmacy & Health'
  | 'Books & Stationery'
  | 'Beauty & Personal Care'
  | 'Sports & Toys'
  | 'Food & Restaurants'
  | 'Automotive & Repairs'
  | 'Professional Services'
  | 'Tailoring & Boutiques'
  | 'Home Maintenance & Repair';

export type ShopType = 'All Shops' | 'Retail Store' | 'Wholesale' | 'Restaurant / Cafe' | 'Service Provider';

export type GoodsOrServiceType = 'goods' | 'services' | 'both';

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  unit?: string;
  inStock: boolean;
  category?: string;
}

export interface UnlockedBadge {
  id: string;
  label: string;
  icon: string;
  minFollowers: number;
  unlockedAt?: string;
}

export interface Shop {
  id: string;
  name: string;
  category: Exclude<ShopCategory, 'All Categories'> | string;
  subCategory?: string;
  itemType?: GoodsOrServiceType; // Goods vs Services requirement
  shopType: Exclude<ShopType, 'All Shops'>;
  rating: number;
  reviewsCount: number;
  distance: number; // in km
  address: string;
  area: string;
  city: string;
  province?: string;
  isOpen: boolean;
  openingHours: string;
  phone: string;
  whatsapp: string;
  email: string;
  phones?: string[]; // 3 phone number options
  orderPhoneIndex?: number; // index of chosen order phone (0, 1, or 2)
  hasEleganciaWater: boolean;
  eleganciaDetails?: {
    inStock: boolean;
    types: string[]; // e.g., '500ml Bottled', '1.5L Family Pack', '19L Dispenser Cans'
    isChilled: boolean;
    bottlePrice?: string;
    canPrice?: string;
    note?: string;
  };
  catalog?: CatalogItem[];
  tags: string[];
  image: string;
  imageUrl?: string;
  images?: string[];
  orderPhone?: string;
  businessNature?: string;
  coords: {
    lat: number;
    lng: number;
    mapX: number; // 0 to 100 percentage for interactive map
    mapY: number; // 0 to 100 percentage for interactive map
  };
  verified: boolean;
  featured?: boolean;
  status?: 'approved' | 'pending' | 'suspended';
  ownerId?: string;
  ownerName: string;
  description: string;
  followersCount?: number;
  unlockedBadges?: string[];
  reviews?: {
    id: string;
    userName: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  createdAt?: string;
}

export interface PointTransaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  eventType?: 'referral_signup' | 'referred_first_shop' | 'shop_created' | 'admin_adjustment' | 'redemption';
  referenceId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phone: string;
  role: 'user' | 'admin';
  points: number;
  referralCode: string;
  referredBy?: string | null;
  hasReferralPrivileges: boolean;
  matrixParentId?: string | null;
  matrixLevel?: number;
  starLevel?: number; // 1 to 10 Star Matrix system
  referredCount: number;
  isLoggedIn: boolean;
  favorites: string[];
  shopsCount?: number;
  transactions?: PointTransaction[];
  createdAt?: string;
}

export interface ReferralNode {
  id: string;
  userId: string;
  name: string;
  referralCode: string;
  level: number;
  matrixSlot: number; // 1, 2, or 3
  starLevel?: number;
  parentId?: string | null;
  children: ReferralNode[];
  joinedDate: string;
  shopsCreated: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: GoodsOrServiceType;
  icon: string;
  subcategories: string[];
  aliases: string[]; // for fuzzy typo matching
  order: number;
  isActive: boolean;
}

export interface FollowerThreshold {
  count: number;
  badge: string;
  description: string;
  perk: string;
}

export interface PlatformAd {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  targetCity?: string; // e.g. "Peshawar" or "All"
  targetArea?: string;
  linkedShopId?: string;
  whatsappContact?: string;
  whatsappNumber?: string;
  isActive: boolean;
  order?: number;
}

export interface AdminSettings {
  followerThresholds: FollowerThreshold[];
  registrationRewardPoints: number;
  firstShopRewardPoints: number;
  maxDirectReferrals: number;
  maintenanceMode: boolean;
  // Admin controls for shopkeeper post limits & images
  maxShopImagesAllowed?: number; // e.g. 5, 10, or 50
  shopkeeperCanPost?: boolean;
  dailyPostLimit?: number; // 1, 2, 5 etc
  featuredBrandName?: string; // Default 'Elegancia Mineral Water'
  featuredBrandActive?: boolean;
  adsGallery?: PlatformAd[];
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export type MainNavTab = 'home' | 'shops' | 'categories' | 'elegancia' | 'rewards' | 'favorites' | 'admin' | 'my-shops';
