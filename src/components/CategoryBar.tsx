import React from 'react';
import {
  LayoutGrid,
  ShoppingBasket,
  Shirt,
  Smartphone,
  Armchair,
  Pill,
  BookOpen,
  Gem,
  Dumbbell,
  UtensilsCrossed,
  Droplets,
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
      icon: <LayoutGrid className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Grocery & Daily Needs',
      label: 'Grocery & Daily Needs',
      icon: <ShoppingBasket className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Fashion & Clothing',
      label: 'Fashion & Clothing',
      icon: <Shirt className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Electronics & Mobiles',
      label: 'Electronics & Mobiles',
      icon: <Smartphone className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Home & Living',
      label: 'Home & Living',
      icon: <Armchair className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Pharmacy & Health',
      label: 'Pharmacy & Health',
      icon: <Pill className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Books & Stationery',
      label: 'Books & Stationery',
      icon: <BookOpen className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Beauty & Personal Care',
      label: 'Beauty & Personal Care',
      icon: <Gem className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Sports & Toys',
      label: 'Sports & Toys',
      icon: <Dumbbell className="w-5 h-5" strokeWidth={1.65} />,
    },
    {
      id: 'Food & Restaurants',
      label: 'Food & Restaurants',
      icon: <UtensilsCrossed className="w-5 h-5" strokeWidth={1.65} />,
    },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 py-4">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 overflow-x-auto no-scrollbar pb-0.5">
        {/* Elegancia Water Filter Card */}
        <button
          type="button"
          onClick={onToggleEleganciaFilter}
          className={`shrink-0 flex flex-col items-center justify-center px-3.5 py-3 rounded-xl border text-center transition-all min-w-[112px] sm:min-w-[122px] group cursor-pointer ${
            filterOnlyElegancia
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-semibold'
              : 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform duration-150 group-hover:scale-105 ${
              filterOnlyElegancia ? 'bg-white/20 text-white' : 'bg-white text-emerald-600 shadow-2xs'
            }`}
          >
            <Droplets className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <span className="text-[11px] font-semibold leading-tight whitespace-nowrap">
            Elegancia Water
          </span>
        </button>

        {/* Standard Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id && !filterOnlyElegancia;

          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => {
                if (filterOnlyElegancia) onToggleEleganciaFilter();
                onSelectCategory(cat.id);
              }}
              className={`shrink-0 flex flex-col items-center justify-center px-3.5 py-3 rounded-xl border text-center transition-all min-w-[112px] sm:min-w-[122px] group cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 font-medium'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-transform duration-150 group-hover:scale-105 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-50 text-emerald-700 group-hover:bg-emerald-50'
                }`}
              >
                {cat.icon}
              </div>
              <span className="text-[11px] leading-tight truncate max-w-[100px]">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
