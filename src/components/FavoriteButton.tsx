import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

interface FavoriteButtonProps {
  merchantId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ merchantId }) => {
  const { user } = useAuth(); // Récupère l'utilisateur connecté
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérifie si ce marchand est déjà dans les favoris du client
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("client_id", user.id)
        .eq("merchant_id", merchantId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erreur de vérification favori:", error.message);
      }
      setIsFavorite(!!data);
    };

    checkFavorite();
  }, [user, merchantId]);

  // Ajoute ou supprime le favori
  const toggleFavorite = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour ajouter aux favoris.");
      return;
    }

    setLoading(true);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("client_id", user.id)
        .eq("merchant_id", merchantId);

      if (error) {
        console.error("Erreur suppression favori:", error.message);
      } else {
        setIsFavorite(false);
      }
    } else {
      const { error } = await supabase.from("favorites").insert([
        {
          client_id: user.id,
          merchant_id: merchantId,
        },
      ]);

      if (error) {
        console.error("Erreur ajout favori:", error.message);
      } else {
        setIsFavorite(true);
      }
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full ${
        isFavorite ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"
      } hover:scale-105 transition-transform duration-150`}
      title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? "fill-white" : "fill-transparent"}`}
      />
    </button>
  );
};

export default FavoriteButton;
