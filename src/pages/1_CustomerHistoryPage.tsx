import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Reservation {
  id: string;
  status: string;
  quantity: number;
  created_at: string;
  offers: {
    title: string;
    image_url?: string;
    price_after: number;
    merchants: {
      company_name: string;
    };
  };
}

const statusLabels: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  pending: {
    label: "En attente",
    color: "text-yellow-600",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Confirmée",
    color: "text-blue-600",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  completed: {
    label: "Terminée",
    color: "text-green-600",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    label: "Annulée",
    color: "text-red-600",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const CustomerHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Récupération des réservations du client
  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("reservations")
        .select(`
          id,
          status,
          quantity,
          created_at,
          offers (
            title,
            image_url,
            price_after,
            merchants (
              company_name
            )
          )
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur récupération réservations :", error.message);
      } else {
        setReservations(data || []);
      }

      setLoading(false);
    };

    fetchReservations();
  }, [user]);

  // 🔐 Si non connecté
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p>Veuillez vous connecter pour voir votre historique de réservations.</p>
      </div>
    );
  }

  // ⏳ Loader
  if (loading) {
    return (
      <div className="p-6 text-center flex flex-col items-center">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-green-600" />
        <p>Chargement de vos réservations...</p>
      </div>
    );
  }

  // 🕳️ Aucun résultat
  if (reservations.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-2">Aucune réservation pour le moment.</p>
        <Link to="/offers/map" className="text-green-600 underline">
          Explorer les offres
        </Link>
      </div>
    );
  }

  // 🧾 Liste des réservations
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-green-600" /> Historique de mes réservations
      </h1>

      <div className="space-y-4">
        {reservations.map((res) => {
          const info = statusLabels[res.status] || statusLabels.pending;
          return (
            <div
              key={res.id}
              className="flex items-center gap-4 bg-white shadow-sm border rounded-xl p-4 hover:shadow-md transition"
            >
              {/* Image de l'offre */}
              <img
                src={
                  res.offers?.image_url ||
                  "https://placehold.co/80x80?text=Offre"
                }
                alt={res.offers?.title || "Offre"}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />

              {/* Détails réservation */}
              <div className="flex-1">
                <h2 className="font-semibold text-lg">
                  {res.offers?.title || "Offre supprimée"}
                </h2>
                <p className="text-sm text-gray-600">
                  {res.offers?.merchants?.company_name || "Commerçant inconnu"}
                </p>

                <div className="mt-1 text-sm text-gray-500">
                  Quantité : {res.quantity} | Prix unitaire :{" "}
                  <span className="text-green-600 font-medium">
                    {res.offers?.price_after?.toFixed(2)} €
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(res.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Statut */}
              <div className="text-right flex flex-col items-end">
                <div className={`flex items-center gap-1 ${info.color}`}>
                  {info.icon}
                  <span className="font-medium">{info.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerHistoryPage;
