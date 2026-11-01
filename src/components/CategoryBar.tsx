import React from 'react';
import { 
  Grid, 
  ShoppingBag, 
  Shirt, 
  Smartphone, 
  Home, 
  Cross, 
  BookOpen, 
  Sparkles, 
  Trophy, 
  UtensilsCrossed,
  Droplet
} from 'lucide-react';
import { ShopCategory } from '../types';

interface CategoryBarProps {
  selectedCategory: ShopCategory;
  onSelectCategory: (category: ShopCategory) => void;
  filterOnlyElegancia: boolean;
  onToggleEleganciaFilter: () => void;
}

interface CategoryItem {
  id: ShopCategory;
  label: string;
  icon: React.ReactNode;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  filterOnlyElegancia,
  onToggleEleganciaFilter,
}) => {
  const categories: CategoryItem[] = [
    {
      id: 'All Categories',
      label: 'All Categories',
      icon: <Grid className="w-5 h-5" />,
    },
    {
      id: 'Grocery & Daily Needs',
      label: 'Grocery & Daily Needs',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'Fashion & Clothing',
      label: 'Fashion & Clothing',
      icon: <Shirt className="w-5 h-5" />,
    },
    {
      id: 'Electronics & Mobiles',
      label: 'Electronics & Mobiles',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      id: 'Home & Living',
      label: 'Home & Living',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'Pharmacy & Health',
      label: 'Pharmacy & Health',
      icon: <Cross className="w-5 h-5" />,
    },
    {
      id: 'Books & Stationery',
      label: 'Books & Stationery',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'Beauty & Personal Care',
      label: 'Beauty & Personal Care',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'Sports & Toys',
      label: 'Sports & Toys',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'Food & Restaurants',
      label: 'Food & Restaurants',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-xs py-3.5">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
        {/* Special Elegancia Water Toggle Card */}
        <button
          onClick={onToggleEleganciaFilter}
          className={`shrink-0 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all min-w-[105px] sm:min-w-[115px] group cursor-pointer ${
            filterOnlyElegancia
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-102 font-bold'
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-105 ${
              filterOnlyElegancia ? 'bg-white/20 text-white' : 'bg-white text-emerald-600 shadow-xs'
            }`}
          >
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] font-bold leading-tight">
            Elegancia Water
          </span>
          <span
            className={`text-[9px] mt-0.5 font-medium ${
              filterOnlyElegancia ? 'text-emerald-100' : 'text-emerald-700'
            }`}
          >
            {filterOnlyElegancia ? 'Filter Active' : 'Mineral Water'}
          </span>
        </button>

        {/* Standard Categories all unified in the emerald theme */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id && !filterOnlyElegancia;

          return (
            <button
              key={cat.id}
              onClick={() => {
                if (filterOnlyElegancia) onToggleEleganciaFilter();
                onSelectCategory(cat.id);
              }}
              className={`shrink-0 flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all min-w-[105px] sm:min-w-[115px] group cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500 text-emerald-950 font-bold'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-1 transition-transform group-hover:scale-105 ${
                  isSelected 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {cat.icon}
              </div>
              <span className="text-[11px] leading-tight line-clamp-1 max-w-[95px]">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
