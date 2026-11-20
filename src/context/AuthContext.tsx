import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  isProfessional: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role?: UserRole,
    city?: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isLoggedIn: false,
  isProfessional: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        setProfile(data as Profile);
      } else if (!data) {
        // Create initial fallback profile if trigger was delayed
        const fallback: Profile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || 'مستخدم مهنتي',
          phone: user?.phone || null,
          role: (user?.user_metadata?.role as UserRole) || 'customer',
          avatar_url: null,
          city: 'رام الله والبيرة',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await supabase.from('profiles').upsert([fallback]);
        setProfile(fallback);
      }
    } catch (err) {
      console.warn('fetchProfile error:', err);
    }
  }

  useEffect(() => {
    // 1. Restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    role: UserRole = 'customer',
    city: string = 'رام الله والبيرة',
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim(),
            role,
            city,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            full_name: fullName.trim(),
            phone: phone?.trim() || null,
            role,
            city,
          },
        ]);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.warn('signOut error:', err);
    }
  };

  const updateProfile = async (patch: Partial<Profile>) => {
    if (!user) return { error: 'المستخدم غير مسجل الدخول' };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) return { error: error.message };
      setProfile(data as Profile);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'تعذر تحديث الملف الشخصي' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isLoggedIn: Boolean(user),
        isProfessional: profile?.role === 'professional',
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
