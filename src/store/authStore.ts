import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  userType: 'customer' | 'merchant' | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserType: (type: 'customer' | 'merchant' | null) => void;
  signOut: () => Promise<void>;
  checkUserType: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  userType: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setUserType: (userType) => set({ userType }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Ignore signOut errors and proceed with clearing local state
      console.warn('SignOut error (clearing local state anyway):', error);
    }
    set({ user: null, userType: null });
  },
  checkUserType: async () => {
    const { user } = get();
    if (!user) {
      set({ userType: null });
      return;
    }

    try {
      // Check if user is a merchant
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (merchant) {
        set({ userType: 'merchant' });
      } else {
        // Check if user is a client
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (client) {
          set({ userType: 'customer' });
        } else {
          set({ userType: 'customer' }); // Default to customer
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error);
      set({ userType: 'customer' }); // Default to customer
    }
  },
}));

// Initialize auth state - single source of truth
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);
  if (session?.user) {
    useAuthStore.getState().checkUserType();
  } else {
    useAuthStore.getState().setUserType(null);
  }
});