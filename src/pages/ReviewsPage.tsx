import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Star, MessageCircle, Loader2 } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  merchants: {
    company_name: string;
  };
}

const ReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantId, setMerchantId] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  // 🔄 Charger les avis déjà laissés par le client
  useEffect(() => {
    if (!user) return;
    const fetchReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          comment,
          created_at,
          merchants (
            company_name
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Erreur chargement avis :", error.message);
      else setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, [user]);

  // ✍️ Soumettre un nouvel avis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !merchantId || rating === 0) {
      alert("Veuillez sélectionner un commerçant et une note.");
      return;
    }

    const { error } = await supabase.from("reviews").insert([
      {
        client_id: user.id,
        merchant_id: merchantId,
        rating,
        comment,
      },
    ]);

    if (error) {
      console.error("Erreur ajout avis :", error.message);
      alert("Une erreur est survenue.");
    } else {
      alert("Merci pour votre avis !");
      setRating(0);
      setComment("");
      setMerchantId("");
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Veuillez vous connecter pour laisser ou consulter vos avis.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600 mb-2" />
        <p>Chargement de vos avis...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-blue-600" /> Mes avis
      </h1>

      {/* Formulaire de nouvel avis */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-4 mb-6"
      >
        <h2 className="font-medium mb-2 text-gray-700">Laisser un avis</h2>

        <div className="flex flex-col gap-3 mb-4">
          <input
            type="text"
            placeholder="ID du commerçant (temporaire)"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="border rounded-lg p-2"
          />

          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Star
                key={num}
                onClick={() => setRating(num)}
                className={`w-6 h-6 cursor-pointer ${
                  rating >= num ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <textarea
            placeholder="Votre commentaire..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border rounded-lg p-2 h-24"
          />

          <button
            type="submit"
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Envoyer l’avis
          </button>
        </div>
      </form>

      {/* Liste des avis existants */}
      {reviews.length === 0 ? (
        <p className="text-gray-600 text-center">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-gray-800">
                  {rev.merchants?.company_name || "Commerçant inconnu"}
                </h2>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-4 h-4 ${
                        rev.rating >= n
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1">{rev.comment}</p>
              <p className="text-xs text-gray-400">
                {new Date(rev.created_at).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
