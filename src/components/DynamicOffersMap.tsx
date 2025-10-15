import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { useDynamicOffers, type DynamicOffer } from '../hooks/useDynamicOffers';
import { supabase } from '../lib/supabaseClient';

// Fix Leaflet default icon issue with Vite
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenMarkerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueMarkerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface DynamicOffersMapProps {
  clientId: string | null;
  onOfferClick?: (offerId: string) => void;
}

interface ClientLocation {
  latitude: number;
  longitude: number;
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export const DynamicOffersMap: React.FC<DynamicOffersMapProps> = ({
  clientId,
  onOfferClick
}) => {
  const [clientLocation, setClientLocation] = useState<ClientLocation | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(5000);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.5, 3]);
  const [mapZoom, setMapZoom] = useState(6);

  // Load radius from localStorage
  useEffect(() => {
    const savedRadius = localStorage.getItem('searchRadius');
    if (savedRadius) {
      const radius = parseInt(savedRadius, 10);
      if (!isNaN(radius) && radius > 0) {
        setRadiusMeters(radius);
      }
    } else {
      // Initialize with default 5km = 5000m
      localStorage.setItem('searchRadius', '5000');
      setRadiusMeters(5000);
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'searchRadius' && e.newValue) {
        const radius = parseInt(e.newValue, 10);
        if (!isNaN(radius) && radius > 0) {
          setRadiusMeters(radius);
        }
      }
    };

    // Listen for custom radius change events (same tab)
    const handleRadiusChanged = (e: CustomEvent) => {
      const radiusMeters = e.detail?.radiusMeters;
      if (radiusMeters && radiusMeters > 0) {
        setRadiusMeters(radiusMeters);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('radiusChanged', handleRadiusChanged as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('radiusChanged', handleRadiusChanged as EventListener);
    };
  }, []);

  // Fetch client location
  useEffect(() => {
    const fetchClientLocation = async () => {
      if (!clientId) return;

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('location')
          .eq('id', clientId)
          .maybeSingle();

        if (error || !data?.location) {
          console.error('Error fetching client location:', error);
          return;
        }

        // Parse PostGIS POINT(lng lat) format
        const match = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match) {
          const longitude = parseFloat(match[1]);
          const latitude = parseFloat(match[2]);
          setClientLocation({ latitude, longitude });
          setMapCenter([latitude, longitude]);

          // Adjust zoom based on radius
          const radiusKm = radiusMeters / 1000;
          setMapZoom(radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : radiusKm <= 20 ? 11 : 10);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchClientLocation();
  }, [clientId, radiusMeters]);

  // Fetch offers using the dynamic hook
  const { offers, loading, error } = useDynamicOffers({
    clientId,
    radiusMeters,
    enabled: !!clientId && !!clientLocation
  });

  const handleRadiusChange = (newRadius: number) => {
    setRadiusMeters(newRadius);
    localStorage.setItem('searchRadius', newRadius.toString());
  };

  if (!clientLocation) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Localisation requise
        </h3>
        <p className="text-gray-600">
          Veuillez activer votre géolocalisation pour voir la carte des offres.
        </p>
      </div>
    );
  }

  const radiusOptions = [2000, 5000, 10000, 15000, 20000];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Radius Selector */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Rayon de recherche:</span>
          </div>
          <div className="flex space-x-2 flex-wrap">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => handleRadiusChange(radius)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusMeters === radius
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {radius / 1000} km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[500px]">
        {/* Radius Display Badge */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-900">
              Rayon: {(radiusMeters / 1000).toFixed(1)} km
            </span>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des offres...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Search Radius Circle */}
          <Circle
            center={[clientLocation.latitude, clientLocation.longitude]}
            radius={radiusMeters}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.1,
              weight: 2
            }}
          />

          {/* Client Location Marker */}
          <Marker
            position={[clientLocation.latitude, clientLocation.longitude]}
            icon={blueMarkerIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-blue-600">Votre position</p>
                <p className="text-sm text-gray-600">
                  Rayon: {(radiusMeters / 1000).toFixed(1)} km
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Offer Markers */}
          {offers.map((offer) => (
            <Marker
              key={offer.offer_id}
              position={[offer.offer_lat, offer.offer_lng]}
              icon={greenMarkerIcon}
              eventHandlers={{
                click: () => onOfferClick && onOfferClick(offer.offer_id)
              }}
            >
              <Popup>
                <div className="w-64">
                  {offer.image_url && (
                    <img
                      src={offer.image_url}
                      alt={offer.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h4 className="font-bold text-gray-900 mb-1">{offer.title}</h4>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    {offer.merchant_name}
                  </p>
                  <p className="text-sm text-green-600 font-semibold mb-2">
                    📍 {(offer.distance_meters / 1000).toFixed(1)} km de distance
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">
                        €{offer.price_after.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        €{offer.price_before.toFixed(2)}
                      </span>
                    </div>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{offer.discount_percent}%
                    </span>
                  </div>
                  <button
                    onClick={() => onOfferClick && onOfferClick(offer.offer_id)}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Voir l'offre
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
            <span className="font-semibold text-gray-900">{offers.length}</span> offre
            {offers.length !== 1 ? 's' : ''} trouvée{offers.length !== 1 ? 's' : ''} dans un
            rayon de {(radiusMeters / 1000).toFixed(1)} km
          </span>
          {offers.length === 0 && !loading && (
            <span className="text-orange-600 font-medium">
              Essayez d'augmenter le rayon de recherche
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
