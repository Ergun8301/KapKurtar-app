import React, { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔥 TYPES -------------------------------------------------
type Offer = {
  offer_id: string;
  title: string;
  description: string;
  price_before: number;
  price_after: number;
  available_until: string; // ISO string from Supabase
  image_url: string | null;
  merchant_name: string;
  distance_meters?: number; // si ta RPC le renvoie
  offer_lat?: number; // latitude de l'offre
  offer_lng?: number; // longitude de l'offre
};

// ⏳ Util: temps restant avant expiration ------------------
function getTimeRemainingLabel(available_until: string) {
  const end = new Date(available_until).getTime();
  const now = Date.now();
  const diffMs = end - now;

  if (diffMs <= 0) return "Expirée";

  const diffMinTotal = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(diffMinTotal / 60);
  const mins = diffMinTotal % 60;

  if (hours <= 0) return `${mins} min restantes`;
  return `${hours}h ${mins}min restantes`;
}

// 🔢 Util: pourcentage de réduction ------------------------
function getDiscountPercent(before: number, after: number) {
  if (!before || before === 0) return 0;
  const diff = before - after;
  const pct = (diff / before) * 100;
  return Math.round(pct); // exemple 67%
}

// 📍 Icône Leaflet simple ----------------------------------
const offerIcon = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/1046/1046784.png", // tu peux remplacer par ton propre marker vert
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const userIcon = L.icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/149/149060.png", // marker utilisateur bleu/gris
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🧠 composant principal -----------------------------------
const OffersMapAndList: React.FC = () => {
  // --------------------------------------------------------
  // 1. State
  // --------------------------------------------------------
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // popup sur la carte (option 1)
  const [activeOfferOnMap, setActiveOfferOnMap] = useState<Offer | null>(null);

  // fiche détaillée / modal commune (option 2)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  // quantité à réserver dans la modal
  const [quantity, setQuantity] = useState<number>(1);

  // --------------------------------------------------------
  // 2. INIT carte Leaflet
  // --------------------------------------------------------
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Position par défaut fallback (ici Lyon) si pas de géoloc
    const defaultCenter: [number, number] = [45.75, 4.85];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
    });
    mapRef.current = map;

    // fond de carte (tu peux remplacer par ton style Mapbox si tu utilises mapbox-gl ailleurs)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
    }).addTo(map);

    // tentative géolocalisation navigateur
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserLocation(coords);
        map.setView(coords, 14);

        // marqueur utilisateur
        L.marker(coords, { icon: userIcon })
          .addTo(map)
          .bindTooltip("Vous êtes ici", { permanent: false });
      },
      () => {
        // rien : on reste en center défaut
      }
    );
  }, []);

  // --------------------------------------------------------
  // 3. Charger les offres (mock ici)
  // ⚠ Branche ça sur Supabase dans ta vraie page
  // --------------------------------------------------------
  useEffect(() => {
    // 👉 Remplace ce bloc par le fetch réel Supabase RPC qui renvoie EXACTEMENT
    // les champs: offer_id,title,description,price_before,price_after,
    // available_until,image_url,merchant_name,offer_lat,offer_lng,distance_meters
    //
    // Pour l’instant je mets des fausses coords pour éviter que ça crashe.
    setOffers([
      {
        offer_id: "1b4a792c-2486-4cce-85bf-143a36cf6966",
        title: "fdhgfhfgbvfvf,,k;k",
        description: "ujkhggfvcxcdvnh,",
        price_before: 10,
        price_after: 5,
        available_until: "2025-11-02T15:48:36.427Z",
        image_url:
          "https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/product-images/302664cd-85f2-476d-81a2-9b623cfc41f4/cefebac2-f35a-4f85-baf8-50e032b7f70e.jpg",
        merchant_name: "Marchand local",
        distance_meters: 350,
        offer_lat: 45.752,
        offer_lng: 4.84,
      },
      {
        offer_id: "ba3b2932-22d0-42cb-8ccd-f44274a69124",
        title: "pipicaca",
        description: "cacac",
        price_before: 15,
        price_after: 5,
        available_until: "2025-11-02T14:24:45.068Z",
        image_url:
          "https://zhabjdyzawffsmvziojl.supabase.co/storage/v1/object/public/product-images/302664cd-85f2-476d-81a2-9b623cfc41f4/3f42aedd-b50b-4b80-809c-88965b675644.jpg",
        merchant_name: "Marchand local",
        distance_meters: 1200,
        offer_lat: 45.749,
        offer_lng: 4.86,
      },
    ]);
  }, []);

  // --------------------------------------------------------
  // 4. Placer les marqueurs des offres sur la carte
  //    et gérer le clic -> ouvre le petit popup Option 1
  // --------------------------------------------------------
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // On nettoie d'anciens layers pour éviter doublons
    // (on pourrait aussi gérer un layerGroup persistant)
    map.eachLayer((layer: any) => {
      // on ne touche pas le tileLayer de fond
      // @ts-ignore
      if (layer?.options?.attribution) return;
      // @ts-ignore
      if (layer?._icon === undefined && !layer.getLatLng) return;
    });

    // On remet la couche de fond OSM si retirée par erreur
    // -> déjà fait plus haut ; ici on ne touche pas.

    // Ajout des marqueurs
    offers.forEach((offer) => {
      if (
        typeof offer.offer_lat === "number" &&
        typeof offer.offer_lng === "number"
      ) {
        const marker = L.marker([offer.offer_lat, offer.offer_lng], {
          icon: offerIcon,
        }).addTo(map);

        marker.on("click", () => {
          setActiveOfferOnMap(offer);
        });
      }
    });
  }, [offers]);

  // --------------------------------------------------------
  // 5. Render
  // --------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row h-[100vh] bg-gray-100 text-gray-900">
      {/* --------- CARTE --------- */}
      <div className="md:w-1/2 w-full h-1/2 md:h-full relative">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 rounded-md overflow-hidden"
        />

        {/* Petit popup Option 1 (ancré visuellement en haut de la carte) */}
        {activeOfferOnMap && (
          <div className="absolute left-4 right-4 bottom-4 md:left-6 md:bottom-6 md:right-auto max-w-sm shadow-xl rounded-2xl bg-white border border-gray-200 overflow-hidden animate-[fadeIn_.2s_ease-out]">
            {/* Image + badge réduction */}
            <div className="relative h-32 w-full overflow-hidden">
              {activeOfferOnMap.image_url ? (
                <img
                  src={activeOfferOnMap.image_url}
                  alt={activeOfferOnMap.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  Pas d'image
                </div>
              )}

              {/* Badge -% */}
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                -{getDiscountPercent(
                  activeOfferOnMap.price_before,
                  activeOfferOnMap.price_after
                )}
                %
              </div>

              {/* Urgence / temps restant */}
              <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                ⏳ {getTimeRemainingLabel(activeOfferOnMap.available_until)}
              </div>
            </div>

            {/* Infos texte */}
            <div className="p-3 space-y-2">
              <div className="flex justify-between items-start">
                <div className="text-sm font-semibold leading-tight line-clamp-2">
                  {activeOfferOnMap.title || "Offre"}
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold text-sm">
                    {activeOfferOnMap.price_after}€
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    {activeOfferOnMap.price_before}€
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-2 gap-y-1">
                <span className="font-medium text-gray-800">
                  {activeOfferOnMap.merchant_name || "Marchand local"}
                </span>
                {activeOfferOnMap.distance_meters !== undefined && (
                  <span className="text-gray-500">
                    •{" "}
                    {activeOfferOnMap.distance_meters >= 1000
                      ? `${(activeOfferOnMap.distance_meters / 1000).toFixed(
                          1
                        )} km`
                      : `${Math.round(activeOfferOnMap.distance_meters)} m`}
                  </span>
                )}
              </div>

              {/* Bouton "Voir l'offre" -> ouvre la fiche détaillée */}
              <button
                onClick={() => {
                  setSelectedOffer(activeOfferOnMap);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-xl shadow"
              >
                Voir l'offre
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --------- LISTE D'OFFRES --------- */}
      <div className="md:w-1/2 w-full h-1/2 md:h-full bg-white rounded-t-2xl md:rounded-none shadow-inner overflow-y-auto p-4 space-y-4">
        {offers.map((offer) => {
          const discount = getDiscountPercent(
            offer.price_before,
            offer.price_after
          );
          return (
            <div
              key={offer.offer_id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm flex gap-4 p-3 cursor-pointer hover:shadow-md transition"
              onClick={() => {
                // Clique sur la carte ET sur la liste => même modal
                setSelectedOffer(offer);
              }}
            >
              {/* Photo + badge -% */}
              <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {offer.image_url ? (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Pas d'image
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow">
                  -{discount}%
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
                  ⏳ {getTimeRemainingLabel(offer.available_until)}
                </div>
              </div>

              {/* Infos droite */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="text-sm font-semibold leading-tight line-clamp-2">
                    {offer.title || "Offre"}
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="text-green-600 font-bold text-sm">
                      {offer.price_after}€
                    </div>
                    <div className="text-[11px] text-gray-400 line-through">
                      {offer.price_before}€
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-600 line-clamp-2">
                  {offer.description || "Pas de description"}
                </div>

                <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-2 gap-y-1 mt-1">
                  <span className="font-medium text-gray-800">
                    {offer.merchant_name || "Marchand local"}
                  </span>
                  {offer.distance_meters !== undefined && (
                    <span>
                      •{" "}
                      {offer.distance_meters >= 1000
                        ? `${(offer.distance_meters / 1000).toFixed(1)} km`
                        : `${Math.round(offer.distance_meters)} m`}
                    </span>
                  )}
                </div>

                {/* CTA Voir l'offre / Réserver */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOffer(offer);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-xl shadow"
                  >
                    Voir l'offre
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOffer(offer);
                      // plus tard: mode "direct réservation"
                    }}
                    className="flex-1 bg-black text-white text-xs font-semibold py-2 rounded-xl shadow"
                  >
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --------- MODAL FICHE DÉTAILLÉE / RÉSERVATION --------- */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-[999]">
          <div className="bg-white w-full md:max-w-md md:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Image top */}
            <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
              {selectedOffer.image_url ? (
                <img
                  src={selectedOffer.image_url}
                  alt={selectedOffer.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Pas d'image
                </div>
              )}

              {/* bouton fermer */}
              <button
                onClick={() => setSelectedOffer(null)}
                className="absolute top-3 right-3 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg"
              >
                ✕
              </button>

              {/* badge -% */}
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                -
                {getDiscountPercent(
                  selectedOffer.price_before,
                  selectedOffer.price_after
                )}
                %
              </div>

              {/* urgence */}
              <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[11px] font-semibold px-2 py-1 rounded-md">
                ⏳ {getTimeRemainingLabel(selectedOffer.available_until)}
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm text-gray-800">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-base leading-tight">
                  {selectedOffer.title || "Offre"}
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold text-base">
                    {selectedOffer.price_after}€
                  </div>
                  <div className="text-xs text-gray-400 line-through">
                    {selectedOffer.price_before}€
                  </div>
                </div>
              </div>

              <div className="text-[13px] text-gray-600 whitespace-pre-line">
                {selectedOffer.description || "Pas de description."}
              </div>

              <div className="text-[12px] text-gray-700">
                🏪{" "}
                <span className="font-medium">
                  {selectedOffer.merchant_name || "Marchand local"}
                </span>
              </div>

              {selectedOffer.distance_meters !== undefined && (
                <div className="text-[12px] text-gray-500">
                  📍{" "}
                  {selectedOffer.distance_meters >= 1000
                    ? `${(selectedOffer.distance_meters / 1000).toFixed(
                        1
                      )} km`
                    : `${Math.round(selectedOffer.distance_meters)} m`}{" "}
                  de vous
                </div>
              )}

              {/* quantité à réserver */}
              <div className="pt-2 border-t border-gray-200">
                <div className="text-[13px] font-semibold mb-2">
                  Quantité souhaitée
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQuantity((q) => (q > 1 ? q - 1 : q))
                    }
                    className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <div className="text-base font-semibold w-8 text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-100 text-lg font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTA réserver */}
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  // plus tard: appeler Supabase pour créer une réservation
                  // table reservations (offer_id, quantity, user_id, etc.)
                  console.log("Réserver", {
                    offer_id: selectedOffer.offer_id,
                    quantity,
                  });
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-3 rounded-xl shadow-lg"
              >
                Réserver
              </button>
              <button
                onClick={() => setSelectedOffer(null)}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold text-sm py-3 rounded-xl shadow-inner"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersMapAndList;
