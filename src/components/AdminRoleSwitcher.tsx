import React from 'react';
import { User, Shield, Store } from 'lucide-react';

interface AdminRoleSwitcherProps {
  userRole: 'admin' | 'seller' | 'buyer';
  setUserRole: (role: 'admin' | 'seller' | 'buyer') => void;
  currentSellerId: string;
  onSelectSeller: (sellerId: string) => void;
  sellers: { id: string; name: string }[];
}

export const AdminRoleSwitcher: React.FC<AdminRoleSwitcherProps> = ({
  userRole,
  setUserRole,
  currentSellerId,
  onSelectSeller,
  sellers
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#14171f] border-b border-[#212633] px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto text-xs h-12">
      <div className="flex items-center gap-2 shrink-0">
        <Shield className="w-3.5 h-3.5 text-[#19BFFF]" />
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">
          Demo Control Bar
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-[10px] text-slate-400 hidden sm:inline">Role:</span>
        {(['admin', 'seller', 'buyer'] as const).map((role) => (
          <button
            key={role}
            onClick={() => setUserRole(role)}
            className={`px-2.5 py-1 rounded-md font-bold capitalize transition-all cursor-pointer ${
              userRole === role 
                ? 'bg-[#19BFFF] text-[#0D1018] shadow-sm' 
                : 'bg-[#1e2330] text-slate-300 hover:text-white'
            }`}
          >
            {role === 'admin' ? 'Admin' : role === 'seller' ? 'Seller' : 'Buyer'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {(userRole === 'admin' || userRole === 'seller') && (
          <div className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-[#19BFFF] hidden sm:block" />
            <span className="text-[10px] text-slate-400 hidden md:inline">Showroom:</span>
            <select
              value={currentSellerId}
              onChange={(e) => onSelectSeller(e.target.value)}
              disabled={userRole === 'seller'}
              className="bg-[#1e2330] text-white px-2.5 py-1 rounded-md border border-[#212633] outline-none text-xs font-semibold cursor-pointer disabled:opacity-80"
              title={userRole === 'seller' ? 'Sellers manage their assigned showroom only' : 'Admin: Select showroom to manage'}
            >
              {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {userRole === 'buyer' && (
          <div className="text-[10px] text-slate-400 italic hidden sm:block">
            Buyer Mode (Shopping)
          </div>
        )}
      </div>
    </div>
  );
};

