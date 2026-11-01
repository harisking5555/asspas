import { Shop } from '../types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'imtiaz-super-market',
    name: 'Imtiaz Super Market',
    category: 'Grocery & Daily Needs',
    shopType: 'Retail Store',
    rating: 4.5,
    reviewsCount: 1240,
    distance: 0.4,
    address: 'Near Mall Road, Cantt / Saddar, Peshawar',
    area: 'Saddar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '08:30 AM - 11:30 PM',
    phone: '091-5278901',
    whatsapp: '923085599766',
    email: 'info@imtiazpeshawar.pk',
    hasEleganciaWater: true,
    eleganciaDetails: {
      inStock: true,
      types: ['500ml Bottled', '1.5L Family Pack', '19L Dispenser Cans'],
      isChilled: true,
      note: 'Fresh daily stock of original Elegancia Mineral Water in cold beverage chillers.'
    },
    tags: ['Wide Range', 'Fresh Produce', 'Home Delivery'],
    image: '/src/assets/images/store_imtiaz_grocery_1793110437258.jpg',
    coords: {
      lat: 34.008,
      lng: 71.535,
      mapX: 48,
      mapY: 62
    },
    verified: true,
    ownerName: 'Haji Imtiaz Ahmed',
    description: 'Peshawar’s premier grocery super store offering premium fresh produce, household goods, bakery items, and cold mineral waters with express neighborhood delivery.',
    reviews: [
      {
        id: 'r1',
        userName: 'Hamza Khan',
        rating: 5,
        date: '2 days ago',
        comment: 'Great store with everything in stock. Always pick up cold Elegancia water bottles from here!'
      },
      {
        id: 'r2',
        userName: 'Zainab Bibi',
        rating: 4,
        date: '1 week ago',
        comment: 'Very clean supermarket, staff is polite and checkout lines move fast.'
      }
    ]
  },
  {
    id: 'outfitters-peshawar',
    name: 'Outfitters',
    category: 'Fashion & Clothing',
    shopType: 'Retail Store',
    rating: 4.2,
    reviewsCount: 856,
    distance: 0.8,
    address: 'University Road, Opposite Town Hall, Peshawar',
    area: 'University Town',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '11:00 AM - 10:30 PM',
    phone: '091-5843210',
    whatsapp: '923085599766',
    email: 'care@outfitters.com.pk',
    hasEleganciaWater: false,
    tags: ['Latest Trends', 'Men / Women', 'In-Store Pickup'],
    image: '/src/assets/images/store_outfitters_clothing_1793110436996.jpg',
    coords: {
      lat: 34.015,
      lng: 71.51,
      mapX: 74,
      mapY: 34
    },
    verified: true,
    ownerName: 'Fahad Mehmood',
    description: 'Modern youth streetwear and premium casual apparel for men, women, and juniors with contemporary seasonal collections.',
    reviews: [
      {
        id: 'r3',
        userName: 'Bilal Afridi',
        rating: 4,
        date: '3 days ago',
        comment: 'Top quality denim and winter jackets. Nice shopping ambiance.'
      }
    ]
  },
  {
    id: 'samsung-mobile-store',
    name: 'Samsung Mobile Store',
    category: 'Electronics & Mobiles',
    shopType: 'Retail Store',
    rating: 4.6,
    reviewsCount: 1420,
    distance: 1.1,
    address: 'Shop # 14-16, Deans Trade Center, Saddar, Peshawar',
    area: 'Saddar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '10:00 AM - 09:30 PM',
    phone: '091-5271144',
    whatsapp: '923085599766',
    email: 'samsung.deans@gmail.com',
    hasEleganciaWater: false,
    tags: ['Mobiles', 'Accessories', 'Warranty Support'],
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 34.004,
      lng: 71.54,
      mapX: 42,
      mapY: 71
    },
    verified: true,
    ownerName: 'Muhammad Salman',
    description: 'Official authorized Samsung dealership providing genuine smartphones, Galaxy smart watches, genuine chargers, and official PTA approved warranty devices.',
    reviews: [
      {
        id: 'r4',
        userName: 'Usman Ali',
        rating: 5,
        date: '4 days ago',
        comment: 'Got my new phone with official warranty and free screen protector.'
      }
    ]
  },
  {
    id: 'medplus-pharmacy',
    name: 'MedPlus Pharmacy & Health',
    category: 'Pharmacy & Health',
    shopType: 'Retail Store',
    rating: 4.3,
    reviewsCount: 620,
    distance: 1.5,
    address: 'Main Boulevard, Phase 2, Hayatabad, Peshawar',
    area: 'Hayatabad',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '24 Hours Open',
    phone: '091-5829911',
    whatsapp: '923085599766',
    email: 'medplus.hayatabad@gmail.com',
    hasEleganciaWater: true,
    eleganciaDetails: {
      inStock: true,
      types: ['500ml Bottled', '1.5L Family Pack'],
      isChilled: true,
      note: 'Certified hygienic mineral water available 24/7 along with medical grade supplies.'
    },
    tags: ['Medicines', 'Health Care', 'Home Delivery'],
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 33.992,
      lng: 71.45,
      mapX: 18,
      mapY: 48
    },
    verified: true,
    ownerName: 'Dr. Arshad Durrani',
    description: '24/7 fully licensed pharmacy stocking temperature-controlled medicines, wellness supplements, infant care, and pure Elegancia Mineral Water.',
    reviews: [
      {
        id: 'r5',
        userName: 'Ayesha Jan',
        rating: 5,
        date: '5 days ago',
        comment: 'Always reliable in emergency, 24/7 open and home delivery within 20 mins.'
      }
    ]
  },
  {
    id: 'the-food-street',
    name: 'The Food Street & Grill',
    category: 'Food & Restaurants',
    shopType: 'Restaurant / Cafe',
    rating: 4.4,
    reviewsCount: 982,
    distance: 1.8,
    address: 'Namak Mandi Heritage Food Street, Peshawar',
    area: 'Qissa Khwani Bazar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '12:00 PM - 01:00 AM',
    phone: '091-5264300',
    whatsapp: '923085599766',
    email: 'namakmandi.street@gmail.com',
    hasEleganciaWater: true,
    eleganciaDetails: {
      inStock: true,
      types: ['500ml Bottled', '1.5L Family Pack'],
      isChilled: true,
      note: 'Served with authentic Shinwari Karahi, Dum Pukht, and BBQ platters.'
    },
    tags: ['Dine In', 'Takeaway', 'Fast Food'],
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 34.012,
      lng: 71.57,
      mapX: 68,
      mapY: 58
    },
    verified: true,
    ownerName: 'Malik Jahangir Shinwari',
    description: 'Famous authentic Shinwari mutton karahi, chapli kebabs, and barbecue dishes served in traditional seating with chilled pure water.',
    reviews: [
      {
        id: 'r6',
        userName: 'Shahid Shinwari',
        rating: 5,
        date: 'Yesterday',
        comment: 'Best mutton karahi in Peshawar, unmatched taste!'
      }
    ]
  },
  {
    id: 'bahria-book-shop',
    name: 'Bahria Book Shop & Stationery',
    category: 'Books & Stationery',
    shopType: 'Retail Store',
    rating: 4.1,
    reviewsCount: 410,
    distance: 2.3,
    address: 'Arbab Road, Saddar Commercial Area, Peshawar',
    area: 'Saddar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '09:00 AM - 09:00 PM',
    phone: '091-5272900',
    whatsapp: '923085599766',
    email: 'bahria.books@gmail.com',
    hasEleganciaWater: false,
    tags: ['Books', 'Stationery', 'Gifts'],
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 34.002,
      lng: 71.53,
      mapX: 38,
      mapY: 76
    },
    verified: true,
    ownerName: 'Tariq Mehmood',
    description: 'Academic textbooks, competitive exams preparation guides, art supplies, luxury notebooks, and professional office stationery.',
    reviews: [
      {
        id: 'r7',
        userName: 'Noman Shah',
        rating: 4,
        date: '2 weeks ago',
        comment: 'All university engineering and medical textbooks available easily.'
      }
    ]
  },
  {
    id: 'kamran-sports-shop',
    name: 'Kamran Sports Shop',
    category: 'Sports & Toys',
    shopType: 'Retail Store',
    rating: 4.7,
    reviewsCount: 740,
    distance: 1.0,
    address: 'University Road, Near Board Bazar, Peshawar',
    area: 'University Town',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '10:00 AM - 10:00 PM',
    phone: '091-5847722',
    whatsapp: '923085599766',
    email: 'kamransports.psh@gmail.com',
    hasEleganciaWater: true,
    eleganciaDetails: {
      inStock: true,
      types: ['500ml Bottled', '1.5L Family Pack'],
      isChilled: true,
      note: 'Keeps athletes hydrated! Chilled Elegancia mineral water available at the checkout counter.'
    },
    tags: ['Cricket Bats', 'Sports Wear', 'Fitness Gear'],
    image: '/src/assets/images/store_kamran_sports_1793110437618.jpg',
    coords: {
      lat: 34.018,
      lng: 71.49,
      mapX: 62,
      mapY: 28
    },
    verified: true,
    ownerName: 'Kamran Khan (Sports Specialist)',
    description: 'Specialist sports shop mentioned by our Peshawar founders! English & Kashmir willow cricket bats, genuine footballs, gym accessories, badminton racquets, and workout clothing.',
    reviews: [
      {
        id: 'r8',
        userName: 'Rizwan Sports Enthusiast',
        rating: 5,
        date: '1 day ago',
        comment: 'Kamran bhai personally checked the bat balance for me. Top notch sports dealer in Peshawar!'
      }
    ]
  },
  {
    id: 'salman-sports-trophies',
    name: 'Salman Sports & Trophies',
    category: 'Sports & Toys',
    shopType: 'Retail Store',
    rating: 4.5,
    reviewsCount: 380,
    distance: 0.5,
    address: 'Sector F-4, Phase 6, Hayatabad, Peshawar',
    area: 'Hayatabad',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '10:30 AM - 09:30 PM',
    phone: '091-5824599',
    whatsapp: '923085599766',
    email: 'salmansports.hayatabad@gmail.com',
    hasEleganciaWater: false,
    tags: ['Trophies', 'Badminton', 'Custom Jerseys'],
    image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 33.985,
      lng: 71.44,
      mapX: 25,
      mapY: 38
    },
    verified: true,
    ownerName: 'Salman Khattak',
    description: 'Tournament trophies, school sports kits, customized team jerseys, cricket accessories, and tennis equipment within Hayatabad.',
    reviews: [
      {
        id: 'r9',
        userName: 'Asif Marwat',
        rating: 4,
        date: '3 days ago',
        comment: 'Quick service for custom printed t-shirts and tournament medals.'
      }
    ]
  },
  {
    id: 'elegancia-central-hub',
    name: 'Elegancia Water Central Hub & Distribution',
    category: 'Grocery & Daily Needs',
    shopType: 'Wholesale',
    rating: 4.9,
    reviewsCount: 1540,
    distance: 0.6,
    address: 'Industrial Estate, Hayatabad, Peshawar',
    area: 'Hayatabad',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '08:00 AM - 08:00 PM',
    phone: '0308-5599766',
    whatsapp: '923085599766',
    email: 'distribution@eleganciawater.pk',
    hasEleganciaWater: true,
    eleganciaDetails: {
      inStock: true,
      types: ['500ml Bottled (Carton 24x)', '1.5L Family Pack (Carton 12x)', '19L Dispenser Cans'],
      isChilled: true,
      note: 'Official primary dispatch hub. Wholesale distributor pricing and free bulk home/office doorstep delivery in Peshawar.'
    },
    tags: ['Elegancia HQ', 'Bulk Wholesale', 'Home & Office Delivery'],
    image: '/src/assets/images/product_elegancia_water_1793110437317.jpg',
    coords: {
      lat: 33.98,
      lng: 71.43,
      mapX: 22,
      mapY: 55
    },
    verified: true,
    ownerName: 'Elegancia Water Founders (formerly Purifine)',
    description: 'Official flagship distribution point for Elegancia Mineral Water (Peshawar). Naturally balanced minerals, strict UV-ozone purification, and daily dispenser refills for homes, clinics, and shops.',
    reviews: [
      {
        id: 'r10',
        userName: 'Engr. Junaid Khan',
        rating: 5,
        date: 'Today',
        comment: 'Elegancia water tastes exceptionally clean and crisp. We have set up 19L weekly cans for our entire office.'
      }
    ]
  },
  {
    id: 'royal-decor-home',
    name: 'Royal Decor & Living',
    category: 'Home & Living',
    shopType: 'Retail Store',
    rating: 4.3,
    reviewsCount: 290,
    distance: 1.9,
    address: 'Khyber Super Market, Bara Road, Peshawar',
    area: 'Saddar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '10:00 AM - 09:00 PM',
    phone: '091-5283311',
    whatsapp: '923085599766',
    email: 'royaldecor.psh@gmail.com',
    hasEleganciaWater: false,
    tags: ['Curtains', 'Carpets', 'Home Accents'],
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 34.005,
      lng: 71.545,
      mapX: 52,
      mapY: 78
    },
    verified: true,
    ownerName: 'Imran Bacha',
    description: 'Designer curtains, Peshawar handmade rugs, modern wall clocks, dinner sets, and luxury bedroom aesthetics.',
    reviews: []
  },
  {
    id: 'glow-beauty-salon-cosmetics',
    name: 'Glow Beauty & Cosmetics Store',
    category: 'Beauty & Personal Care',
    shopType: 'Retail Store',
    rating: 4.4,
    reviewsCount: 310,
    distance: 1.3,
    address: 'Gulbahar # 2, Near Children Hospital, Peshawar',
    area: 'Qissa Khwani Bazar',
    city: 'Peshawar',
    isOpen: true,
    openingHours: '10:30 AM - 09:30 PM',
    phone: '091-5261818',
    whatsapp: '923085599766',
    email: 'glowbeauty.psh@gmail.com',
    hasEleganciaWater: false,
    tags: ['Organic Skincare', 'Perfumes', 'Makeup'],
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
    coords: {
      lat: 34.02,
      lng: 71.59,
      mapX: 82,
      mapY: 45
    },
    verified: true,
    ownerName: 'Sana Waseem',
    description: 'Certified 100% authentic international cosmetics, French fragrances, halal hair care, and dermatological skin treatments.',
    reviews: []
  }
];

export const CITY_COORDINATES: Record<string, { lat: number; lng: number; label: string; areas: string[] }> = {
  Peshawar: {
    lat: 34.0151,
    lng: 71.5249,
    label: 'Peshawar, Khyber Pakhtunkhwa',
    areas: ['Hayatabad', 'Saddar', 'University Town', 'Qissa Khwani Bazar', 'Gulbahar', 'Board Bazar']
  },
  Karachi: {
    lat: 24.8607,
    lng: 67.0011,
    label: 'Karachi, Sindh',
    areas: ['Clifton', 'DHA Defence', 'Saddar', 'Gulshan-e-Iqbal', 'North Nazimabad', 'Bahria Town']
  },
  Islamabad: {
    lat: 33.6844,
    lng: 73.0479,
    label: 'Islamabad, Federal Capital',
    areas: ['Blue Area', 'F-6 Markaz', 'F-7 Markaz', 'F-10 Markaz', 'G-9 Karachi Company', 'Bahria Enclave']
  },
  Lahore: {
    lat: 31.5204,
    lng: 74.3587,
    label: 'Lahore, Punjab',
    areas: ['Gulberg III', 'DHA Phase 5', 'Mall Road', 'Anarkali', 'Johar Town', 'Model Town']
  }
};
