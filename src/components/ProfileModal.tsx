import React, { useState } from 'react';
import { X, User, Lock, CreditCard, Store, ShieldCheck, Sparkles, Check, MapPin, Package, ShoppingBag } from 'lucide-react';
import { Seller } from '../types';
import { AppTab } from './Navigation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'buyer' | 'seller' | 'admin';
  setUserRole: (role: 'admin' | 'seller' | 'buyer') => void;
  currentSeller?: Seller;
  sellers: Seller[];
  onSelectSeller: (sellerId: string) => void;
  onOpenSellerSignIn?: () => void;
  onOpenTab?: (tab: AppTab) => void;
  ordersCount?: number;
  totalItemCount?: number;
  currentUser?: any | null;
  onSignOut?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userRole,
  setUserRole,
  currentSeller,
  sellers,
  onSelectSeller,
  onOpenTab,
  ordersCount = 0,
  totalItemCount = 0,
  currentUser,
  onSignOut
}) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'profile' | 'security' | 'payments' | 'address' | 'verification'>('menu');
  const [fullName, setFullName] = useState(currentUser?.displayName || (userRole === 'seller' && currentSeller ? currentSeller.name : 'Nisa Bardien'));
  const [email, setEmail] = useState(currentUser?.email || 'nisabardien@gmail.com');
  const [phone, setPhone] = useState('+27 82 555 0192');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [address, setAddress] = useState({
      residential: { country: 'South Africa', province: '', city: '', suburb: '', street: '', unit: '', postalCode: '' },
      business: { country: 'South Africa', province: '', city: '', suburb: '', street: '', unit: '', postalCode: '' },
      isSame: true
  });
  const [verificationStatus, setVerificationStatus] = useState<'Not started' | 'Pending' | 'Verified' | 'Action required'>('Not started');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const renderSectionHeader = (title: string) => (
    <div className="flex items-center gap-3 p-4 border-b border-[#212633] bg-[#0c0e12]/50 shrink-0">
      <button onClick={() => setActiveSection('menu')} className="text-slate-400 hover:text-white cursor-pointer">←</button>
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-xl w-full h-[90vh] max-h-[90vh] flex flex-col shadow-2xl relative animate-fade-in overflow-hidden">
        
        {/* Main Body Flex Container */}
        <div className="flex-1 flex flex-col overflow-hidden">
        
        {activeSection === 'menu' ? (
            <>
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#212633] shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-white">Profile Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer" aria-label="Close profile"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-20">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                        <button onClick={() => setActiveSection('profile')} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all">
                            <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff]"/>
                            <span className="font-semibold text-xs sm:text-sm">Personal Details</span>
                        </button>
                        <button onClick={() => setActiveSection('security')} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all">
                            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff]"/>
                            <span className="font-semibold text-xs sm:text-sm">Security & Password</span>
                        </button>
                        <button onClick={() => setActiveSection('payments')} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all">
                            <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff]"/>
                            <span className="font-semibold text-xs sm:text-sm">Payments & Banking</span>
                        </button>
                        <button onClick={() => setActiveSection('address')} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all">
                            <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff]"/>
                            <span className="font-semibold text-xs sm:text-sm">Addresses</span>
                        </button>
                        <button onClick={() => setActiveSection('verification')} className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all">
                            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff]"/>
                            <span className="font-semibold text-xs sm:text-sm">Verification</span>
                        </button>
                        <button 
                            onClick={() => { if (onOpenTab) { onOpenTab('My Orders'); onClose(); } }} 
                            className="flex flex-col items-center justify-center p-4 sm:p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all relative group"
                            title="View your orders, tracking waybills and payment protection"
                            aria-label="My Orders and Tracking"
                        >
                            <div className="relative">
                                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-[#0066ff] group-hover:scale-105 transition-transform"/>
                                {ordersCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2.5 bg-[#19BFFF] text-[#0D1018] text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono shadow-sm">
                                        {ordersCount}
                                    </span>
                                )}
                            </div>
                            <span className="font-semibold text-xs sm:text-sm">My Orders & Tracking</span>
                        </button>
                        {currentUser && (
                          <button 
                              onClick={() => { if (onSignOut) onSignOut(); onClose(); }} 
                              className="flex flex-col items-center justify-center p-4 sm:p-6 bg-red-900/20 rounded-2xl text-red-400 hover:bg-red-900/30 text-center gap-2 sm:gap-3 cursor-pointer active:scale-95 transition-all border border-red-900/30"
                              title="Sign out of your account"
                          >
                              <X className="w-7 h-7 sm:w-8 sm:h-8 text-red-500"/>
                              <span className="font-semibold text-xs sm:text-sm">Sign Out</span>
                          </button>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto pb-20">
                    {activeSection === 'profile' && (
                        <>
                            {renderSectionHeader('Personal Details')}
                            <div className="p-5">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">Full Name</label>
                                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    </div>
                                    <button type="submit" className="w-full py-3 rounded-xl bg-[#0066ff] text-white text-xs font-bold">Save</button>
                                </form>
                            </div>
                        </>
                    )}
                    {activeSection === 'security' && (
                        <>
                            {renderSectionHeader('Security & Password')}
                            <div className="p-5">
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-300">New Password</label>
                                        <input type="password" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    </div>
                                    <button type="submit" className="w-full py-3 rounded-xl bg-[#0066ff] text-white text-xs font-bold">Update Password</button>
                                </form>
                            </div>
                        </>
                    )}
                    {activeSection === 'payments' && (
                        <>
                            {renderSectionHeader('Payment Methods & Banking')}
                            <div className="p-5 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white">Payment Methods</h3>
                                    <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">•••• •••• •••• 4892</span>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-[#212633]">
                                    <h3 className="text-sm font-bold text-white">Banking Details</h3>
                                    <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#212633]">
                                        <div className="text-sm font-bold text-white">First National Bank (FNB)</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {activeSection === 'address' && (
                        <>
                            {renderSectionHeader('Addresses')}
                            <div className="p-5 space-y-4">
                                <h4 className="text-sm font-bold text-white">Residential Address</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Street" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    <input type="text" placeholder="Unit/Apartment" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    <input type="text" placeholder="Suburb" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    <input type="text" placeholder="City" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    <input type="text" placeholder="Province" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                    <input type="text" placeholder="Postal Code" className="w-full bg-[#0c0e12] border border-[#212633] rounded-xl px-3.5 py-2.5 text-xs text-white" />
                                </div>
                                <label className="flex items-center gap-2 text-xs text-slate-300">
                                    <input type="checkbox" checked={address.isSame} onChange={e => setAddress({...address, isSame: e.target.checked})} />
                                    Business address is the same as my residential address
                                </label>
                            </div>
                        </>
                    )}
                    {activeSection === 'verification' && (
                        <>
                            {renderSectionHeader('Verification')}
                            <div className="p-5 space-y-4 text-slate-300 text-xs">
                                <p>Status: <span className="font-bold">{verificationStatus}</span></p>
                                <button className="w-full py-2 bg-[#0066ff] text-white rounded-lg">Start Verification</button>
                            </div>
                        </>
                    )}
                </div>
            </>
        )}
      </div>

      {/* Footer anchored at the bottom of modal card */}
      <footer className="shrink-0 bg-[#0D1018] border-t border-[#242936] py-2.5 px-4 shadow-2xl safe-area-bottom z-20">
        <div className="max-w-md mx-auto flex items-center justify-around h-12">
          {/* 1. Profile */}
          <button
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-[#19BFFF] cursor-pointer"
            aria-label="Profile and account settings"
            title="Profile"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Profile</span>
          </button>

          {/* 2. Showroom */}
          <button
            onClick={() => { if (onOpenTab) onOpenTab('Showrooms'); onClose(); }}
            className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            aria-label="Showrooms directory"
            title="Showroom"
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Showroom</span>
          </button>

          {/* 3. Cart */}
          <button
            onClick={() => { if (onOpenTab) onOpenTab('Basket'); onClose(); }}
            className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer relative"
            aria-label="Cart and checkout"
            title="Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#19BFFF] text-[#0D1018] px-1 py-0.2 rounded-full text-[9px] font-extrabold tabular-nums">
                  {totalItemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-white">Cart</span>
          </button>

          {/* 4. Seller Studio */}
          <button
            onClick={() => { if (onOpenTab) onOpenTab('Seller Studio'); onClose(); }}
            className="flex flex-col items-center justify-center gap-1 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            aria-label="Seller Studio management"
            title="Seller Studio"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-bold text-white">Seller Studio</span>
          </button>
        </div>
      </footer>

      </div>
    </div>
  );
};
