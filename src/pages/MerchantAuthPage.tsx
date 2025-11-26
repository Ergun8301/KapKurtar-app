import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Store } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuthFlow } from "../hooks/useAuthFlow";

type AuthMode = "login" | "register";

const MerchantAuthPage = () => {
  const navigate = useNavigate();
  const {
    user,
    role,
    profile,
    loading: authLoading,
    initialized,
    refetchProfile,
  } = useAuthFlow();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // ---------- Redirection ----------
  const goToMerchantHome = async () => {
    try {
      if (!user) return navigate("/merchant/dashboard");
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (prof?.id) {
        const { data: merch } = await supabase
          .from("merchants")
          .select("id")
          .eq("profile_id", prof.id)
          .maybeSingle();

        if (merch?.id) {
          const { data: offers } = await supabase
            .from("offers")
            .select("id")
            .eq("merchant_id", merch.id)
            .limit(1);

          if (!offers || offers.length === 0) {
            navigate("/merchant/add-product");
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Erreur redirection merchant:", err);
    }
    navigate("/merchant/dashboard");
  };

  useEffect(() => {
    if (!initialized || !user) return;
    if (role === "merchant") goToMerchantHome();
    else if (role === "client") navigate("/offers");
  }, [initialized, user, role, profile, navigate]);

  // ---------- Formulaire ----------
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Auth e-mail / password ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.user) {
          await refetchProfile();
          await goToMerchantHome();
        }
      } else {
        // ----------- REGISTER -----------
        if (formData.password.length < 6)
          throw new Error("Şifre en az 6 karakter içermelidir");

        // 🔹 Crée un flow_state avant signup
        const { data: flow, error: flowError } = await supabase
          .from("flow_states")
          .insert({ desired_role: "merchant" })
          .select("token")
          .single();

        if (flowError || !flow)
          throw flowError || new Error("Flow state oluşturulamadı");

        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                role: "merchant",
                flow_token: flow.token,
              },
            },
          });
        if (signUpError) throw signUpError;

        alert("✅ Hesabınızı doğrulamak için e-postanızı kontrol edin.");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Google OAuth marchand ----------
  const handleGoogleAuth = async () => {
    try {
      // 🔹 Crée un flow_state avec rôle marchand avant OAuth
      const { data: flow, error: flowError } = await supabase
        .from("flow_states")
        .insert({ desired_role: "merchant" })
        .select("token")
        .single();

      if (flowError || !flow)
        throw flowError || new Error("Flow state oluşturulamadı");

      console.log("🎟️ Flow token créé :", flow.token);

      // 🔹 Redirection Google avec rôle et token dans l'URL
      const redirectUrl = `${window.location.origin}/auth/callback?role=merchant&flow_token=${flow.token}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Erreur OAuth marchand :", err);
      setError((err as Error).message);
    }
  };

  // ---------- Loader ----------
  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="h-full overflow-hidden bg-[#FAFAF5] flex flex-col">
      <div className="flex-1 flex items-center justify-center py-4 px-4">
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-[#FF6B35] hover:text-[#e55a28] font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </button>

          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login"
                ? "İşletme Girişi"
                : "İşletme Kaydı"}
            </h1>
            <p className="text-gray-600 text-sm">
              {mode === "login"
                ? "Tekliflerinizi yönetin ve israfı azaltın"
                : "Satılmayan ürünlerinizi değerlendirin"}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-5 space-y-4">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-3 font-semibold rounded-xl ${
                  mode === "login"
                    ? "bg-white text-[#FF6B35] shadow-md"
                    : "text-gray-500"
                }`}
              >
                Giriş
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-3 font-semibold rounded-xl ${
                  mode === "register"
                    ? "bg-white text-[#FF6B35] shadow-md"
                    : "text-gray-500"
                }`}
              >
                Kayıt
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-base"
                    placeholder="isletme@ornek.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-base"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {mode === "login" && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/merchant/forgot-password")}
                      className="text-sm text-[#FF6B35] hover:text-[#e55a28] font-medium"
                    >
                      Şifremi unuttum?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF6B35] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#e55a28] transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Yükleniyor...
                  </div>
                ) : mode === "login" ? (
                  "Giriş Yap"
                ) : (
                  "Hesap Oluştur"
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantAuthPage;