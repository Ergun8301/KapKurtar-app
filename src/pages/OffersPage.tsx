import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const OffersPage = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState({ lat: 46.2, lng: 5.22 }); // par défaut Bourg
  const [searchLocation, setSearchLocation] = useState<L.LatLng | null>(null);
  const [radiusKm, setRadiusKm] = useState(15);

  const mapboxToken =
    "pk.eyJ1Ijoia2lsaWNlcmd1bjAxIiwiYSI6ImNtaDRoazJsaTFueXgwOHFwaWRzMmU3Y2QifQ.aieAqNwRgY40ydzIDBxc6g";
  const mapboxStyle =
    "kilicergun01/cmh4k0xk6008i01qt4f8p1mas"; // ton style V2 Tilkapp

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSearchLocation(null); // ✅ remet ton point au centre et efface recherche
        mapRef.current?.flyTo(
          [pos.coords.latitude, pos.coords.longitude],
          13,
          { duration: 1.5 }
        );
      });
    }
  };

  return (
    <div className="relative w-full h-[90vh] bg-gray-100 rounded-2xl overflow-hidden">
      {/* Barre de recherche */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[80%] md:w-[50%]">
        <input
          type="text"
          placeholder="Rechercher une adresse ou un lieu..."
          className="w-full p-3 rounded-full border border-gray-300 shadow focus:outline-none focus:ring-0 text-gray-700 text-center"
        />
      </div>

      {/* Bouton GPS */}
      <button
        onClick={handleLocate}
        className="absolute top-4 right-4 z-[1000] bg-white border border-gray-300 p-3 rounded-full shadow hover:bg-gray-100"
        title="Me géolocaliser"
      >
        📍
      </button>

      {/* Carte */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        minZoom={2} // tu peux remonter à 3 si tu veux
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer
          attribution='© Mapbox, © OpenStreetMap'
          url={`https://api.mapbox.com/styles/v1/${mapboxStyle}/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxToken}`}
          tileSize={512}
          zoomOffset={-1}
        />

        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>📍 Vous êtes ici</Popup>
        </Marker>

        {searchLocation && (
          <Marker position={searchLocation}>
            <Popup>Adresse recherchée</Popup>
          </Marker>
        )}

        <Circle
          center={searchLocation || userLocation}
          radius={radiusKm * 1000}
          pathOptions={{ color: "rgba(0,0,0,0.8)", weight: 1.2, fillOpacity: 0 }}
        />
      </MapContainer>

      {/* Slider du rayon */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white shadow-md rounded-full px-6 py-2 flex items-center space-x-4 z-[1000]">
        <input
          type="range"
          min="1"
          max="30"
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="w-40 accent-green-500"
        />
        <span className="font-semibold text-gray-700">{radiusKm} km</span>
      </div>
    </div>
  );
};

export default OffersPage;
