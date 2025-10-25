import React, { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

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
    gap: 0px !important; 
    transform: translateX(-55%) !important;
  }

  /* Barre de recherche */
  .mapboxgl-ctrl-geocoder {
    width: 280px !important;
    max-width: 80% !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    height: 32px !important;
    font-size: 14px !important;
  }

  /* Mobile responsive — en haut centré */
@media (max-width: 640px) {
  .mapboxgl-ctrl-top-right {
    top: 8px !important;
    right: 50% !important;
    transform: translateX(50%) !important;
    flex-direction: row !important;         
    justify-content: center !important;     
    gap: 6px !important;
  }

  .mapboxgl-ctrl-geocoder {
    width: 80% !important;                  
    height: 36px !important;
  }
}

  .mapboxgl-ctrl-geocoder {
    width: 90% !important;
    height: 36px !important;
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

    // 🟢 AJOUT : Afficher les offres sur la carte
    if (offers && offers.length > 0) {
      offers.forEach((offer) => {
        if (!offer.offer_lat || !offer.offer_lng) return;

        new mapboxgl.Marker({ color: "red" })
          .setLngLat([offer.offer_lng, offer.offer_lat])
          .setPopup(
            new mapboxgl.Popup().setHTML(`
              <strong>${offer.title}</strong><br>
              ${offer.price_after}₺ au lieu de ${offer.price_before}₺
            `)
          )
          .addTo(map);
      });
    }
    // 🟢 FIN AJOUT

    return () => map.remove();
  }, [offers]); // ← ajouté ici pour se réactualiser quand les offres changent

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

      map.addSource("radius", { type: "geojson", data: circle });
      map.addLayer({
        id: "radius",
        type: "fill",
        source: "radius",
        paint: { "fill-color": "#22c55e", "fill-opacity": 0.15 },
      });

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
        paint: { "fill-color": "rgba(0,0,0,0.35)", "fill-opacity": 0.35 },
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
        const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
          p_client_id: clientId,
          p_radius_meters: radiusKm * 1000,
        });

        if (error) {
          console.error('Erreur lors du chargement des offres:', error);
          setOffers([]);
        } else {
          setOffers(data || []);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des offres:', error);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [clientId, center, radiusKm]);

  // ... (reste inchangé : marqueurs personnalisés, slider, affichage liste)
