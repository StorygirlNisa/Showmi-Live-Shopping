import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Store, 
  ShoppingBag, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { ShowmiLogo } from './ShowmiLogo';
import { SELLERS } from '../data/mockData';

export type AuthMode = 'signin' | 'register';
export type AccountType = 'buyer' | 'seller';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: (user: FirebaseUser, role: AccountType) => void;
  onRoleAssigned?: (email: string, role: AccountType) => void;
}

export const getAuthErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials, or use "Forgot Password?" to reset it.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is currently not enabled in your project settings.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for Showmi.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
        return 'Invalid email or password. Please verify your credentials, or use "Forgot Password?" to reset it.';
      }
      if (message.includes('email-already-in-use')) {
        return 'An account with this email already exists. Please sign in instead.';
      }
      if (message.includes('weak-password')) {
        return 'Password is too weak. Please use at least 6 characters.';
      }
      return message || 'Authentication failed. Please try again.';
  }
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
  onRoleAssigned
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('buyer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Sync mode if initialMode changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setResetSuccessMessage(null);
    setIsSubmitting(false);
    setIsGoogleSubmitting(false);
    setIsResettingPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  };

  // Password Reset Handler (Requires email and does not reveal whether account exists)
  const handleForgotPassword = async () => {
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address to reset your password.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsResettingPassword(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetSuccessMessage(
        'If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.'
      );
    } catch (err: any) {
      console.warn('Password reset attempt unsuccessful:', err?.code || err?.message);
      const code = err?.code || '';
      if (code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMessage('Network connection error. Please check your internet connection and try again.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please wait a few moments before trying again.');
      } else {
        setErrorMessage(getAuthErrorMessage(err) || 'Unable to send password reset email. Please try again.');
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Google Sign-In (Keeps Google auth fully functional)
  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        onSuccess?.(result.user, 'buyer');
        handleClose();
      }
    } catch (err: any) {
      console.warn('Google Sign-in attempt unsuccessful:', err?.code || err?.message);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Email/Password Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setErrorMessage('Password is too weak. Please use at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter your password confirmation.');
        return;
      }
    }

    setIsSubmitting(true);

    if (mode === 'register') {
      try {
        // Notify parent of pending role to avoid race conditions with onAuthStateChanged
        onRoleAssigned?.(cleanEmail.toLowerCase(), accountType);

        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = cred.user;

        // Immediately persist user role to Firestore profile matching Showmi's schema
        const userDocRef = doc(db, 'users', user.uid);
        const newUserProfile: Record<string, any> = {
          email: user.email || cleanEmail,
          displayName: user.displayName || cleanEmail.split('@')[0] || (accountType === 'seller' ? 'Maker' : 'Shopper'),
          role: accountType,
          createdAt: serverTimestamp()
        };

        if (accountType === 'seller') {
          newUserProfile.sellerId = SELLERS[0].id;
        }

        await setDoc(userDocRef, newUserProfile, { merge: true });

        onSuccess?.(user, accountType);
        handleClose();
      } catch (err: any) {
        console.warn('Registration attempt unsuccessful:', err?.code || err?.message);
        setErrorMessage(getAuthErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Sign In mode
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        onSuccess?.(cred.user, accountType);
        handleClose();
      } catch (err: any) {
        console.warn('Sign In attempt unsuccessful:', err?.code || err?.message);
        setErrorMessage(getAuthErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#14171f] border border-[#212633] rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#212633] shrink-0 bg-[#0c0e12]/50">
          <div className="flex items-center gap-3">
            <ShowmiLogo size="sm" showWordmark={false} />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Sign In to Showmi' : 'Create an Account'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {mode === 'signin' 
                  ? 'Access live streams, maker showrooms & orders' 
                  : 'Join South Africa’s premier live maker marketplace'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#1e2330] hover:bg-[#283042] text-slate-300 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 sm:px-6 pt-5 shrink-0">
          <div className="grid grid-cols-2 p-1 bg-[#0c0e12] border border-[#212633] rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#19BFFF] text-[#0D1018] font-bold shadow-md shadow-[#19BFFF]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {resetSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{resetSuccessMessage}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleSubmitting || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#171A21] hover:bg-[#20242E] border border-[#242936] hover:border-[#374151] text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>{isGoogleSubmitting ? 'Signing in with Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#242936]"></div>
            <span className="shrink mx-3 text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
              or use email
            </span>
            <div className="flex-grow border-t border-[#242936]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Account Type Selector (Only in Register mode) */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Account Type <span className="text-[#19BFFF]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setAccountType('buyer')}
                    className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                      accountType === 'buyer'
                        ? 'bg-[#19BFFF]/10 border-[#19BFFF] text-white shadow-sm'
                        : 'bg-[#0c0e12] border-[#212633] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className={`w-4 h-4 ${accountType === 'buyer' ? 'text-[#19BFFF]' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-white">Buyer</span>
                      </div>
                      {accountType === 'buyer' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#19BFFF]" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Browse & buy artisan goods
                    </span>
                  </div>

                  <div
                    onClick={() => setAccountType('seller')}
                    className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                      accountType === 'seller'
                        ? 'bg-[#19BFFF]/10 border-[#19BFFF] text-white shadow-sm'
                        : 'bg-[#0c0e12] border-[#212633] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Store className={`w-4 h-4 ${accountType === 'seller' ? 'text-[#19BFFF]' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold text-white">Seller</span>
                      </div>
                      {accountType === 'seller' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#19BFFF]" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-tight">
                      Go live & sell craft inventory
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                    if (resetSuccessMessage) setResetSuccessMessage(null);
                  }}
                  placeholder="e.g. name@example.co.za"
                  required
                  className="w-full min-h-[42px] bg-[#0c0e12] border border-[#212633] focus:border-[#19BFFF] focus:ring-1 focus:ring-[#19BFFF] rounded-xl pl-10 pr-3.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 block">
                  Password
                </label>
                {mode === 'register' ? (
                  <span className="text-[10px] text-slate-400">Min. 6 characters</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword || isSubmitting}
                    className="text-[11px] text-[#19BFFF] hover:underline font-semibold cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {isResettingPassword ? 'Sending link...' : 'Forgot Password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={mode === 'register' ? 'Choose a secure password' : 'Enter your password'}
                  required
                  className="w-full min-h-[42px] bg-[#0c0e12] border border-[#212633] focus:border-[#19BFFF] focus:ring-1 focus:ring-[#19BFFF] rounded-xl pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only in Register mode) */}
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Re-enter your password"
                    required
                    className="w-full min-h-[42px] bg-[#0c0e12] border border-[#212633] focus:border-[#19BFFF] focus:ring-1 focus:ring-[#19BFFF] rounded-xl pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full py-3 rounded-xl bg-[#19BFFF] hover:bg-[#00AEEF] text-[#0D1018] text-xs font-bold tracking-wide transition-all cursor-pointer shadow-lg shadow-[#19BFFF]/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0D1018] border-t-transparent rounded-full animate-spin" />
                  <span>{mode === 'register' ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'register' ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Quick-Fill Section (Convenient for pre-created accounts) */}
          {mode === 'signin' && (
            <div className="pt-2 border-t border-[#212633]">
              <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
                <span>Quick Fill Demo Accounts:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('showmibuyerdemo@gmail.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1e2330] border border-[#242936] text-[11px] text-slate-300 hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer truncate"
                  title="Fill Buyer Demo Account"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#19BFFF] shrink-0" />
                  <span className="truncate">Buyer Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('showmisellerdemo@gmail.com')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#171A21] hover:bg-[#1e2330] border border-[#242936] text-[11px] text-slate-300 hover:text-white transition-colors text-left flex items-center gap-1.5 cursor-pointer truncate"
                  title="Fill Seller Demo Account"
                >
                  <Store className="w-3.5 h-3.5 text-[#19BFFF] shrink-0" />
                  <span className="truncate">Seller Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Mode Switch */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-400">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#19BFFF] hover:underline font-semibold cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-[#19BFFF] hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
