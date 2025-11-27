import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function SearchLocationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=tr&country=tr`
      );
      const data = await response.json();
      setResults(data.features || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectLocation = (feature: any) => {
    const [lng, lat] = feature.center;
    // Stocker dans localStorage et naviguer vers la carte
    localStorage.setItem("selectedLocation", JSON.stringify({ lng, lat, name: feature.place_name }));
    navigate("/offers");
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24">
      {/* Header */}
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold text-gray-800">Konum Ara</h1>
        <p className="text-sm text-gray-500">Adres veya sehir adi girin</p>
      </div>

      {/* Barre de recherche */}
      <div className="px-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Orn: Kadikoy, Istanbul"
            className="w-full py-4 px-4 pl-12 bg-white rounded-xl shadow-sm border border-gray-200 text-base focus:ring-2 focus:ring-[#00A690] focus:border-transparent focus:outline-none"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A690]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Resultats */}
      <div className="px-4">
        {results.length === 0 && query.length >= 3 && !isSearching && (
          <p className="text-center text-gray-500 py-8">
            Sonuc bulunamadi. Farkli bir adres deneyin.
          </p>
        )}

        {results.map((feature, index) => (
          <button
            key={index}
            onClick={() => selectLocation(feature)}
            className="w-full text-left p-4 bg-white rounded-xl shadow-sm mb-2 hover:bg-gray-50 transition-colors flex items-start gap-3"
          >
            <MapPin className="w-5 h-5 text-[#00A690] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{feature.text}</p>
              <p className="text-sm text-gray-500 truncate">{feature.place_name}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      {query.length === 0 && (
        <div className="px-4 mt-8">
          <div className="bg-[#00A690]/10 rounded-xl p-4">
            <p className="text-sm text-[#00A690] font-medium mb-2">Ipucu</p>
            <p className="text-sm text-gray-600">
              Yakininizdaki teklifleri gormek icin bir adres, mahalle veya sehir adi yazin.
              Ardindan haritada yakin teklifler goruntulenecektir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
