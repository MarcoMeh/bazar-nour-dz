import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the user exists in the admins table OR is a store owner
  const checkIfAdmin = async (authUserId: string | undefined) => {
    if (!authUserId) {
      setIsAdmin(false);
      return;
    }

    // 1. Check Admins table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single();

    if (adminData && !adminError) {
      setIsAdmin(true);
      return;
    }

    // 2. Check Store Owners table
    const { data: ownerData, error: ownerError } = await supabase
      .from("store_owners")
      .select("id")
      .eq("user_id", authUserId)
      .single();

    if (ownerData && !ownerError) {
      setIsAdmin(true);
      return;
    }

    setIsAdmin(false);
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkIfAdmin(currentUser?.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkIfAdmin(currentUser?.id);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        session,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
