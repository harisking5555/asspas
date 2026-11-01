import React from 'react';
import { 
  ShoppingBag, 
  Shirt, 
  Smartphone, 
  Home, 
  Cross, 
  BookOpen, 
  Sparkles, 
  Trophy, 
  UtensilsCrossed, 
  ChevronRight,
  Droplet
} from 'lucide-react';
import { Shop, ShopCategory } from '../types';

interface CategoriesViewProps {
  shops: Shop[];
  onSelectCategory: (category: ShopCategory) => void;
  onSelectShop: (shop: Shop) => void;
  onFilterElegancia: () => void;
}

interface CategoryCardData {
  category: ShopCategory;
  title: string;
  subcategories: string[];
  icon: React.ReactNode;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  shops,
  onSelectCategory,
  onSelectShop,
  onFilterElegancia,
}) => {
  const categoryCards: CategoryCardData[] = [
    {
      category: 'Sports & Toys',
      title: 'Sports & Toys',
      subcategories: ['Cricket Bats (English Willow)', 'Fitness & Gym Gear', 'Footballs & Futsal', 'Badminton Racquets', 'Custom Team Kits', 'Children Toys'],
      icon: <Trophy className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Grocery & Daily Needs',
      title: 'Grocery & Daily Needs',
      subcategories: ['Elegancia Mineral Water', 'Fresh Organic Produce', 'Bakery & Dairy Items', 'Spices & Pulses', 'Beverages & Snacks', 'Home Essentials'],
      icon: <ShoppingBag className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Fashion & Clothing',
      title: 'Fashion & Clothing',
      subcategories: ['Men Contemporary Wear', 'Women Pret & Unstitched', 'Traditional Peshawar Chappals', 'Winter Shawls & Jackets', 'Footwear & Boots', 'Accessories'],
      icon: <Shirt className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Electronics & Mobiles',
      title: 'Electronics & Mobiles',
      subcategories: ['PTA Approved Smartphones', 'Laptops & Computing', 'Audio & AirPods', 'Smart Watches', 'Mobile Repair & Screen', 'Power Banks & Cables'],
      icon: <Smartphone className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Pharmacy & Health',
      title: 'Pharmacy & Health',
      subcategories: ['24/7 Emergency Medicines', 'Baby Care & Diapers', 'Health Supplements', 'Blood Pressure & Diabetes Monitors', 'First Aid Kits', 'Hygienic Mineral Water'],
      icon: <Cross className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Food & Restaurants',
      title: 'Food & Restaurants',
      subcategories: ['Shinwari Mutton Karahi', 'Peshawari Chapli Kebabs', 'Dine-In & Takeaway', 'Fast Food & Burgers', 'Traditional Tea & Kahwa', 'Family Platters'],
      icon: <UtensilsCrossed className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Home & Living',
      title: 'Home & Living',
      subcategories: ['Designer Curtains & Drapery', 'Handmade Peshawar Rugs', 'Wall Art & Clocks', 'Kitchenware & Crockery', 'Bedding & Linen', 'Lighting Fixtures'],
      icon: <Home className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Books & Stationery',
      title: 'Books & Stationery',
      subcategories: ['Medical & Engineering Textbooks', 'Competitive Exam Preparation', 'School Supplies & Uniforms', 'Luxury Pens & Notebooks', 'Art & Craft Materials', 'Novelties & Gifts'],
      icon: <BookOpen className="w-5 h-5 text-emerald-700" />,
    },
    {
      category: 'Beauty & Personal Care',
      title: 'Beauty & Personal Care',
      subcategories: ['Original French Perfumes', 'Organic Skincare & Serums', 'Professional Salon Cosmetics', 'Hair Treatments & Oils', 'Personal Grooming Kits', 'Dermatological Creams'],
      icon: <Sparkles className="w-5 h-5 text-emerald-700" />,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-left space-y-1.5 border-b border-slate-200 pb-5">
        <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Browse by Marketplace Categories
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Explore specialized retail sectors, top brand stores, and verified neighborhood merchants across Pakistan.
        </p>
      </div>

      {/* Special Elegancia Water Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-emerald-800/60">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Droplet className="w-6 h-6 fill-emerald-400 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-base">
              Featured: Elegancia Mineral Water Stockists
            </h3>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Filtered directory of supermarkets and grocery stores stocking fresh Elegancia Water bottles & cans.
            </p>
          </div>
        </div>
        <button
          onClick={onFilterElegancia}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 transition-colors shadow-xs cursor-pointer"
        >
          View Stockists Near You
        </button>
      </div>

      {/* 9 Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categoryCards.map((card) => {
          const categoryShops = shops.filter((s) => s.category === card.category);

          return (
            <div
              key={card.category}
              className="rounded-2xl border border-slate-200 hover:border-emerald-300 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Title & Icon Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center">
                      {card.icon}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                        {card.title}
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {categoryShops.length} Registered Stores
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subcategories list */}
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Popular Items & Specialties:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {card.subcategories.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sample Verified Stores */}
                {categoryShops.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Featured Stores:
                    </span>
                    {categoryShops.slice(0, 2).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onSelectShop(s)}
                        className="w-full flex items-center justify-between text-left p-1.5 rounded-lg hover:bg-emerald-50/60 transition-colors text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 truncate">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                          {s.distance} km
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCategory(card.category)}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
              >
                <span>Browse {card.title}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
