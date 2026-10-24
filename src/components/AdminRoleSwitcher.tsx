import React from 'react';
import { User, Shield, Store } from 'lucide-react';

interface AdminRoleSwitcherProps {
  userRole: 'admin' | 'seller' | 'buyer';
  currentSellerId: string;
  onSelectSeller: (sellerId: string) => void;
  sellers: { id: string; name: string }[];
  onSeedData?: () => void;
  isSeeding?: boolean;
}

export const AdminRoleSwitcher: React.FC<AdminRoleSwitcherProps> = ({
  userRole,
  currentSellerId,
  onSelectSeller,
  sellers,
  onSeedData,
  isSeeding
}) => {
  return (
    <div className="relative w-full z-30 bg-[#14171f] border-b border-[#212633] px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 overflow-x-auto text-xs">
      <div className="flex items-center gap-2 shrink-0">
        <Shield className="w-3.5 h-3.5 text-[#19BFFF]" />
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          System Status: {userRole.toUpperCase()}
        </span>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {userRole === 'admin' && onSeedData && (
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold hover:bg-amber-500/30 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1"
          >
            <Store className="w-3 h-3" />
            <span>{isSeeding ? 'Seeding...' : 'Seed Firestore'}</span>
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-[#19BFFF] hidden sm:block" />
          <span className="text-[10px] text-slate-400 hidden md:inline">
            {userRole === 'seller' ? 'Showroom:' : userRole === 'admin' ? 'Managing:' : 'Identity:'}
          </span>
          <select
            value={currentSellerId}
            onChange={(e) => onSelectSeller(e.target.value)}
            className="bg-[#1e2330] text-white px-2.5 py-1 rounded-md border border-[#212633] outline-none text-xs font-semibold cursor-pointer"
            title="Select identity to simulate"
          >
            {userRole === 'buyer' && (
              <option value="">Guest Shopper (Ordinary Buyer)</option>
            )}
            {sellers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {userRole === 'buyer' ? '(Showpreneur)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

