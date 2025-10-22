import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { logoutNoNav } from '../lib/logout'; // ✅ ajouté

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

  // ✅ version unifiée de la déconnexion
  signOut: async () => {
    try {
      await logoutNoNav(); // déconnexion + clear complet sans navigate
    } catch (error) {
      console.warn('⚠️ Erreur de signOut (ignorée) :', error);
    }

    set({
      user: null,
      userType: null,
      loading: false,
    });
  },

  checkUserType: async () => {
    const { user } = get();
    if (!user) {
      set({ userType: null });
      return;
    }

    try {
      // 🔍 Vérifie si utilisateur est un marchand
      const { data: merchant } = await supabase
        .from('merchants')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (merchant) {
        set({ userType: 'merchant' });
        return;
      }

      // 🔍 Sinon vérifie si client
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (client) {
        set({ userType: 'customer' });
      } else {
        set({ userType: 'customer' }); // par défaut
      }
    } catch (error) {
      console.error('Erreur lors de la détection du type utilisateur :', error);
      set({ userType: 'customer' }); // fallback
    }
  },
}));

// ✅ Initialisation automatique du store en fonction de la session Supabase
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);

  if (session?.user) {
    useAuthStore.getState().checkUserType();
  } else {
    useAuthStore.getState().setUserType(null);
  }
});
