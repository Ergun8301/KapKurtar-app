// [...] (imports et icônes identiques)

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);
  const [center, setCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lng,
  ]);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(
    Number(localStorage.getItem("radiusKm")) || 10
  );

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const mapRef = useRef<L.Map>(null);

  // ---------- GÉOLOCALISATION ----------
  const requestGeolocation = () => {
    // ✅ Efface la recherche et recentre sur soi
    setQuery("");
    setSuggestions([]);
    setSearchLocation(null);

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setCenter([latitude, longitude]);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestGeolocation();
  }, []);

  // ---------- CHARGEMENT DES OFFRES ----------
  useEffect(() => {
    if (!user) return;
    const fetchOffers = async () => {
      const { data: client } = await supabase
        .from("clients")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();

      if (client) {
        const { data } = await supabase.rpc("get_offers_nearby_dynamic", {
          p_client_id: client.id,
          p_radius_meters: radiusKm * 1000,
        });
        setOffers(data || []);
      }
    };
    fetchOffers();
  }, [user, center, radiusKm]);

  // ---------- BARRE DE RECHERCHE MAPBOX ----------
  useEffect(() => {
    if (isSelecting) return;
    if (query.length < 3) return setSuggestions([]);
    const load = async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&language=fr`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    };
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [query, isSelecting]);

  const handleSelect = (feature: any) => {
    const [lng, lat] = feature.center;
    setIsSelecting(true);
    setCenter([lat, lng]);
    setSearchLocation([lat, lng]);
    setQuery(feature.place_name);
    setSuggestions([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (isSelecting) setIsSelecting(false);
  };

  // ---------- RECENTRAGE AUTOMATIQUE ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const circle = L.circle(center, { radius: radiusKm * 1000 });
    setTimeout(() => map.fitBounds(circle.getBounds(), { padding: [50, 50] }), 250);
  }, [radiusKm, center]);

  const activeCenter = searchLocation || [userLocation.lat, userLocation.lng];

  const handleRadiusChange = (val: number) => {
    setRadiusKm(val);
    localStorage.setItem("radiusKm", String(val));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );

  // ---------- RENDU ----------
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]">
      <div className="relative flex-1 border-r border-gray-200">
        <MapContainer
          whenCreated={(map) => (mapRef.current = map)}
          center={activeCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <MapController center={activeCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${
              import.meta.env.VITE_MAPBOX_TOKEN
            }`}
            tileSize={512}
            zoomOffset={-1}
          />
          <Circle
            center={activeCenter}
            radius={radiusKm * 1000}
            pathOptions={{
              color: "rgba(0,0,0,0.7)",
              weight: 1.5,
              fillOpacity: 0,
            }}
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>📍 Vous êtes ici</Popup>
          </Marker>
          {searchLocation && (
            <Marker position={searchLocation} icon={searchIcon}>
              <Popup>📍 Adresse recherchée</Popup>
            </Marker>
          )}
          {offers.map((o) => (
            <Marker
              key={o.offer_id}
              position={[o.offer_lat, o.offer_lng]}
              icon={offerIcon}
            >
              <Popup>
                <strong>{o.title}</strong>
                <br />
                {o.merchant_name}
                <br />
                {(o.distance_meters / 1000).toFixed(2)} km
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 🔍 BARRE DE RECHERCHE alignée */}
        <div className="absolute top-4 left-6 right-6 z-[1000] flex justify-center">
          <div className="relative w-full max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Rechercher une adresse ou un lieu..."
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm text-gray-700 outline-none focus:ring-0 active:ring-0"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setSearchLocation(null);
                }}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 outline-none focus:ring-0 active:ring-0"
              >
                ✕
              </button>
            )}
            {suggestions.length > 0 && (
              <ul className="absolute mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto w-full">
                {suggestions.map((f) => (
                  <li
                    key={f.id}
                    onClick={() => handleSelect(f)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {f.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 📍 BOUTON GPS sans halo */}
        <button
          onClick={requestGeolocation}
          className="absolute top-4 right-4 z-[1000] flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-300 shadow hover:bg-gray-100 active:scale-95 outline-none focus:ring-0 active:ring-0"
          title="Me géolocaliser"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="rgb(59,130,246)"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 7.05l-1.414-1.414M6.464 6.464 5.05 5.05m13.9 0-1.414 1.414M6.464 17.536 5.05 18.95"
            />
          </svg>
        </button>

        {/* 🎚️ SLIDER sans halo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full shadow px-3 py-1 flex items-center space-x-2 border border-gray-200 outline-none focus:ring-0">
          <input
            type="range"
            min={1}
            max={30}
            value={radiusKm}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-36 cursor-pointer outline-none focus:ring-0 active:ring-0"
          />
          <span className="text-sm text-gray-700 font-medium">{radiusKm} km</span>
        </div>
      </div>

      {/* 💸 Liste des offres inchangée */}
      {/* ... */}
    </div>
  );
}
