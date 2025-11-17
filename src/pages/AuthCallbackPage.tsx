import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const role = searchParams.get("role") || "client";
        const flowToken = searchParams.get("flow_token");
        console.log("🔁 OAuth callback → rôle:", role, "| flow_token:", flowToken);

        // 🔹 attendre session valide
        let session = null;
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            session = data.session;
            break;
          }
          await new Promise((r) => setTimeout(r, 1000));
        }

        if (!session) {
          setError("Impossible de récupérer la session après OAuth");
          setLoading(false);
          return;
        }

        const user = session.user;
        console.log("✅ Session récupérée pour:", user.email);

        // 1️⃣ Si un flow_token est présent → associer à l'utilisateur
        if (flowToken) {
          await supabase
            .from("flow_states")
            .update({ auth_user_id: user.id, used: true })
            .eq("token", flowToken);
        }

        // 2️⃣ Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("role")
          .eq("auth_id", user.id)
          .maybeSingle();

        // 🔒 Garder le rôle existant pour empêcher changement non autorisé
        const finalRole = existingProfile?.role || role;

        if (existingProfile?.role && existingProfile.role !== role) {
          console.log(`🔒 Profil existant détecté avec rôle "${existingProfile.role}" - Conservation du rôle original (tentative de passage à "${role}" bloquée)`);
        }

        // 2️⃣ Mise à jour / création du profil
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            auth_id: user.id,
            email: user.email,
            role: finalRole,
          },
          { onConflict: "auth_id" }
        );

        if (profileError) {
          console.warn("⚠️ Erreur profil:", profileError.message);
        } else {
          console.log("✅ Profil OK:", user.email, "| Rôle:", finalRole);
        }

        // 3️⃣ Vérifier si le profil est complet (pour les clients)
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("role, first_name, last_name")
          .eq("auth_id", user.id)
          .single();

        if (fetchError) {
          console.warn("⚠️ Impossible de récupérer le profil:", fetchError.message);
        }

        // 4️⃣ Redirection selon rôle réel ET complétude du profil
        setIsRedirecting(true);
        // Utiliser le rôle réel du profil (profileData.role) au lieu du rôle de l'URL
        const actualRole = profileData?.role || finalRole;

        if (actualRole === "merchant") {
          navigate("/merchant/dashboard");
        } else if (actualRole === "client") {
          // ✅ Vérifier si le profil client est complet
          if (!profileData?.first_name || !profileData?.last_name) {
            console.log("⚠️ Profil incomplet → redirection vers /customer/auth");
            // Profil incomplet → rediriger vers la page d'auth où le modal s'affichera
            navigate("/customer/auth");
          } else {
            console.log("✅ Profil complet → redirection vers /offers");
            // Profil complet → redirection normale
            navigate("/offers");
          }
        } else {
          // Fallback
          navigate("/offers");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRedirecting ? "Redirection en cours..." : "Finalisation de la connexion..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de connexion</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-[#3A6932] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5226] transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;