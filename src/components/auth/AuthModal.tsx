import React, { useState } from 'react';
import { X, Lock, User, Mail, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Japan',
  'Germany',
  'Canada',
  'Australia',
  'France',
  'Singapore',
  'Netherlands',
  'Brazil',
  'South Korea',
  'Other'
];

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signUp, isLoading, authModalPrompt } = useAuthStore();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In Form
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpCountry, setSignUpCountry] = useState('India');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signInIdentifier || !signInPassword) {
      setErrorMessage('Please enter your username/email and password.');
      return;
    }

    const res = await login(signInIdentifier, signInPassword);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signUpUsername || !signUpEmail || !signUpPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const res = await signUp(
      signUpUsername,
      signUpEmail,
      signUpPassword,
      signUpFullName,
      signUpCountry
    );

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-[#0F1117]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-sky-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full glass-dock text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[1.5px] mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-[#0F1117] rounded-[14px] flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">
            {tab === 'signin' ? 'Welcome to Ambient' : 'Create an Account'}
          </h2>
          {authModalPrompt ? (
            <div className="mt-2.5 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs leading-relaxed">
              {authModalPrompt}
            </div>
          ) : (
            <p className="text-xs text-white/50 font-light mt-1">
              {tab === 'signin'
                ? 'Sign in to access your personal screensavers and preferences'
                : 'Save custom photo albums and synchronize across your screens'}
            </p>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-full bg-white/5 p-1 mb-6 border border-white/8">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
              tab === 'signin'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-all ${
              tab === 'signup'
                ? 'bg-white text-black font-semibold shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            {successMessage}
          </div>
        )}

        {/* SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={signInIdentifier}
                  onChange={(e) => setSignInIdentifier(e.target.value)}
                  placeholder="Username or email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  placeholder="your_handle"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  placeholder="Ajay Kamble"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                Country / Region
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <select
                  value={signUpCountry}
                  onChange={(e) => setSignUpCountry(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#161922] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} className="bg-[#161922] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/60 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold text-xs tracking-wide shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
