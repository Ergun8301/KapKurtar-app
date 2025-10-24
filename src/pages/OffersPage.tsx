import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Icône de localisation (bleue)
const userIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

const OffersPage = () => {
  const [position, setPosition] = useState<L.LatLngExpression>({
    lat: 46.2,
    lng: 5.22,
  }); // Bourg par défaut
  const [radius, setRadius] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<L.LatLngExpression | null>(
    null
  );
  const mapRef = useRef<L.Map | null>(null);

  const MAPBOX_TOKEN =
    "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";
  const MAPBOX_STYLE =
    "mapbox://styles/kilicergun01/cmh4k0xk6008i01qt4f8p1mas";

  // --- Fonction de géolocalisation
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });
        setSearchResult(null);
        setSearchQuery("");
        mapRef.current?.flyTo([latitude, longitude], 13, { duration: 1.2 });
      },
      (err) => {
        console.error("Erreur géoloc :", err);
      }
    );
  };

  // --- Recherche d’adresse via API Mapbox Geocoding
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      searchQuery
    )}.json?access_token=${MAPBOX_TOKEN}&limit=1`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      setSearchResult({ lat, lng });
      setPosition({ lat, lng });
      mapRef.current?.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[90vh] bg-gray-100 rounded-2xl overflow-hidden">
      {/* --- Barre de recherche --- */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[80%] md:w-[50%]"
      >
        <input
          type="text"
          placeholder="Rechercher une adresse ou un lieu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-full border border-gray-300 shadow text-gray-700 text-center focus:outline-none focus:ring-0"
        />
      </form>

      {/* --- Bouton GPS --- */}
      <button
        onClick={handleLocate}
        className="absolute top-4 right-4 z-[1000] bg-white border border-gray-300 p-3 rounded-full shadow hover:bg-gray-100 focus:outline-none"
        title="Me géolocaliser"
      >
        📍
      </button>

      {/* --- Carte --- */}
      <MapContainer
        center={position}
        zoom={12}
        minZoom={2}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/kilicergun01/cmh4k0xk6008i01qt4f8p1mas/tiles/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
          attribution='© Mapbox © OpenStreetMap'
          tileSize={512}
          zoomOffset={-1}
        />

        <Marker position={position} icon={userIcon}>
          <Popup>📍 Localisation actuelle</Popup>
        </Marker>

        <Circle
          center={position}
          radius={radius * 1000}
          pathOptions={{
            color: "black",
            weight: 1.2,
            fillOpacity: 0,
          }}
        />
      </MapContainer>

      {/* --- Slider du rayon --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full px-6 py-2 flex items-center space-x-4 z-[1000] focus:outline-none">
        <input
          type="range"
          min="1"
          max="30"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-40 accent-green-500 focus:outline-none focus:ring-0"
        />
        <span className="font-semibold text-gray-700">{radius} km</span>
      </div>
    </div>
  );
};

export default OffersPage;
