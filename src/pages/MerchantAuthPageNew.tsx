import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Store,
  LogIn,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "../lib/supabaseClient";
import { useAuthFlow } from "../hooks/useAuthFlow";

type AuthMode = "login" | "register" | "forgot-password";

const MerchantAuthPageNew = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, initialized } = useAuthFlow();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });

  // ✅ Redirection automatique après login
  useEffect(() => {
    if (initialized && user && role) {
      if (role === "merchant") navigate("/merchant/dashboard");
      if (role === "client") navigate("/offers");
    }
  }, [initialized, user, role, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Email / Password Auth
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setSuccess("Connexion réussie ✅");
      } else if (mode === "register") {
        if (!formData.companyName.trim()) {
          throw new Error("Le nom du commerce est obligatoire");
        }
        if (formData.password.length < 6) {
          throw new Error("Le mot de passe doit comporter au moins 6 caractères");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: "merchant",
              company_name: formData.companyName,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("merchants").insert({
            profile_id: data.user.id,
            company_name: formData.companyName,
          });
        }
        setSuccess("Compte créé 🎉 Vérifiez votre e-mail pour confirmer.");
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          {
            redirectTo: `${window.location.origin}/merchant/auth`,
          }
        );
        if (error) throw error;
        setSuccess("E-mail de réinitialisation envoyé 📩");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Google OAuth pour commerçant
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/merchant/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (authLoading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center text-[#FF6B35] hover:text-orange-600 font-medium mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>

          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#FF6B35] rounded-lg flex items-center justify-center mr-3">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">SEPET Pro</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">
            {mode === "login" && "Connexion Commerçant"}
            {mode === "register" && "Créer un Compte"}
            {mode === "forgot-password" && "Réinitialiser le Mot de Passe"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {mode === "login"
              ? "Accédez à votre tableau de bord"
              : mode === "register"
              ? "Rejoignez SEPET et valorisez vos invendus"
              : "Entrez votre e-mail pour réinitialiser"}
          </p>
        </div>

        {/* Switch Login / Register */}
        {(mode === "login" || mode === "register") && (
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 font-medium ${
                mode === "login"
                  ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                  : "text-gray-500"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 font-medium ${
                mode === "register"
                  ? "text-[#FF6B35] border-b-2 border-[#FF6B35]"
                  : "text-gray-500"
              }`}
            >
              Inscription
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du commerce
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="Ex: Fırın Mehmet"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="commerce@example.com"
                required
              />
            </div>
          </div>

          {mode !== "forgot-password" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-[#FF6B35]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF6B35]"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot-password")}
                className="text-sm text-[#FF6B35] hover:text-orange-600"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6B35] text-white py-2 rounded-md font-medium hover:bg-orange-600 transition"
          >
            {isLoading
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : mode === "register"
              ? "Créer mon espace"
              : "Envoyer le lien"}
          </button>
        </form>

        {/* Google Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-2">Ou continuer avec</p>
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full border rounded-md py-2 hover:bg-gray-50 transition"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantAuthPageNew;
