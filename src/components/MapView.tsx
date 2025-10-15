import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const clientIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [35, 45],
  iconAnchor: [17, 45],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const offerIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [1, -35],
  shadowSize: [41, 41]
});

interface ClientLocation {
  latitude: number;
  longitude: number;
}

interface Offer {
  offer_id: string;
  merchant_name: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
};

export default function MapView() {
  const [clientLocation, setClientLocation] = useState<ClientLocation | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [radius, setRadius] = useState<number>(() => {
    const saved = localStorage.getItem('searchRadius');
    return saved ? parseInt(saved, 10) : 5000;
  });
  const [clientId, setClientId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.5, 3]);
  const [mapZoom, setMapZoom] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Non authentifié');
          setLoading(false);
          return;
        }

        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('id, location')
          .eq('id', user.id)
          .maybeSingle();

        if (clientError) {
          console.error('Erreur récupération client:', clientError);
          setError('Impossible de récupérer votre position');
          setLoading(false);
          return;
        }

        if (client?.location) {
          const match = client.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
          if (match) {
            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);
            setClientLocation({ latitude, longitude });
            setMapCenter([latitude, longitude]);
            setClientId(client.id);

            const radiusKm = radius / 1000;
            setMapZoom(radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : radiusKm <= 20 ? 11 : 10);
          }
        } else {
          setError('Position non définie. Veuillez configurer votre adresse.');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [radius]);

  useEffect(() => {
    if (!clientId) return;

    const fetchOffers = async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('get_offers_nearby_dynamic', {
          p_client_id: clientId,
          p_radius_meters: radius,
        });

        if (rpcError) {
          console.error('Erreur RPC:', rpcError);
          setError(`Erreur: ${rpcError.message}`);
          setOffers([]);
        } else {
          setOffers(data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur chargement offres:', err);
        setError('Impossible de charger les offres');
      }
    };

    fetchOffers();

    const channel = supabase
      .channel('offers-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers'
        },
        () => {
          fetchOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, radius]);

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRadius = parseInt(e.target.value, 10);
    setRadius(newRadius);
    localStorage.setItem('searchRadius', newRadius.toString());

    window.dispatchEvent(
      new CustomEvent('radiusChanged', {
        detail: { radiusMeters: newRadius }
      })
    );

    const radiusKm = newRadius / 1000;
    setMapZoom(radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : radiusKm <= 20 ? 11 : 10);
  };

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-gray-50 rounded-2xl shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  if (error || !clientLocation) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center bg-gray-50 rounded-2xl shadow-md">
        <div className="text-center p-6">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {error || '📍 Position non disponible'}
          </p>
          <p className="text-sm text-gray-500">
            Assurez-vous que votre adresse est configurée dans votre profil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[80vh] relative rounded-2xl shadow-md overflow-hidden">
      <div className="absolute top-4 left-4 bg-white p-4 rounded-xl shadow-lg z-[1000] max-w-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-900">
            Rayon : {(radius / 1000).toFixed(1)} km
          </label>
          <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
            {offers.length} offres
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="50000"
          step="1000"
          value={radius}
          onChange={handleRadiusChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 km</span>
          <span>50 km</span>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full z-0"
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[clientLocation.latitude, clientLocation.longitude]} icon={clientIcon}>
          <Popup>
            <div className="text-center">
              <strong>Vous êtes ici</strong>
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[clientLocation.latitude, clientLocation.longitude]}
          radius={radius}
          pathOptions={{
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.1,
            weight: 2
          }}
        />

        {offers.map((offer) => (
          <Marker
            key={offer.offer_id}
            position={[offer.offer_lat, offer.offer_lng]}
            icon={offerIcon}
          >
            <Popup>
              <div className="max-w-xs">
                <h3 className="font-bold text-sm mb-1">{offer.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{offer.merchant_name}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs line-through text-gray-400">
                      {offer.price_before.toFixed(2)}€
                    </span>
                    <span className="text-sm font-bold text-green-600 ml-2">
                      {offer.price_after.toFixed(2)}€
                    </span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    -{offer.discount_percent}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  📍 {(offer.distance_meters / 1000).toFixed(2)} km
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
