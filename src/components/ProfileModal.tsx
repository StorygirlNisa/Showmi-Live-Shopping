import React, { useState } from 'react';
import { X, User, Lock, CreditCard, Building2, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { Seller } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'buyer' | 'seller';
  setUserRole: (role: 'buyer' | 'seller') => void;
  currentSeller?: Seller;
  sellers: Seller[];
  onSelectSeller: (sellerId: string) => void;
  onOpenSellerSignIn?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userRole,
  setUserRole,
  currentSeller,
  sellers,
  onSelectSeller
}) => {
  const [activeSection, setActiveSection] = useState<'menu' | 'profile' | 'security' | 'payments'>('menu');
  const [fullName, setFullName] = useState(userRole === 'seller' && currentSeller ? currentSeller.name : 'Nisa Bardien');
  const [email, setEmail] = useState('nisabardien@gmail.com');
  const [phone, setPhone] = useState('+27 82 555 0192');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const renderSectionHeader = (title: string) => (
    <div className="flex items-center gap-3 p-4 border-b border-[#212633] bg-[#0c0e12]/50">
      <button onClick={() => setActiveSection('menu')} className="text-slate-400 hover:text-white">←</button>
      <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-fade-in overflow-hidden">
        
        {activeSection === 'menu' ? (
            <>
                <div className="flex items-center justify-between p-5 border-b border-[#212633]">
                    <h2 className="text-lg font-bold text-white">Profile Settings</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    <button onClick={() => setActiveSection('profile')} className="flex flex-col items-center justify-center p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-3">
                        <User className="w-8 h-8 text-[#0066ff]"/>
                        <span className="font-semibold text-sm">Personal Details</span>
                    </button>
                    <button onClick={() => setActiveSection('security')} className="flex flex-col items-center justify-center p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-3">
                        <Lock className="w-8 h-8 text-[#0066ff]"/>
                        <span className="font-semibold text-sm">Security & Password</span>
                    </button>
                    <button onClick={() => setActiveSection('payments')} className="flex flex-col items-center justify-center p-6 bg-[#1e2330] rounded-2xl text-white hover:bg-[#283042] text-center gap-3">
                        <CreditCard className="w-8 h-8 text-[#0066ff]"/>
                        <span className="font-semibold text-sm">Payments & Banking</span>
                    </button>
                </div>
            </>
        ) : (
            <>
                {/* Section Content */}
                <div className="flex-1 overflow-y-auto">
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
                                    {/* Existing Payment Content */}
                                    <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#212633] flex items-center justify-between">
                                        <span className="text-xs font-bold text-white">•••• •••• •••• 4892</span>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-[#212633]">
                                    <h3 className="text-sm font-bold text-white">Banking Details</h3>
                                    {/* Existing Banking Content */}
                                    <div className="p-4 rounded-2xl bg-[#0c0e12] border border-[#212633]">
                                        <div className="text-sm font-bold text-white">First National Bank (FNB)</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

