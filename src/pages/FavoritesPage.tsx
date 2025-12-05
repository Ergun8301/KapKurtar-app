import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Favorite {
  id: string;
  merchant_id: string;
  merchants: {
    company_name: string;
    logo_url: string | null;
  };
}

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavorites = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          merchant_id,
          merchants (
            company_name,
            logo_url
          )
        `)
        .eq("client_id", user.id);

      if (error) {
        console.error("Erreur récupération favoris:", error.message);
      } else {
        setFavorites(data || []);
      }

      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Favorilerinizi görmek için giriş yapın ❤️</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Favorileriniz yükleniyor...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="p-6 text-center">
        <p>Henüz favoriniz yok.</p>
        <Link to="/offers/map" className="text-[#00A690] underline">
          İşletmeleri keşfedin
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500" /> Favorilerim
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="p-4 border rounded-2xl shadow hover:shadow-lg transition"
          >
            <img
              src={fav.merchants.logo_url || "https://placehold.co/100x100"}
              alt={fav.merchants.company_name}
              className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
            />
            <h2 className="text-center font-semibold text-lg">
              {fav.merchants.company_name}
            </h2>
            <div className="flex justify-center mt-2">
              <Link
                to={`/merchant/${fav.merchant_id}`}
                className="text-sm text-[#00A690] flex items-center gap-1 hover:underline"
              >
                <MapPin className="w-4 h-4" />
                Detayları gör
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
