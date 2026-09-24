import { supabase, isSupabaseConfigured } from './client';
import type { UserProfile } from '../../types';

const LOCAL_ADMIN_STORAGE_KEY = 'ambient_admin_pwd_v1';
const LOCAL_SESSION_KEY = 'ambient_local_session_v1';
const LOCAL_USERS_KEY = 'ambient_local_users_v1';

// Default Admin credentials requested by user
export const DEFAULT_ADMIN_USERNAME = 'iamavk265';
export const DEFAULT_ADMIN_PASSWORD = 'iamavk265';

export const getStoredAdminPassword = (): string => {
  return localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY) || DEFAULT_ADMIN_PASSWORD;
};

export const setStoredAdminPassword = (pwd: string): void => {
  localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, pwd);
};

export const getLocalSession = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setLocalSession = (user: UserProfile | null): void => {
  if (user) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
};

// Detect user country from browser timezone
export const detectUserCountry = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Asia/Kolkata') || tz.includes('India')) return 'India';
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('America')) return 'United States';
    if (tz.includes('London') || tz.includes('Europe/London')) return 'United Kingdom';
    if (tz.includes('Tokyo')) return 'Japan';
    if (tz.includes('Berlin') || tz.includes('Paris')) return 'Germany';
    if (tz.includes('Sydney')) return 'Australia';
    if (tz.includes('Toronto')) return 'Canada';
    return tz.split('/')[0] || 'United States';
  } catch {
    return 'United States';
  }
};

export const authService = {
  async signIn(identifier: string, password: string): Promise<{ user: UserProfile; error?: string }> {
    const cleanId = identifier.trim();
    const currentAdminPwd = getStoredAdminPassword();

    // 1. If Supabase is connected, attempt Supabase authentication
    if (isSupabaseConfigured && supabase) {
      try {
        let emailToAuth = cleanId;

        // If username was provided instead of email, lookup email from profiles table
        if (!cleanId.includes('@')) {
          if (cleanId.toLowerCase() === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
            emailToAuth = 'iamavk265@gmail.com';
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('username', cleanId)
              .single();

            if (profile?.email) {
              emailToAuth = profile.email;
            }
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToAuth,
          password
        });

        if (!error && data?.user) {
          // Fetch or update profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const role = profileData?.role || (data.user.email?.includes('iamavk265') ? 'admin' : 'user');

          const userProfile: UserProfile = {
            id: data.user.id,
            username: profileData?.username || data.user.user_metadata?.username || cleanId,
            email: data.user.email || '',
            fullName: profileData?.full_name || data.user.user_metadata?.full_name,
            country: profileData?.country || detectUserCountry(),
            role,
            lastSignInAt: new Date().toISOString(),
            createdAt: data.user.created_at
          };

          // Update last login in Supabase
          await supabase
            .from('profiles')
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq('id', data.user.id);

          setLocalSession(userProfile);
          return { user: userProfile };
        }
      } catch (err: unknown) {
        console.warn('[AuthService] Supabase sign in error, checking local fallback:', err);
      }
    }

    // 2. Direct Admin credential check fallback (for offline or emergency access)
    if (
      (cleanId === DEFAULT_ADMIN_USERNAME || cleanId.toLowerCase() === 'iamavk265@gmail.com' || cleanId.toLowerCase() === 'iamavk265@ambient.local') &&
      password === currentAdminPwd
    ) {
      const adminUser: UserProfile = {
        id: 'cd7e23f9-498d-4243-b45e-29b4d817c912',
        username: DEFAULT_ADMIN_USERNAME,
        email: 'iamavk265@gmail.com',
        fullName: 'Ajay V. Kamble (Admin)',
        country: detectUserCountry(),
        role: 'admin',
        lastSignInAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      setLocalSession(adminUser);
      return { user: adminUser };
    }

    // 3. Fallback for Local Mode when Supabase keys are not yet added
    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const localUsers: Array<UserProfile & { passwordHash?: string }> = usersRaw ? JSON.parse(usersRaw) : [];
      const found = localUsers.find(
        (u) => (u.username.toLowerCase() === cleanId.toLowerCase() || u.email.toLowerCase() === cleanId.toLowerCase())
      );

      if (found) {
        const updatedUser: UserProfile = {
          ...found,
          lastSignInAt: new Date().toISOString()
        };
        setLocalSession(updatedUser);
        return { user: updatedUser };
      }
    } catch {
      // ignore
    }

    return { user: null as unknown as UserProfile, error: 'Invalid username/email or password.' };
  },

  async signUp(
    username: string,
    email: string,
    password: string,
    fullName?: string,
    country?: string
  ): Promise<{ user: UserProfile; error?: string }> {
    const finalCountry = country || detectUserCountry();
    const isAdmin = username.toLowerCase() === DEFAULT_ADMIN_USERNAME || email.toLowerCase().includes('iamavk265');

    // If Supabase is connected
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              full_name: fullName,
              country: finalCountry
            }
          }
        });

        if (error) {
          return { user: null as unknown as UserProfile, error: error.message };
        }

        if (data.user) {
          const userProfile: UserProfile = {
            id: data.user.id,
            username,
            email,
            fullName,
            country: finalCountry,
            role: isAdmin ? 'admin' : 'user',
            lastSignInAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          // Ensure profile is in profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            email,
            full_name: fullName,
            country: finalCountry,
            role: isAdmin ? 'admin' : 'user',
            last_sign_in_at: new Date().toISOString()
          });

          setLocalSession(userProfile);
          return { user: userProfile };
        }
      } catch (err: unknown) {
        return { user: null as unknown as UserProfile, error: (err as Error).message };
      }
    }

    // Local Mode fallback
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username,
      email,
      fullName,
      country: finalCountry,
      role: isAdmin ? 'admin' : 'user',
      lastSignInAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    try {
      const usersRaw = localStorage.getItem(LOCAL_USERS_KEY);
      const localUsers = usersRaw ? JSON.parse(usersRaw) : [];
      localUsers.push(newUser);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    } catch {
      // ignore
    }

    setLocalSession(newUser);
    return { user: newUser };
  },

  async changePassword(newPassword: string, oldPassword?: string): Promise<{ success: boolean; error?: string }> {
    const currentSession = getLocalSession();
    if (!currentSession) {
      return { success: false, error: 'You must be logged in to change your password.' };
    }

    // If it's the admin user iamavk265
    if (currentSession.username === DEFAULT_ADMIN_USERNAME) {
      const currentAdminPwd = getStoredAdminPassword();
      if (oldPassword && oldPassword !== currentAdminPwd) {
        return { success: false, error: 'Incorrect current password.' };
      }
      setStoredAdminPassword(newPassword);
      return { success: true };
    }

    // If Supabase is connected
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: (err as Error).message };
      }
    }

    return { success: true };
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setLocalSession(null);
  },

  getCurrentUser(): UserProfile | null {
    return getLocalSession();
  }
};
