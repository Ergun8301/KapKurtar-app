import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Navigation, Heart, Star } from 'lucide-react';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  price_before: number;
  price_after: number;
  quantity: number;
  available_from: string;
  available_until: string;
  merchant_id: string;
  is_active: boolean;
}

interface Merchant {
  id: string;
  business_name: string;
  logo_url: string | null;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
}

interface OfferDetailsModalProps {
  offer: Offer;
  merchant: Merchant;
  merchantOffers: Offer[];
  onClose: () => void;
  onOfferChange: (offer: Offer) => void;
  onReserve: (offer: Offer) => void;
  isAuthenticated: boolean;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({
  offer,
  merchant,
  merchantOffers,
  onClose,
  onOfferChange,
  onReserve,
  isAuthenticated
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Animation lors du changement d'offre
  useEffect(() => {
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 300);
    return () => clearTimeout(timer);
  }, [offer.id]);

  // Calcul du temps restant
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(offer.available_until);
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return { text: 'Expiré', percentage: 0, color: 'red' };

    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Calcul du pourcentage (basé sur la durée totale)
    const start = new Date(offer.available_from);
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const percentage = Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100));

    // Couleur selon le pourcentage restant
    let color = 'green';
    if (percentage < 33) color = 'red';
    else if (percentage < 66) color = 'orange';

    // Format du texte
    let text = '';
    if (diffDays >= 2) {
      text = `${diffDays} jours ${diffHours % 24}h`;
    } else if (diffDays === 1) {
      text = `1 jour ${diffHours % 24}h`;
    } else if (diffHours >= 1) {
      text = `${diffHours}h ${diffMinutes % 60}min`;
    } else if (diffMinutes >= 10) {
      text = `${diffMinutes} min`;
    } else {
      text = `${diffMinutes} min`;
      // Clignotant si < 10 min (géré en CSS)
    }

    return { text, percentage, color };
  };

  const timeInfo = getTimeRemaining();

  // Réduction
  const discount = Math.round(((offer.price_before - offer.price_after) / offer.price_before) * 100);

  // Gestion du bouton GPS
  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${merchant.latitude},${merchant.longitude}`,
      '_blank'
    );
  };

  // Gestion de la réservation
  const handleReserveClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      onReserve(offer);
    }
  };

  // Filtrer les autres offres (enlever l'offre actuelle)
  const otherOffers = merchantOffers.filter(o => o.id !== offer.id && o.is_active);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          {/* Header Marchand - Ligne horizontale */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {merchant.logo_url ? (
                  <img
                    src={merchant.logo_url}
                    alt={merchant.business_name}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg md:text-xl border-2 border-white shadow-md">
                    {merchant.business_name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Infos Marchand */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                  {merchant.business_name}
                </h2>

                {/* Avis - Visuel uniquement (pas fonctionnel) */}
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-gray-300 text-gray-300" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">Bientôt disponible</span>
                </div>

                {/* Adresse & Téléphone - Sur mobile en dessous */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{merchant.address}</span>
                  </div>
                  {merchant.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{merchant.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bouton GPS Itinéraire */}
              <button
                onClick={handleNavigate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md text-sm font-medium"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">Itinéraire</span>
              </button>
            </div>
          </div>

          {/* Corps du modal - Produit Principal */}
          <div className={`p-6 transition-opacity duration-300 ${isChanging ? 'opacity-0' : 'opacity-100'}`}>
            <div className="grid md:grid-cols-[40%_60%] gap-6">
              {/* Photo du produit - Gauche sur desktop, haut sur mobile */}
              <div className="relative">
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-64 md:h-80 object-cover rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-gray-400 text-lg">Pas d'image</span>
                  </div>
                )}

                {/* Badge réduction */}
                {discount > 0 && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    -{discount}%
                  </div>
                )}

                {/* Icône Favoris - Visuel uniquement */}
                <button
                  className="absolute top-3 left-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all cursor-not-allowed"
                  title="Bientôt disponible"
                >
                  <Heart className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Infos Produit - Droite sur desktop */}
              <div className="flex flex-col">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {offer.title}
                </h3>

                <p className="text-gray-600 mb-4 flex-grow">
                  {offer.description}
                </p>

                {/* Prix */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl md:text-4xl font-bold text-green-600">
                    {offer.price_after.toFixed(2)}€
                  </span>
                  {offer.price_before > offer.price_after && (
                    <span className="text-xl text-gray-400 line-through">
                      {offer.price_before.toFixed(2)}€
                    </span>
                  )}
                </div>

                {/* Timer & Stock - Format compact avec barre */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        timeInfo.percentage < 10 ? 'animate-pulse text-red-600' :
                        timeInfo.color === 'red' ? 'text-red-600' :
                        timeInfo.color === 'orange' ? 'text-orange-500' :
                        'text-green-600'
                      }`}>
                        ⏰ {timeInfo.text} restant{timeInfo.text !== 'Expiré' ? 'es' : ''}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      📦 Stock: <span className="font-semibold">{offer.quantity}</span>
                    </span>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        timeInfo.color === 'green' ? 'bg-green-500' :
                        timeInfo.color === 'orange' ? 'bg-orange-500' :
                        'bg-red-500'
                      } ${timeInfo.percentage < 10 ? 'animate-pulse' : ''}`}
                      style={{ width: `${timeInfo.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Bouton Réserver */}
                <button
                  onClick={handleReserveClick}
                  disabled={offer.quantity === 0 || timeInfo.percentage === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {offer.quantity === 0 ? '❌ Rupture de stock' :
                   timeInfo.percentage === 0 ? '⏰ Offre expirée' :
                   '🛒 RÉSERVER MAINTENANT'}
                </button>
              </div>
            </div>

            {/* Section Autres Produits */}
            {otherOffers.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🛍️ Autres produits disponibles
                  <span className="text-sm font-normal text-gray-500">({otherOffers.length})</span>
                </h4>

                {/* Grille responsive */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {otherOffers.map(otherOffer => {
                    const otherTimeInfo = (() => {
                      const now = new Date();
                      const end = new Date(otherOffer.available_until);
                      const start = new Date(otherOffer.available_from);
                      const diffMs = end.getTime() - now.getTime();

                      if (diffMs <= 0) return { text: 'Expiré', percentage: 0, color: 'red' };

                      const totalDuration = end.getTime() - start.getTime();
                      const elapsed = now.getTime() - start.getTime();
                      const percentage = Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100));

                      let color = 'green';
                      if (percentage < 33) color = 'red';
                      else if (percentage < 66) color = 'orange';

                      const diffMinutes = Math.floor(diffMs / 60000);
                      const diffHours = Math.floor(diffMinutes / 60);

                      let text = diffHours >= 1 ? `${diffHours}h` : `${diffMinutes}min`;

                      return { text, percentage, color };
                    })();

                    return (
                      <div
                        key={otherOffer.id}
                        onClick={() => {
                          setIsChanging(true);
                          setTimeout(() => {
                            onOfferChange(otherOffer);
                          }, 150);
                        }}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                      >
                        {/* Image */}
                        <div className="relative h-32 overflow-hidden">
                          {otherOffer.image_url ? (
                            <img
                              src={otherOffer.image_url}
                              alt={otherOffer.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">Pas d'image</span>
                            </div>
                          )}

                          {/* Barre colorée en haut */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                            <div
                              className={`h-full ${
                                otherTimeInfo.color === 'green' ? 'bg-green-500' :
                                otherTimeInfo.color === 'orange' ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${otherTimeInfo.percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Infos */}
                        <div className="p-3">
                          <h5 className="font-semibold text-sm text-gray-900 truncate mb-1">
                            {otherOffer.title}
                          </h5>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-lg font-bold text-green-600">
                              {otherOffer.price_after.toFixed(2)}€
                            </span>
                            {otherOffer.price_before > otherOffer.price_after && (
                              <span className="text-xs text-gray-400 line-through">
                                {otherOffer.price_before.toFixed(2)}€
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className={`font-medium ${
                              otherTimeInfo.color === 'red' ? 'text-red-600' :
                              otherTimeInfo.color === 'orange' ? 'text-orange-500' :
                              'text-green-600'
                            }`}>
                              ⏰ {otherTimeInfo.text}
                            </span>
                            <span>📦 {otherOffer.quantity}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Connexion */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black/70 z-[2100] flex items-center justify-center p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Connexion requise
              </h3>
              <p className="text-gray-600">
                Connectez-vous pour :
              </p>
            </div>

            {/* Avantages */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Réserver des offres</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Recevoir des notifications</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <span className="text-green-500 text-xl">✓</span>
                <span>Suivre vos réservations</span>
              </div>
            </div>

            {/* Boutons */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/customer/auth'}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all"
              >
                Plus tard
              </button>
            </div>

            {/* Lien Professionnel */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-2">
                💼 Vous êtes commerçant ?
              </p>
              <a
                href="/merchant/auth"
                className="text-green-600 hover:text-green-700 font-semibold text-sm underline"
              >
                Rejoignez SEPET gratuitement
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
