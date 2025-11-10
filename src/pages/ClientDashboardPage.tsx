import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Navigation, 
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import { useClientNotifications } from '../hooks/useClientNotifications';

interface Reservation {
  reservation_id: string;
  offer_id: string;
  offer_title: string;
  offer_image_url: string;
  offer_price: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  available_until: string;
  merchant_id: string;
  merchant_name: string;
  merchant_logo_url: string;
  merchant_phone: string;
  merchant_street: string;
  merchant_city: string;
  merchant_postal_code: string;
  merchant_lat: number;
  merchant_lng: number;
}

const ClientDashboardPage = () => {
  useClientNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) {
        navigate('/customer/auth');
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_id', user.id)
          .eq('role', 'client')
          .maybeSingle();

        if (error) throw error;
        if (profile) {
          setClientId(profile.id);
        }
      } catch (error) {
        console.error('Erreur récupération profil:', error);
      }
    };

    fetchClientId();
  }, [user, navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!clientId) return;

      try {
        const { data, error } = await supabase.rpc('get_client_reservations', {
          p_client_id: clientId
        });

        if (error) throw error;
        setReservations(data || []);
      } catch (error) {
        console.error('Erreur chargement réservations:', error);
        setToast({ message: '❌ Erreur chargement réservations', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [clientId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleGetDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const getTimeRemaining = (until: string) => {
    const diff = new Date(until).getTime() - Date.now();
    if (diff <= 0) return 'Expirée';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}j ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes} min`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const expiredReservations = reservations.filter(r => r.status === 'expired');

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const isPending = reservation.status === 'pending';
    const isCompleted = reservation.status === 'completed';
    const isExpired = reservation.status === 'expired';

    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
        isPending ? 'border-orange-200' : 
        isCompleted ? 'border-green-200' : 
        'border-gray-200'
      }`}>
        <div className="flex">
          {reservation.offer_image_url && (
            <img
              src={reservation.offer_image_url}
              alt={reservation.offer_title}
              className="w-24 h-24 object-cover flex-shrink-0"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">
                  {reservation.offer_title}
                </h3>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {reservation.merchant_name}
                </p>
              </div>
              
              {isPending && (
                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full">
                  En attente
                </span>
              )}
              {isCompleted && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Récupéré
                </span>
              )}
              {isExpired && (
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Expirée
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-bold text-green-600">
                {reservation.total_price.toFixed(2)}€
              </span>
              <span className="text-sm text-gray-600">
                ({reservation.offer_price.toFixed(2)}€ × {reservation.quantity})
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Réservé le {formatDate(reservation.created_at)}
              </span>
              {isPending && (
                <span className="flex items-center gap-1 text-orange-600 font-semibold">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(reservation.available_until)} restantes
                </span>
              )}
            </div>

            {reservation.merchant_street && (
              <p className="text-xs text-gray-600 mb-3">
                📍 {reservation.merchant_street}, {reservation.merchant_city}
              </p>
            )}

            {isPending && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleGetDirections(reservation.merchant_lat, reservation.merchant_lng)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Itinéraire
                </button>
                {reservation.merchant_phone && (
                  <a
                    href={`tel:${reservation.merchant_phone}`}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Mon Profil</h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-green-600" />
            Mes Réservations ({reservations.length})
          </h2>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune réservation
              </h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore réservé d'offres
              </p>
              <button
                onClick={() => navigate('/offers')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                Découvrir les offres
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {pendingReservations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    En attente ({pendingReservations.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}

              {completedReservations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Récupérées ({completedReservations.length})
                  </h3>
                  <div className="space-y-3">
                    {completedReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}

              {expiredReservations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-gray-600" />
                    Expirées ({expiredReservations.length})
                  </h3>
                  <div className="space-y-3 opacity-60">
                    {expiredReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardPage;