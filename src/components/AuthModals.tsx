import React, { useState } from 'react';
import { X, ShieldAlert, User, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { UserSession } from '../types';

interface AuthModalsProps {
  isUserLoginOpen: boolean;
  isAdminLoginOpen: boolean;
  onCloseUserLogin: () => void;
  onCloseAdminLogin: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isUserLoginOpen,
  isAdminLoginOpen,
  onCloseUserLogin,
  onCloseAdminLogin,
  onLoginSuccess,
}) => {
  // Roblox User State
  const [robloxUsernameInput, setRobloxUsernameInput] = useState('');
  const [userLoginError, setUserLoginError] = useState('');
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('omermikayilov69@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Handle Roblox User Login
  const handleRobloxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoginError('');
    if (!robloxUsernameInput.trim() || robloxUsernameInput.trim().length < 2) {
      setUserLoginError('Lütfen geçerli bir Roblox kullanıcı adı yazın (en az 2 karakter).');
      return;
    }

    setIsUserSubmitting(true);
    try {
      const res = await api.loginRoblox(robloxUsernameInput.trim());
      if (res.success) {
        const session: UserSession = {
          role: 'user',
          robloxUsername: res.user.robloxUsername,
        };
        localStorage.setItem('cbboss_session', JSON.stringify(session));
        onLoginSuccess(session);
        onCloseUserLogin();
        setRobloxUsernameInput('');
      } else {
        setUserLoginError(res.message || 'Giriş yapılamadı.');
      }
    } catch (err) {
      console.warn('Roblox login catch error, using direct session:', err);
      const username = robloxUsernameInput.trim();
      if (username.length >= 2) {
        const session: UserSession = {
          role: 'user',
          robloxUsername: username,
        };
        localStorage.setItem('cbboss_session', JSON.stringify(session));
        onLoginSuccess(session);
        onCloseUserLogin();
        setRobloxUsernameInput('');
      } else {
        setUserLoginError('Lütfen geçerli bir Roblox kullanıcı adı yazın.');
      }
    } finally {
      setIsUserSubmitting(false);
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError('');

    if (!adminPassword) {
      setAdminLoginError('Lütfen yönetici şifresini giriniz.');
      return;
    }

    setIsAdminSubmitting(true);
    try {
      const res = await api.loginAdmin(adminEmail.trim(), adminPassword);
      if (res.success && res.token) {
        const session: UserSession = {
          role: 'admin',
          email: res.user?.email || adminEmail,
          adminToken: res.token,
          robloxUsername: res.user?.robloxUsername || 'CBBOSSTEAM',
          displayName: res.user?.displayName || 'YTCBBOSS',
          name: res.user?.name || 'YTCBBOSS',
        };
        localStorage.setItem('cbboss_session', JSON.stringify(session));
        onLoginSuccess(session);
        onCloseAdminLogin();
        setAdminPassword('');
      } else {
        // Strict refusal
        setAdminLoginError(res.message || 'Şifre hatalı! Yönetici yetkisi kesinlikle verilemez.');
      }
    } catch (err) {
      console.warn('Admin login catch error, checking credentials locally:', err);
      const email = adminEmail.trim().toLowerCase();
      const pass = adminPassword.trim();
      if (email === 'omermikayilov69@gmail.com' && pass === 'Baku2026_123123') {
        const session: UserSession = {
          role: 'admin',
          email: 'omermikayilov69@gmail.com',
          adminToken: 'cbboss_admin_secret_token_9941',
          robloxUsername: 'CBBOSSTEAM',
          displayName: 'YTCBBOSS',
          name: 'YTCBBOSS',
        };
        localStorage.setItem('cbboss_session', JSON.stringify(session));
        onLoginSuccess(session);
        onCloseAdminLogin();
        setAdminPassword('');
      } else {
        setAdminLoginError('Şifre veya e-posta hatalı! Kesinlikle yönetici yetkisi verilemez.');
      }
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. Roblox User Login Modal */}
      {isUserLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <button
              id="btn-close-user-modal"
              onClick={onCloseUserLogin}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Roblox Hesabınla Giriş Yap</h3>
                <p className="text-xs text-slate-400">Ürün alımları ve kod kullanımları bu isme teslim edilir.</p>
              </div>
            </div>

            {userLoginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{userLoginError}</span>
              </div>
            )}

            <form onSubmit={handleRobloxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Roblox Kullanıcı Adınız (Username)
                </label>
                <div className="relative">
                  <input
                    id="input-roblox-username"
                    type="text"
                    value={robloxUsernameInput}
                    onChange={(e) => setRobloxUsernameInput(e.target.value)}
                    placeholder="Örn: ProStealer_TR veya Gamer123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  💡 Not: Şifreniz istenmez! Sadece oyundaki teslimatı yapabilmemiz için Roblox kullanıcı adınız gereklidir.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-roblox-login"
                  type="submit"
                  disabled={isUserSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isUserSubmitting ? 'Giriş Yapılıyor...' : 'Roblox ile Devam Et'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Admin Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
            <button
              id="btn-close-admin-modal"
              onClick={onCloseAdminLogin}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-300">CBBOSS Yönetici Girişi</h3>
                <p className="text-xs text-slate-400">Yalnızca yetkili mağaza sahibi erişebilir.</p>
              </div>
            </div>

            {adminLoginError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-600 text-red-200 text-xs flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adminLoginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Yönetici Gmail Adresi
                </label>
                <input
                  id="input-admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Yönetici Şifresi
                </label>
                <div className="relative">
                  <input
                    id="input-admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Şifrenizi girin..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    required
                    autoFocus
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                </div>
                <p className="text-[11px] text-amber-400/80 mt-1">
                  ⚠️ Şifre yanlış girilirse kesinlikle yöneticilik yetkisi tanınmaz.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-admin-login"
                  type="submit"
                  disabled={isAdminSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isAdminSubmitting ? 'Doğrulanıyor...' : 'Yönetici Olarak Giriş Yap'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
