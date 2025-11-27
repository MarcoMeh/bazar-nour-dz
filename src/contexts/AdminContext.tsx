import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isStoreOwner: boolean;
  storeId: string | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStoreOwner, setIsStoreOwner] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Check user role and store association
  const checkUserRole = async (authUserId: string | undefined) => {
    if (!authUserId) {
      setIsAdmin(false);
      setIsStoreOwner(false);
      setStoreId(null);
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
      // Admins might not have a store_id, or could manage all.
      // For now, keep storeId null for admins unless they also own a store?
      // Usually admins see everything.
      return;
    }

    // 2. Check Profiles table for role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUserId)
      .single();

    if (profileData && !profileError) {
      if (profileData.role === 'store_owner') {
        setIsStoreOwner(true);
        // Fetch store ID
        const { data: storeData } = await supabase
          .from("stores")
          .select("id")
          .eq("owner_id", authUserId)
          .single();

        if (storeData) {
          setStoreId(storeData.id);
        }
      } else if (profileData.role === 'admin') {
        setIsAdmin(true);
      }
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkUserRole(currentUser?.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      checkUserRole(currentUser?.id);
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
    setIsStoreOwner(false);
    setStoreId(null);
  };

  return (
    <AdminContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isStoreOwner,
        storeId,
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
