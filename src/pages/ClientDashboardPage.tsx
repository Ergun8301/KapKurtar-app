import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Navigation, 
  Phone,
  MapPin,
  Calendar,
  Clock,
  Archive,
  X,
  CheckCircle,
  XCircle
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
  status: string;
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
  useClientNotifications(); // Pour les notifications de la cloche
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  
  // Ref pour le canal Realtime des réservations uniquement
  const reservationsChannelRef = useRef<any>(null);

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

  // Gestion Realtime PROPRE - Réservations seulement
  // (les notifications sont gérées par useClientNotifications)
  useEffect(() => {
    if (!clientId) return;

    // Nettoyer l'ancien canal s'il existe
    if (reservationsChannelRef.current) {
      supabase.removeChannel(reservationsChannelRef.current);
      reservationsChannelRef.current = null;
    }

    console.log('🔌 Connexion Realtime RÉSERVATIONS:', clientId);

    // Créer un nouveau canal pour les réservations
    const reservationsChannel = supabase
      .channel(`client-reservations-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `client_id=eq.${clientId}`,
        },
        async (payload) => {
          console.log('🔔 Changement réservation:', payload);
          // Recharger les réservations
          const { data } = await supabase.rpc('get_client_reservations', {
            p_client_id: clientId
          });
          if (data) setReservations(data);
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut Realtime RÉSERVATIONS:', status);
      });

    reservationsChannelRef.current = reservationsChannel;

    // Cleanup à la déconnexion
    return () => {
      console.log('🔌 Déconnexion Realtime RÉSERVATIONS');
      if (reservationsChannelRef.current) {
        supabase.removeChannel(reservationsChannelRef.current);
        reservationsChannelRef.current = null;
      }
    };
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

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const { data, error } = await supabase.rpc('cancel_reservation', {
        p_reservation_id: reservationId
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (!result.success) {
        setToast({ message: result.message, type: 'error' });
        return;
      }

      // Mettre à jour localement
      setReservations(prev =>
        prev.map(r =>
          r.reservation_id === reservationId ? { ...r, status: 'cancelled' } : r
        )
      );

      setCancelConfirm(null);
      setToast({ message: '✅ Réservation annulée, stock libéré', type: 'success' });
    } catch (error) {
      console.error('Erreur annulation:', error);
      setToast({ message: '❌ Erreur lors de l\'annulation', type: 'error' });
    }
  };

  const handleArchiveReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'archived' })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(prev => prev.filter(r => r.reservation_id !== reservationId));

      setToast({ message: '✅ Réservation archivée', type: 'success' });
    } catch (error) {
      console.error('Erreur archivage:', error);
      setToast({ message: '❌ Erreur lors de l\'archivage', type: 'error' });
    }
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
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
    const isPending = reservation.status === 'pending';
    const isCompleted = reservation.status === 'completed';
    const isExpired = reservation.status === 'expired';
    const isCancelled = reservation.status === 'cancelled';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Mobile Layout */}
        <div className="md:hidden p-3">
          {/* Produit */}
          <div className="flex gap-3 mb-3">
            {reservation.offer_image_url && (
              <img
                src={reservation.offer_image_url}
                alt={reservation.offer_title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                {reservation.offer_title}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-green-600">{reservation.total_price.toFixed(2)}€</span>
                <span className="text-xs text-gray-400">×{reservation.quantity}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(reservation.created_at)}
                </div>
                {isPending && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(reservation.available_until)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {isCompleted && (
            <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Réservation récupérée</span>
            </div>
          )}
          {isExpired && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Réservation expirée</span>
            </div>
          )}
          {isCancelled && (
            <div className="mb-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <X className="w-4 h-4" />
              <span className="font-medium">Réservation annulée</span>
            </div>
          )}

          {/* Marchand compact */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            {reservation.merchant_logo_url ? (
              <img
                src={reservation.merchant_logo_url}
                alt={reservation.merchant_name}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-tilkapp-green flex items-center justify-center text-white font-bold text-xs">
                {reservation.merchant_name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-gray-900 truncate">{reservation.merchant_name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{reservation.merchant_city}</span>
              </p>
            </div>
          </div>

          {/* Actions */}
          {isPending ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleGetDirections(reservation.merchant_lat, reservation.merchant_lng)}
                className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-700 font-medium">Itin.</span>
              </button>
              {reservation.merchant_phone && (
                <a
                  href={`tel:${reservation.merchant_phone}`}
                  className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-700 font-medium">Appel</span>
                </a>
              )}
              <button
                onClick={() => setCancelConfirm(reservation.reservation_id)}
                className="flex flex-col items-center justify-center gap-1 p-2 bg-white hover:bg-gray-50 border border-red-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-600" />
                <span className="text-xs text-gray-700 font-medium">Annuler</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleArchiveReservation(reservation.reservation_id)}
              className="w-full flex items-center justify-center gap-1 p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
            >
              <Archive className="w-4 h-4 text-gray-600" />
              <span className="text-xs text-gray-700 font-medium">Archiver</span>
            </button>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:p-4">
          {/* GAUCHE : Produit */}
          <div className="col-span-4 flex gap-3">
            {reservation.offer_image_url && (
              <img
                src={reservation.offer_image_url}
                alt={reservation.offer_title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                  {reservation.offer_title}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-bold text-green-600">{reservation.total_price.toFixed(2)}€</span>
                  <span className="text-xs text-gray-400">{reservation.offer_price.toFixed(2)}€ × {reservation.quantity}</span>
                </div>
              </div>
              <div className="space-y-0.5 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(reservation.created_at)}
                </div>
                {isPending && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    <Clock className="w-3 h-3" />
                    {getTimeRemaining(reservation.available_until)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CENTRE : Actions */}
          <div className="col-span-3 flex flex-col gap-1.5 justify-center px-3 border-l border-r border-gray-100">
            {isPending ? (
              <>
                <button
                  onClick={() => handleGetDirections(reservation.merchant_lat, reservation.merchant_lng)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                >
                  <Navigation className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700 font-medium">Itinéraire</span>
                </button>
                {reservation.merchant_phone && (
                  <a
                    href={`tel:${reservation.merchant_phone}`}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700 font-medium">Appeler</span>
                  </a>
                )}
                <button
                  onClick={() => setCancelConfirm(reservation.reservation_id)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-red-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700 font-medium">Annuler</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => handleArchiveReservation(reservation.reservation_id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                <Archive className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700 font-medium">Archiver</span>
              </button>
            )}
          </div>

          {/* DROITE : Marchand */}
          <div className="col-span-5 flex items-center gap-3 pl-2">
            {reservation.merchant_logo_url ? (
              <img
                src={reservation.merchant_logo_url}
                alt={reservation.merchant_name}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 flex-shrink-0"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-tilkapp-green flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {reservation.merchant_name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 mb-1 truncate">{reservation.merchant_name}</p>
              {reservation.merchant_city && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{reservation.merchant_city}</span>
                </p>
              )}
              {reservation.merchant_phone && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{reservation.merchant_phone}</span>
                </p>
              )}
              {reservation.merchant_street && (
                <p className="text-xs text-gray-400 line-clamp-1">
                  {reservation.merchant_street}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge Desktop */}
          {isCompleted && (
            <div className="col-span-12 -mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Réservation récupérée avec succès</span>
            </div>
          )}
          {isExpired && (
            <div className="col-span-12 -mt-2 flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Réservation expirée - Stock libéré automatiquement</span>
            </div>
          )}
          {isCancelled && (
            <div className="col-span-12 -mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
              <X className="w-4 h-4" />
              <span className="font-medium">Réservation annulée - Stock libéré</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tilkapp-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-tilkapp-green' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <X className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Annuler la réservation ?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Le stock sera libéré et le marchand sera notifié. Vous pourrez réserver à nouveau si vous changez d'avis.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
              >
                Non, garder
              </button>
              <button
                onClick={() => handleCancelReservation(cancelConfirm)}
                className="flex-1 px-4 py-2.5 bg-tilkapp-green hover:bg-tilkapp-orange text-white rounded-lg font-medium transition-colors text-sm"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-700 rounded-full flex items-center justify-center text-xl text-white font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mon Compte</h1>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Réservations */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Mes Réservations ({reservations.length})
          </h2>

          {reservations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune réservation
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Vous n'avez pas encore réservé d'offres
              </p>
              <button
                onClick={() => navigate('/offers')}
                className="px-6 py-2.5 bg-tilkapp-green hover:bg-tilkapp-orange text-white rounded-lg font-semibold transition-colors"
              >
                Découvrir les offres
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* En attente */}
              {pendingReservations.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    En attente ({pendingReservations.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}

              {/* Récupérées */}
              {completedReservations.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Récupérées ({completedReservations.length})
                  </h3>
                  <div className="space-y-3">
                    {completedReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}

              {/* Annulées */}
              {cancelledReservations.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <X className="w-4 h-4 text-green-600" />
                    Annulées ({cancelledReservations.length})
                  </h3>
                  <div className="space-y-3 opacity-75">
                    {cancelledReservations.map(reservation => (
                      <ReservationCard key={reservation.reservation_id} reservation={reservation} />
                    ))}
                  </div>
                </div>
              )}

              {/* Expirées */}
              {expiredReservations.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-gray-600" />
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