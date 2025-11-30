import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { logoutNoNav } from "../lib/logout"; // ✅ inchangé
import { initPushNotifications } from "../services/pushNotifications";

interface AuthState {
  user: User | null;
  loading: boolean;
  userType: "customer" | "merchant" | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserType: (type: "customer" | "merchant" | null) => void;
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

  // ✅ Déconnexion unifiée
  signOut: async () => {
    try {
      await logoutNoNav(); // déconnexion + nettoyage complet sans navigation
    } catch (error) {
      console.warn("⚠️ Erreur de signOut (ignorée) :", error);
    }

    set({
      user: null,
      userType: null,
      loading: false,
    });
  },

  // ✅ Vérifie le rôle utilisateur via la table profiles
  checkUserType: async () => {
    const { user } = get();
    if (!user) {
      set({ userType: null });
      return;
    }

    try {
      // Récupère le profil de l'utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (!profile) {
        set({ userType: "customer" });
        return;
      }

      // Vérifie si l'utilisateur est un marchand via merchants.profile_id
      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (merchant) {
        set({ userType: "merchant" });
        return;
      }

      // Sinon, c'est un client
      set({ userType: "customer" });
    } catch (error) {
      console.error("Erreur lors de la détection du type utilisateur :", error);
      set({ userType: "customer" }); // fallback
    }
  },
}));

// ✅ Initialisation automatique en fonction de la session Supabase
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ?? null);
  useAuthStore.getState().setLoading(false);

  if (session?.user) {
    useAuthStore.getState().checkUserType();

    // Initialiser les push notifications après connexion
    initPushNotifications().catch((err) => {
      console.warn('⚠️ Erreur initialisation push notifications:', err);
    });
  } else {
    useAuthStore.getState().setUserType(null);
  }
});
