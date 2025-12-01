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
        // 🔹 Récupérer les paramètres de l'URL (peuvent être perdus après OAuth sur mobile)
        const urlRole = searchParams.get("role");
        const urlFlowToken = searchParams.get("flow_token");

        // 💾 Récupérer depuis localStorage si params URL vides (backup mobile)
        const pendingRole = localStorage.getItem('pending_auth_role');
        const pendingFlowToken = localStorage.getItem('pending_flow_token');

        // Utiliser les valeurs URL en priorité, sinon localStorage
        const effectiveRole = urlRole || pendingRole;
        const flowToken = urlFlowToken || pendingFlowToken;

        console.log("🔁 OAuth callback → rôle URL:", urlRole, "| localStorage:", pendingRole, "| effectif:", effectiveRole);
        console.log("🔁 OAuth callback → flow_token URL:", urlFlowToken, "| localStorage:", pendingFlowToken, "| effectif:", flowToken);

        // 🧹 Nettoyer le localStorage après lecture
        localStorage.removeItem('pending_auth_role');
        localStorage.removeItem('pending_flow_token');

        // 🔐 Vérifier si les tokens OAuth sont dans le hash (deep link mobile)
        const hash = window.location.hash;
        console.log("🔁 OAuth callback → hash présent:", !!hash && hash.includes('access_token'));

        if (hash && hash.includes('access_token')) {
          console.log("🔐 Tokens détectés dans le hash, extraction...");

          // Extraire les tokens du hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');

          console.log("🔐 access_token présent:", !!accessToken);
          console.log("🔐 refresh_token présent:", !!refreshToken);

          if (accessToken) {
            console.log("🔐 Appel setSession...");
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (sessionError) {
              console.error("🔐 Erreur setSession:", sessionError.message);
              setError("Erreur lors de l'établissement de la session: " + sessionError.message);
              setLoading(false);
              return;
            }
            console.log("🔐 ✅ Session établie via setSession");

            // Nettoyer le hash de l'URL pour éviter les problèmes
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }

        // 🔹 Attendre session valide
        let session = null;
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            session = data.session;
            break;
          }
          console.log("🔁 Attente session... tentative", i + 1);
          await new Promise((r) => setTimeout(r, 500));
        }

        if (!session) {
          setError("Impossible de récupérer la session après OAuth");
          setLoading(false);
          return;
        }

        const user = session.user;
        console.log("✅ Session récupérée pour:", user.email);

        // 1️⃣ Déterminer le rôle RÉEL (priorité: flow_states > URL/localStorage > défaut)
        let actualRole = effectiveRole || "client";

        if (flowToken) {
          // 🔹 Récupérer le rôle depuis flow_states (source fiable!)
          const { data: flowData, error: flowFetchError } = await supabase
            .from("flow_states")
            .select("desired_role")
            .eq("token", flowToken)
            .single();

          if (flowFetchError) {
            console.warn("⚠️ Erreur récupération flow_state:", flowFetchError.message);
          } else if (flowData?.desired_role) {
            actualRole = flowData.desired_role;
            console.log("✅ Rôle récupéré depuis flow_states:", actualRole);
          }

          // 🔹 Marquer le flow_state comme utilisé
          await supabase
            .from("flow_states")
            .update({ auth_user_id: user.id, used: true })
            .eq("token", flowToken);
        }

        console.log("🎯 Rôle final utilisé:", actualRole);

        // 2️⃣ Mise à jour / création du profil avec le BON rôle
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            auth_id: user.id,
            email: user.email,
            role: actualRole,
          },
          { onConflict: "auth_id" }
        );

        if (profileError) {
          console.warn("⚠️ Erreur profil:", profileError.message);
        } else {
          console.log("✅ Profil créé/mis à jour avec rôle:", actualRole);
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

        // 4️⃣ Redirection selon rôle ET complétude du profil
        setIsRedirecting(true);
        if (actualRole === "merchant") {
          console.log("🏪 Redirection marchand → /merchant/dashboard");
          navigate("/merchant/dashboard");
        } else if (actualRole === "client") {
          // ✅ Vérifier si le profil client est complet
          if (!profileData?.first_name || !profileData?.last_name) {
            console.log("⚠️ Profil incomplet → redirection vers /customer/auth");
            navigate("/customer/auth");
          } else {
            console.log("✅ Profil complet → redirection vers /offers");
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