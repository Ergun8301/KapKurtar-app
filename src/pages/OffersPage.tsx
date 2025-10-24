// --- Barre de recherche Mapbox
useEffect(() => {
  if (isSelecting) return; // ← c’est ça qui bloque les requêtes pendant la sélection
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
  setIsSelecting(true);          // ← on bloque les recherches
  setCenter([lat, lng]);
  setSearchLocation([lat, lng]);
  setQuery(feature.place_name);
  setSuggestions([]);
  // délai trop court
  setTimeout(() => setIsSelecting(false), 500);
};
