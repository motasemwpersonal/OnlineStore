import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // التحقق من الجلسة التجريبية في localStorage
      const demoUser = localStorage.getItem('demo_admin_user');
      if (demoUser) {
        const parsed = JSON.parse(demoUser);
        setUser(parsed);
      }
      setIsLoading(false);
      return;
    }

    // جلب الجلسة الحالية من Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // الاستماع لتغييرات حالة المصادقة
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // وضع الديمو للمعاينة السريعة
      if (email && password) {
        const mockAdminUser = {
          id: 'demo-admin-id',
          email,
          user_metadata: { role: 'admin' },
        } as unknown as User;
        setUser(mockAdminUser);
        localStorage.setItem('demo_admin_user', JSON.stringify(mockAdminUser));
        return { error: null };
      }
      return { error: new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      localStorage.removeItem('demo_admin_user');
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
