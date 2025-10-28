import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

        // 2️⃣ Mise à jour / création du profil
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            auth_id: user.id,
            email: user.email,
            role,
          },
          { onConflict: "auth_id" }
        );

        if (profileError) {
          console.warn("⚠️ Erreur profil:", profileError.message);
        } else {
          console.log("✅ Profil OK:", user.email);
        }

        // 3️⃣ Redirection selon rôle
        if (role === "merchant") {
          navigate("/merchant/dashboard");
        } else {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A6932] mx-auto mb-4"></div>
          <p className="text-gray-600">Finalisation de la connexion...</p>
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
