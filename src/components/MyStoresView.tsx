import React, { useState } from 'react';
import { 
  Store, 
  PlusCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Star, 
  Users, 
  Droplet, 
  ExternalLink,
  Edit3,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Shop } from '../types';
import { useAuth } from '../context/AuthContext';

interface MyStoresViewProps {
  shops: Shop[];
  onOpenAddShop: () => void;
  onSelectShop: (shop: Shop) => void;
  onOpenDetails: (shop: Shop) => void;
}

export const MyStoresView: React.FC<MyStoresViewProps> = ({
  shops,
  onOpenAddShop,
  onSelectShop,
  onOpenDetails,
}) => {
  const { currentUser, userProfile } = useAuth();

  // Find stores owned by this user
  const myShops = shops.filter(
    (s) => (currentUser && s.ownerId === currentUser.uid) || 
           (userProfile && s.ownerName?.toLowerCase() === userProfile.name?.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 font-['Poppins']">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-800/60 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
            <Store className="w-3.5 h-3.5 text-emerald-400" />
            <span>Merchant Business Hub · asspas.store</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
            My Registered Businesses ({myShops.length})
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-xl">
            Manage your shops, monitor neighborhood followers, update inventory, and register 2nd or 3rd branch locations across Pakistan.
          </p>
        </div>

        <button
          onClick={onOpenAddShop}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Another Business</span>
        </button>
      </div>

      {/* Stores List Grid */}
      {myShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => {
                onSelectShop(shop);
                onOpenDetails(shop);
              }}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {shop.status === 'pending' ? 'Pending Approval' : 'Live & Verified'}
                    </span>
                  </div>
                  {shop.hasEleganciaWater && (
                    <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Droplet className="w-3 h-3 fill-emerald-400" />
                      <span>Elegancia Water</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="font-['Outfit'] font-black text-base text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {shop.name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {shop.itemType || 'goods'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{shop.address}, {shop.city}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {shop.rating}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    {shop.followersCount || 0} followers
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {shop.openingHours}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span>View Public Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400">
                  ID: {shop.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-['Outfit'] font-black text-lg text-slate-900">
              No Registered Businesses Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register your retail store, wholesale outlet, grocery, or personal service skills to connect with thousands of local buyers in your city.
            </p>
          </div>
          <button
            onClick={onOpenAddShop}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Your Business Free</span>
          </button>
        </div>
      )}
    </div>
  );
};
