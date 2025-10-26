import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { logoutNoNav } from "../lib/logout"; // ✅ inchangé

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
      // 🔍 1. On vérifie si l'utilisateur est un marchand via la table merchants (cas legacy)
      const { data: merchant } = await supabase
        .from("merchants")
        .select("id")
        .eq("profile_id", user.id) // ✅ vérifie via profile_id (pas id direct)
        .maybeSingle();

      if (merchant) {
        set({ userType: "merchant" });
        return;
      }

      // 🔍 2. Sinon on regarde le rôle dans la table profiles
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la détection du rôle utilisateur :", error);
        set({ userType: "customer" }); // fallback par défaut
      } else if (profile?.role === "merchant") {
        set({ userType: "merchant" });
      } else if (profile?.role === "client") {
        set({ userType: "customer" });
      } else {
        set({ userType: "customer" }); // fallback
      }
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
  } else {
    useAuthStore.getState().setUserType(null);
  }
});
