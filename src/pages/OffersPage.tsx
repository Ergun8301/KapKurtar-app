import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { callGetOffersNearby } from "../utils/callGetOffersNearby";

type Offer = {
  offer_id: string;
  title: string;
  merchant_name: string;
  price_before: number;
  price_after: number;
  distance_meters: number;
  offer_lat: number;
  offer_lng: number;
  image_url?: string;
};

// 🗺️ Style Tilkapp V2 (Mapbox Studio)
const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";

// 📍 Position par défaut — Turquie (Istanbul)
const DEFAULT_LOCATION: [number, number] = [28.9784, 41.0082]; // Istanbul

// 🎨 CSS personnalisé — version stable et simple + ajustements
const customMapboxCSS = `
  /* Désactive halo et outline */
  .mapboxgl-ctrl-geolocate:focus,
  .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }

  /* Conteneur en haut à droite pour GPS + recherche */
  .mapboxgl-ctrl-top-right {
    top: 10px !important;
    right: 10px !important;
    display: flex !important;
    align-items: center !important;
    gap: 0px !important; /* ✅ Espace plus grand entre GPS et barre */
    transform: translateX(-55%) !important; /* ✅ Tire légèrement vers la gauche pour centrer sur la carte */
  }

  /* Barre de recherche */
  .mapboxgl-ctrl-geocoder {
    width: 280px !important;
    max-width: 80% !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    height: 32px !important; /* ✅ Barre plus fine */
    font-size: 14px !important; /* ✅ Texte plus petit */
  }

  /* Mobile responsive — en haut centré */
@media (max-width: 640px) {
  .mapboxgl-ctrl-top-right {
    top: 8px !important;
    right: 50% !important;
    transform: translateX(50%) !important;
    flex-direction: row !important;         /* ✅ côte à côte */
    justify-content: center !important;     /* ✅ centrés */
    gap: 6px !important;
  }

  .mapboxgl-ctrl-geocoder {
    width: 80% !important;                  /* ✅ barre un peu plus courte */
    height: 36px !important;
  }
}


    .mapboxgl-ctrl-geocoder {
      width: 90% !important;
      height: 36px !important; /* un peu plus fine aussi sur mobile */
    }
  }

  /* Masquer les mentions Mapbox/OpenStreetMap */
  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-attrib,
  .mapbox-improve-map {
    display: none !important;
  }
`;

export default function OffersPage() {
  const { user } = useAuth();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>(
    DEFAULT_LOCATION
  );
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );
  const [clientId, setClientId] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Injecte le CSS
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // Récupère le client_id depuis la table clients si l'utilisateur est connecté
  useEffect(() => {
    const fetchClientId = async () => {
      if (!user) {
        setClientId(null);
        return;
      }

      try {
        const { data: client } = await supabase
          .from('clients')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (client) {
          setClientId(client.id);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du client:', error);
      }
    };

    fetchClientId();
  }, [user]);

  // Géolocalisation automatique pour les clients connectés
  useEffect(() => {
    if (!clientId || isGeolocating) return;

    const geolocateClient = async () => {
      if (!navigator.geolocation) return;

      setIsGeolocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            await supabase.rpc('update_client_location', {
              client_id: clientId,
              longitude: longitude,
              latitude: latitude,
              status: 'success'
            });

            setUserLocation([longitude, latitude]);
            setCenter([longitude, latitude]);

            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [longitude, latitude],
                zoom: 12,
                essential: true
              });
            }
          } catch (error) {
            console.error('Erreur lors de la mise à jour de la position:', error);
          } finally {
            setIsGeolocating(false);
          }
        },
        (error) => {
          console.warn('Géolocalisation refusée ou impossible:', error);
          setIsGeolocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    };

    geolocateClient();
  }, [clientId]);

  // Initialise la carte
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center,
      zoom: 7,
    });

    mapRef.current = map;

    // 📍 Contrôle de géolocalisation
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", (e) => {
  const lng = e.coords.longitude;
  const lat = e.coords.latitude;
  setUserLocation([lng, lat]);
  setCenter([lng, lat]);
  map.flyTo({ center: [lng, lat], zoom: 12, essential: true });

  // 🧹 Vide le champ de recherche (évite qu’il reste sur "Paris")
  const input = document.querySelector(".mapboxgl-ctrl-geocoder input") as HTMLInputElement;
  if (input) input.value = "";
});


    // 🔍 Barre de recherche
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Rechercher une adresse ou un lieu...",
      language: "fr",
    });
    map.addControl(geocoder);

    geocoder.on("result", (e) => {
      const [lng, lat] = e.result.center;
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });
    });

    return () => map.remove();
  }, []);

  // Cercle dynamique
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once("load", () => drawRadius(map, center, radiusKm));
    } else {
      drawRadius(map, center, radiusKm);
    }
  }, [center, radiusKm]);

  function drawRadius(map: Map, center: [number, number], radiusKm: number) {
    try {
      if (map.getLayer("radius")) map.removeLayer("radius");
      if (map.getSource("radius")) map.removeSource("radius");
      if (map.getLayer("outside-mask")) map.removeLayer("outside-mask");
      if (map.getSource("outside-mask")) map.removeSource("outside-mask");

      const circle = createGeoJSONCircle(center, radiusKm * 1000);

      // Zone de recherche
      map.addSource("radius", { type: "geojson", data: circle });
      map.addLayer({
        id: "radius",
        type: "fill",
        source: "radius",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
      });

      // Extérieur assombri
      const outerPolygon = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90],
              [180, -90],
              [180, 90],
              [-180, 90],
              [-180, -90],
            ],
            circle.geometry.coordinates[0],
          ],
        },
      };

      map.addSource("outside-mask", { type: "geojson", data: outerPolygon });
      map.addLayer({
        id: "outside-mask",
        type: "fill",
        source: "outside-mask",
        paint: {
          "fill-color": "rgba(0,0,0,0.35)",
          "fill-opacity": 0.35,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      circle.geometry.coordinates[0].forEach(([lng, lat]) =>
        bounds.extend([lng, lat])
      );
      map.fitBounds(bounds, { padding: 50, duration: 800 });
    } catch (err) {
      console.warn("Erreur drawRadius :", err);
    }
  }

  // Chargement des offres
useEffect(() => {
  const fetchOffers = async () => {
    if (!clientId) {
      setOffers([]);
      return;
    }

    try {
      // ✅ Appel via le helper centralisé
      const data = await callGetOffersNearby(clientId, radiusKm);
      console.log("✅ Offres reçues depuis Supabase :", data);
      setOffers(data);
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des offres :", error);
      setOffers([]);
    }
  };

  fetchOffers();
}, [clientId, center, radiusKm]);


  // Slider de rayon (inchangé)
  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

       {/* 🎚️ Slider — inchangé */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onInput={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-36 accent-green-500 cursor-pointer focus:outline-none"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>
      </div>

      {/* 🛒 Offres */}
      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Offres à proximité</h2>
        {!clientId ? (
          <p className="text-gray-500 text-center mt-10">
            Connectez-vous pour voir les offres à proximité.
          </p>
        ) : offers.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            Aucune offre disponible dans ce rayon.
          </p>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div
                key={o.offer_id}
                className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                {o.image_url && (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    className="w-24 h-24 object-cover"
                  />
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800">{o.title}</h3>
                  <p className="text-sm text-gray-500">{o.merchant_name}</p>
                  <p className="text-green-600 font-semibold">
                    {(o.distance_meters / 1000).toFixed(2)} km
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">
                        {o.price_after.toFixed(2)} €
                      </span>
                      <span className="line-through text-gray-400 text-sm">
                        {o.price_before.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 🔵 Cercle GeoJSON — version finale et stable
export function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 64
) {
  const coords = { latitude: center[1], longitude: center[0] };
  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];

  const distanceX =
    km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }

  // referme le cercle
  ret.push(ret[0]);

  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [ret],
    },
  };
}
