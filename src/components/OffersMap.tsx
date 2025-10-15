import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { GeolocationButton } from './GeolocationButton';
import { useAuth } from '../hooks/useAuth';

interface OfferLocation {
  id: string;
  title: string;
  lat: number;
  lng: number;
  price: number;
  price_before?: number;
  distance_km?: string;
  image_url: string;
  discount: number;
  merchant_name?: string;
}

interface OffersMapProps {
  userLocation: { lat: number; lng: number } | null;
  offers: OfferLocation[];
  radiusKm: number;
  onRadiusChange: (radius: number) => void;
  onOfferClick: (offerId: string) => void;
  centerLat?: number;
  centerLng?: number;
  highlightOfferId?: string;
}

// Fix Leaflet default icon issue with Vite
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const highlightIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const offerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const isValidCoordinate = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const isValidLatLng = (lat: any, lng: any): boolean => {
  return isValidCoordinate(lat) && isValidCoordinate(lng) &&
         lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const LocationActivation: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Activez votre géolocalisation
      </h3>
      <p className="text-gray-600 mb-6">
        Pour voir les offres à proximité sur la carte, nous avons besoin de votre position.
      </p>

      {user && (
        <GeolocationButton
          userRole="client"
          userId={user.id}
          onSuccess={() => {
            window.location.reload();
          }}
          className="flex justify-center"
        />
      )}

      <p className="text-xs text-gray-500 mt-6">
        Votre position sera utilisée uniquement pour vous montrer les offres à proximité.
      </p>
    </div>
  );
};

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (isValidLatLng(center[0], center[1])) {
      map.setView(center, zoom);
    } else {
      map.setView([46.5, 3], 6);
    }
  }, [center, zoom, map]);

  return null;
};

export const OffersMap: React.FC<OffersMapProps> = ({
  userLocation,
  offers,
  radiusKm,
  onRadiusChange,
  onOfferClick,
  centerLat,
  centerLng,
  highlightOfferId
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.5, 3]);
  const [mapZoom, setMapZoom] = useState(6);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hasRequestedGeo, setHasRequestedGeo] = useState(false);

  useEffect(() => {
    if (isValidLatLng(centerLat, centerLng)) {
      setMapCenter([centerLat!, centerLng!]);
      setMapZoom(15);
    } else if (userLocation && isValidLatLng(userLocation.lat, userLocation.lng)) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setMapZoom(radiusKm <= 10 ? 13 : radiusKm <= 20 ? 11 : radiusKm <= 30 ? 10 : 9);
    } else {
      setMapCenter([46.5, 3]);
      setMapZoom(6);
    }
  }, [userLocation, radiusKm, centerLat, centerLng]);

  const radiusOptions = [10, 20, 30, 40, 50];

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter([latitude, longitude]);
        setMapZoom(13);
        setHasRequestedGeo(true);
        setIsGeolocating(false);
      },
      (error) => {
        let errorMessage = 'Impossible d\'obtenir votre position';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Vous avez refusé l\'accès à votre position';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Votre position n\'est pas disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'La demande de position a expiré';
            break;
        }
        setGeoError(errorMessage);
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (!userLocation || !isValidLatLng(userLocation.lat, userLocation.lng)) {
    return <LocationActivation />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Geolocation Button */}
      {!hasRequestedGeo && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <button
            onClick={handleGeolocation}
            disabled={isGeolocating}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <Navigation className={`w-5 h-5 ${isGeolocating ? 'animate-pulse' : ''}`} />
            <span>{isGeolocating ? 'Géolocalisation en cours...' : '📍 Me géolocaliser'}</span>
          </button>
          {geoError && (
            <p className="text-red-600 text-sm mt-2 text-center">{geoError}</p>
          )}
        </div>
      )}

      {/* Radius Selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Search Radius:</span>
          </div>
          <div className="flex space-x-2">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => onRadiusChange(radius)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusKm === radius
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {radius} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[500px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Circle */}
          {isValidLatLng(userLocation.lat, userLocation.lng) && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
          )}

          {/* User Marker */}
          {isValidLatLng(userLocation.lat, userLocation.lng) && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-green-600">Your Location</p>
                <p className="text-sm text-gray-600">Search radius: {radiusKm} km</p>
              </div>
            </Popup>
          </Marker>
          )}

          {/* Offer Markers */}
          {offers.filter(offer => isValidLatLng(offer.lat, offer.lng)).map((offer) => (
            <Marker
              key={offer.id}
              position={[offer.lat, offer.lng]}
              icon={highlightOfferId === offer.id ? highlightIcon : offerIcon}
              eventHandlers={{
                click: () => onOfferClick(offer.id)
              }}
            >
              <Popup>
                <div className="w-64">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                  {offer.merchant_name && (
                    <p className="text-sm text-gray-700 mb-1 font-medium">{offer.merchant_name}</p>
                  )}
                  {offer.distance_km && (
                    <p className="text-sm text-green-600 font-semibold mb-2">📍 {offer.distance_km} km de distance</p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">${offer.price.toFixed(2)}</span>
                      {offer.price_before && (
                        <span className="text-sm text-gray-400 line-through">
                          ${offer.price_before.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{offer.discount}%
                    </span>
                  </div>
                  <button
                    onClick={() => onOfferClick(offer.id)}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    View Offer
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stats Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <span className="font-semibold text-gray-900">{offers.length}</span> offer{offers.length !== 1 ? 's' : ''} within {radiusKm} km
          </span>
          {offers.length === 0 && (
            <span className="text-orange-600 font-medium">
              Try increasing the search radius
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
