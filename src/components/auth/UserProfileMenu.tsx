import React, { useState, useRef, useEffect } from 'react';
import { User, Shield, KeyRound, LogOut, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const UserProfileMenu: React.FC = () => {
  const { user, isAdmin, openAuthModal, openChangePassword, openAdminModal, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-white/80 hover:text-white hover:bg-white/15 transition-all cursor-pointer shadow-sm"
        title="Sign In or Create Account"
      >
        <User className="w-3.5 h-3.5 text-indigo-400" />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full glass-dock hover:bg-white/15 transition-all cursor-pointer select-none"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-md ${
          isAdmin
            ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-black'
            : 'bg-gradient-to-tr from-sky-400 to-indigo-500 text-white'
        }`}>
          {user.username.charAt(0).toUpperCase()}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-medium text-white leading-tight max-w-[90px] truncate">
            {user.username}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 leading-none">
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>

        <ChevronDown className="w-3 h-3 text-white/40" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0F1117]/95 border border-white/10 p-3 shadow-2xl backdrop-blur-xl z-50 animate-fade-in select-none">
          {/* User info card */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/8 mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                {user.fullName || user.username}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider ${
                isAdmin
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}>
                {isAdmin ? 'Admin' : 'User'}
              </span>
            </div>
            <p className="text-[11px] text-white/40 truncate">{user.email}</p>
            {user.country && (
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-white/60 font-mono">
                <Globe className="w-3 h-3 text-indigo-400" />
                <span>{user.country}</span>
              </div>
            )}
          </div>

          {/* Admin Studio Quick Entry */}
          {isAdmin && (
            <button
              onClick={() => {
                setIsOpen(false);
                openAdminModal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all cursor-pointer mb-2"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Admin Studio</span>
            </button>
          )}

          {/* Actions */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                openChangePassword();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-left"
            >
              <KeyRound className="w-3.5 h-3.5 text-white/50" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
