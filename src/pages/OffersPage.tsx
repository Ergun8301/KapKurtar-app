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

const MAP_STYLE = "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";
const DEFAULT_LOCATION: [number, number] = [28.9784, 41.0082];

const customMapboxCSS = `
  .mapboxgl-ctrl-geolocate:focus,
  .mapboxgl-ctrl-geocoder input:focus {
    outline: none !important;
    box-shadow: none !important;
  }
  .mapboxgl-ctrl-top-right {
    top: 10px !important;
    right: 10px !important;
    display: flex !important;
    align-items: center !important;
    gap: 0px !important;
    transform: translateX(-55%) !important;
  }
  .mapboxgl-ctrl-geocoder {
    width: 280px !important;
    max-width: 80% !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    height: 32px !important;
    font-size: 14px !important;
  }
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
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [radiusKm, setRadiusKm] = useState<number>(Number(localStorage.getItem("radiusKm")) || 10);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  // ---- Inject custom CSS
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = customMapboxCSS;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // ---- Load or create profile (by auth_id)
  useEffect(() => {
    const initProfile = async () => {
      if (!user) {
        setProfileId(null);
        setHasLocation(false);
        return;
      }

      try {
        // Try to get profile using auth_id
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, location")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (profile) {
          setProfileId(profile.id);
          setHasLocation(!!profile.location);
          console.log("Profile found:", profile.id, "has location:", !!profile.location);
        } else {
          // Create new profile linked to auth_id
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              auth_id: user.id,
              location: null,
            })
            .select("id")
            .maybeSingle();

          if (insertError) {
            if (insertError.code === "23505") {
              console.warn("Profile already exists, reusing existing one.");
              const { data: existingProfile } = await supabase
                .from("profiles")
                .select("id, location")
                .eq("auth_id", user.id)
                .single();

              if (existingProfile) {
                setProfileId(existingProfile.id);
                setHasLocation(!!existingProfile.location);
              }
            } else {
              console.error("Error creating profile:", insertError);
            }
          } else if (newProfile) {
            setProfileId(newProfile.id);
            setHasLocation(false);
            console.log("Profile created:", newProfile.id);
          }
        }
      } catch (error) {
        console.error("Error in initProfile:", error);
      }
    };

    initProfile();
  }, [user]);

  // ---- Geolocate user (if needed)
  useEffect(() => {
    if (!profileId || isGeolocating || hasLocation) return;

    const geolocateUser = async () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
      }

      setIsGeolocating(true);
      console.log("Requesting geolocation...");

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Geolocation success:", latitude, longitude);

          try {
            const { error } = await supabase
              .from("profiles")
              .update({
                location: `POINT(${longitude} ${latitude})`,
              })
              .eq("id", profileId);

            if (error) {
              console.error("Error updating location:", error);
            } else {
              console.log("Location updated successfully");
              setUserLocation([longitude, latitude]);
              setCenter([longitude, latitude]);
              setHasLocation(true);

              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [longitude, latitude],
                  zoom: 12,
                  essential: true,
                });
              }
            }
          } catch (error) {
            console.error("Error saving location:", error);
          } finally {
            setIsGeolocating(false);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setIsGeolocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    geolocateUser();
  }, [profileId, hasLocation, isGeolocating]);

  // ---- Initialize map
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

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    geolocate.on("geolocate", async (e) => {
      const lng = e.coords.longitude;
      const lat = e.coords.latitude;
      setUserLocation([lng, lat]);
      setCenter([lng, lat]);
      map.flyTo({ center: [lng, lat], zoom: 12, essential: true });

      if (profileId) {
        try {
          await supabase
            .from("profiles")
            .update({
              location: `POINT(${lng} ${lat})`,
            })
            .eq("id", profileId);
          setHasLocation(true);
        } catch (error) {
          console.error("Error updating location via geolocate button:", error);
        }
      }
    });

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

  // ---- Draw search radius
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
    } catch (err) {
      console.warn("Error drawing radius:", err);
    }
  }

  // ---- Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      if (!profileId || !hasLocation) {
        console.log("Cannot fetch offers - profileId:", profileId, "hasLocation:", hasLocation);
        return;
      }

      console.log("Fetching offers for profile:", profileId, "radius:", radiusKm * 1000);

      try {
        const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
          p_client_id: profileId,
          p_radius_meters: radiusKm * 1000,
        });

        if (error) {
          console.error("RPC error:", error);
          setOffers([]);
        } else {
          const validOffers = (data || []).filter(
            (o: Offer) =>
              typeof o.offer_lat === "number" &&
              typeof o.offer_lng === "number" &&
              !isNaN(o.offer_lat) &&
              !isNaN(o.offer_lng)
          );
          console.log("Offers fetched:", validOffers.length, validOffers);
          setOffers(validOffers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
      }
    };

    fetchOffers();
  }, [profileId, hasLocation, radiusKm]);

  // ---- Render markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (map as any)._markers?.forEach((m: Marker) => m.remove());
    (map as any)._markers = [];

    console.log("Adding", offers.length, "markers to map");
    offers.forEach((offer) => {
      if (!offer.offer_lat || !offer.offer_lng || isNaN(offer.offer_lat) || isNaN(offer.offer_lng)) {
        console.warn("Skipping invalid offer coords:", offer);
        return;
      }

      const el = document.createElement("div");
      el.className = "offer-marker";
      el.style.background = "#22c55e";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid #fff";
      el.style.cursor = "pointer";

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>${offer.title}</strong><br/>
        ${offer.merchant_name}<br/>
        <span style="color:green;font-weight:bold;">${offer.price_after.toFixed(2)} €</span>
        <span style="text-decoration:line-through;color:#999;margin-left:4px;">${offer.price_before.toFixed(2)} €</span><br/>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${offer.offer_lat},${offer.offer_lng}" target="_blank" style="color:#22c55e;">🗺️ Itinéraire</a>
      `);

      const marker = new mapboxgl.Marker(el).setLngLat([offer.offer_lng, offer.offer_lat]).setPopup(popup).addTo(map);

      (map as any)._markers.push(marker);
    });
  }, [offers]);

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  // ---- UI
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onInput={(e) => handleRadiusChange(Number((e.target as HTMLInputElement).value))}
            className="w-36 accent-green-500 cursor-pointer focus:outline-none"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>
      </div>

      <div className="md:w-1/2 overflow-y-auto bg-gray-50 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Offres à proximité
          {offers.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({offers.length} {offers.length === 1 ? "offre" : "offres"})
            </span>
          )}
        </h2>
        {!profileId ? (
          <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
            <p className="text-gray-700 font-medium mb-2">Connectez-vous pour voir les offres à proximité</p>
            <p className="text-sm text-gray-500">Votre position sera automatiquement détectée</p>
          </div>
        ) : !hasLocation ? (
          <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
            <p className="text-gray-700 font-medium mb-2">
              {isGeolocating ? "Détection de votre position..." : "Autorisation de géolocalisation requise"}
            </p>
            <p className="text-sm text-gray-500">
              {isGeolocating
                ? "Veuillez autoriser l'accès à votre localisation"
                : "Cliquez sur le bouton GPS pour partager votre position"}
            </p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
            <p className="text-gray-700 font-medium mb-2">Aucune offre disponible dans ce rayon</p>
            <p className="text-sm text-gray-500">Essayez d'augmenter le rayon de recherche</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((o) => (
              <div
                key={o.offer_id}
                className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                {o.image_url && <img src={o.image_url} alt={o.title} className="w-24 h-24 object-cover" />}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-800">{o.title}</h3>
                  <p className="text-sm text-gray-500">{o.merchant_name}</p>
                  <p className="text-green-600 font-semibold">{(o.distance_meters / 1000).toFixed(2)} km</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-600">{o.price_after.toFixed(2)} €</span>
                      <span className="line-through text-gray-400 text-sm">{o.price_before.toFixed(2)} €</span>
                    </div>
                  </div>
                </
