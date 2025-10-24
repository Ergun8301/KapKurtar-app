import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Navigation, MapPin, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Offer {
  offer_id: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  discount_percent: number;
  offer_lat: number;
  offer_lng: number;
  merchant_name: string;
  distance_meters: number;
  image_url?: string;
}

const DEFAULT_LOCATION = { lat: 39.0, lng: 35.24 }; // Turquie

export default function OffersMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [radiusKm, setRadiusKm] = useState(() => {
    const saved = localStorage.getItem('searchRadius');
    return saved ? parseInt(saved, 10) / 1000 : 5;
  });
  const [geoStatus, setGeoStatus] = useState<'pending' | 'success' | 'denied' | 'error'>('pending');
  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  // --- Géolocalisation ---
  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        map?.flyTo({ center: [longitude, latitude], zoom: 12, essential: true });
        setGeoStatus('success');
      },
      (err) => {
        console.error('Erreur géoloc :', err);
        setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
        setUserLocation(DEFAULT_LOCATION);
      }
    );
  };

  // --- Initialisation carte ---
  useEffect(() => {
    const m = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat],
      zoom: 5.1,
    });

    new mapboxgl.NavigationControl();
    setMap(m);

    return () => m.remove();
  }, []);

  // --- Chargement des offres ---
  useEffect(() => {
    if (!userLocation) return;

    const fetchOffers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_offers_nearby_dynamic_v2', {
          client_id: null,
          radius_meters: radiusKm * 1000,
        });
        if (error) {
          console.error('Erreur offres :', error);
          return;
        }
        setOffers(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOffers();
  }, [radiusKm, userLocation]);

  // --- Affichage des marqueurs ---
  useEffect(() => {
    if (!map) return;
    map.on('load', () => {
      // Marqueur utilisateur
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setText('📍 Vous êtes ici'))
        .addTo(map);

      // Cercle (rayon)
      map.addSource('radius', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat],
          },
        },
      });
      map.addLayer({
        id: 'radius-circle',
        type: 'circle',
        source: 'radius',
        paint: {
          'circle-radius': {
            stops: [
              [5, radiusKm * 20],
              [10, radiusKm * 100],
              [15, radiusKm * 500],
            ],
          },
          'circle-color': '#10b981',
          'circle-opacity': 0.1,
        },
      });

      // Marqueurs offres
      offers.forEach((offer) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundColor = '#16a34a';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="width: 200px;">
            ${offer.image_url ? `<img src="${offer.image_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;" />` : ''}
            <h4 style="font-weight:bold;margin:4px 0;">${offer.title}</h4>
            <p style="margin:2px 0;color:#555;">${offer.merchant_name}</p>
            <p style="margin:2px 0;color:#16a34a;">📍 ${(offer.distance_meters / 1000).toFixed(2)} km</p>
            <p><strong>${offer.price_after.toFixed(2)}€</strong> <span style="text-decoration:line-through;color:gray;">${offer.price_before.toFixed(2)}€</span></p>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([offer.offer_lng, offer.offer_lat])
          .setPopup(popup)
          .addTo(map);
      });
    });
  }, [map, offers]);

  const radiusOptions = [2, 5, 10, 15, 20];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bandeau filtres */}
      <div className="bg-white shadow-lg p-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-700">Rayon :</span>
          </div>
          <div className="flex space-x-2 flex-wrap">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  radiusKm === r
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
          <button
            onClick={requestGeolocation}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>📍 Me géolocaliser</span>
          </button>
        </div>
      </div>

      {/* Message d’erreur géoloc */}
      {geoStatus === 'denied' && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
          <p className="text-sm text-orange-800">Accès refusé — centrage Turquie par défaut.</p>
        </div>
      )}

      {/* Carte */}
      <div id="map" className="h-[500px] w-full rounded-xl shadow-md border border-gray-200" />

      {/* Liste des offres */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Offres disponibles</h2>
        {offers.length === 0 ? (
          <p className="text-center text-gray-500">Aucune offre trouvée dans ce rayon 🌍</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.offer_id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
              >
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{offer.title}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-2">{offer.merchant_name}</p>
                  <p className="text-sm text-green-600 font-semibold mb-3">
                    📍 {(offer.distance_meters / 1000).toFixed(2)} km
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">
                        {offer.price_after.toFixed(2)}€
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {offer.price_before.toFixed(2)}€
                      </span>
                    </div>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      -{offer.discount_percent}%
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/offer/${offer.offer_id}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir détail</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
