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
        const role = searchParams.get("role");

        if (!role || !["client", "merchant"].includes(role)) {
          setError("Paramètre de rôle invalide");
          setLoading(false);
          return;
        }

        // 🕒 Attente d'une session valide (Google OAuth)
        let retryCount = 0;
        const maxRetries = 10;
        let session = null;

        while (retryCount < maxRetries && !session) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            session = currentSession;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          retryCount++;
        }

        if (!session) {
          setError("Impossible de récupérer la session après OAuth");
          setLoading(false);
          return;
        }

        const user = session.user;
        console.log("✅ Session OAuth récupérée pour:", user.email);

        // ✅ Mettre à jour le rôle dans Supabase
        await supabase.rpc("set_role_for_me", { p_role: role });
        await supabase.from("profiles").update({ role }).eq("auth_id", user.id);

        // 🧩 Si rôle = marchand → créer profil marchand via Edge Function
        if (role === "merchant") {
          console.log("🧱 Vérification du profil marchand...");

          try {
            const token = session.access_token;
            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-merchant-profile`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  company_name: user.email || "Sans Nom",
                  email: user.email,
                }),
              }
            );

            const result = await response.json();
            if (result.success) {
              console.log("✅ Merchant créé via Edge Function:", result.merchant);
            } else {
              console.warn("⚠️ Edge Function n'a pas créé de merchant:", result.error);
            }
          } catch (edgeError) {
            console.error("❌ Erreur lors de la création du merchant:", edgeError);
          }

          // Redirection finale vers tableau de bord marchand
          navigate("/merchant/dashboard");
        } else {
          // Redirection finale vers les offres client
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
