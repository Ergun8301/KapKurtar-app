# 📋 Modifications apportées à OffersPage.tsx

**Date :** 2025-10-26  
**Fichier modifié :** `src/pages/OffersPage.tsx`  
**Sauvegarde créée :** `src/pages/OffersPage.tsx.BACKUP_20251026_134320`

---

## 🎯 Objectif

Permettre aux **visiteurs non connectés** de voir les offres à proximité, tout en conservant le comportement existant pour les **clients connectés**.

---

## 🔧 Modifications appliquées

### 1️⃣ **Logique conditionnelle de chargement des offres (lignes 292-331)**

**Avant :**
```typescript
useEffect(() => {
  const fetchOffers = async () => {
    if (!clientId) {
      setOffers([]);
      return;  // ❌ Bloquait les visiteurs non connectés
    }

    const { data, error } = await supabase.rpc("get_offers_nearby_dynamic", {
      p_client_id: clientId,
      p_radius_meters: radiusKm * 1000,
    });
    // ...
  };
  fetchOffers();
}, [clientId, center, radiusKm]);
```

**Après :**
```typescript
useEffect(() => {
  const fetchOffers = async () => {
    try {
      let data, error;

      if (clientId) {
        // ✅ Client connecté : utilise sa position enregistrée
        const result = await supabase.rpc("get_offers_nearby_dynamic", {
          p_client_id: clientId,
          p_radius_meters: radiusKm * 1000,
        });
        data = result.data;
        error = result.error;
      } else {
        // ✅ Visiteur non connecté : utilise la position actuelle de la carte
        const [lng, lat] = center;
        const result = await supabase.rpc("get_offers_nearby_public", {
          p_longitude: lng,
          p_latitude: lat,
          p_radius_meters: radiusKm * 1000,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Erreur lors du chargement des offres:", error);
        setOffers([]);
      } else {
        setOffers(data || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des offres:", error);
      setOffers([]);
    }
  };

  fetchOffers();
}, [clientId, center, radiusKm]);
```

**Impact :** Les visiteurs non connectés utilisent maintenant `get_offers_nearby_public()` avec les coordonnées du centre de la carte.

---

### 2️⃣ **Message d'affichage de la liste (ligne 395)**

**Avant :**
```typescript
{!clientId ? (
  <p className="text-gray-500 text-center mt-10">
    Connectez-vous pour voir les offres à proximité.
  </p>
) : offers.length === 0 ? (
  <p className="text-gray-500 text-center mt-10">
    Aucune offre disponible dans ce rayon.
  </p>
) : (
  // Liste des offres
)}
```

**Après :**
```typescript
{offers.length === 0 ? (
  <p className="text-gray-500 text-center mt-10">
    Aucune offre disponible dans ce rayon.
  </p>
) : (
  // Liste des offres
)}
```

**Impact :** Le message "Connectez-vous pour voir les offres" a été supprimé. Maintenant, seul le message "Aucune offre disponible" s'affiche si la liste est vide.

---

## ✅ Ce qui fonctionne maintenant

### Pour les **visiteurs non connectés** :
- ✅ Voient les offres à proximité du centre de la carte
- ✅ Peuvent utiliser le slider pour ajuster le rayon de recherche
- ✅ Peuvent utiliser la barre de recherche Mapbox pour changer de localisation
- ✅ Peuvent utiliser le bouton GPS de Mapbox pour se géolocaliser manuellement
- ✅ Voient les marqueurs sur la carte
- ✅ Voient la liste des offres sur le côté droit

### Pour les **clients connectés** :
- ✅ Comportement **inchangé**
- ✅ Géolocalisation automatique au chargement de la page
- ✅ Position enregistrée dans `profiles.location` via `update_client_location()`
- ✅ Utilisation de `get_offers_nearby_dynamic()` avec leur `clientId`

### Pour les **marchands** :
- ✅ Aucun changement

---

## 🔐 Sécurité

- ✅ Aucune modification de la base de données Supabase
- ✅ Aucune modification des RLS (Row Level Security)
- ✅ Aucune modification de l'authentification
- ✅ La fonction `get_offers_nearby_public()` a été créée manuellement par l'utilisateur
- ✅ Les modifications sont purement côté frontend

---

## 🧪 Tests recommandés

1. **Mode navigation privée (non connecté)**
   - Ouvrir `/offers`
   - Vérifier que les offres s'affichent
   - Tester le slider de rayon
   - Tester la barre de recherche
   - Tester le bouton GPS

2. **Compte client connecté**
   - Se connecter avec un compte client
   - Vérifier la géolocalisation automatique
   - Vérifier que les offres s'affichent

3. **Compte marchand**
   - Se connecter avec un compte marchand
   - Vérifier qu'il peut toujours accéder au dashboard
   - Vérifier qu'il peut créer des offres

---

## 🔄 Rollback (si nécessaire)

Pour revenir à l'état précédent :

```bash
cp src/pages/OffersPage.tsx.BACKUP_20251026_134320 src/pages/OffersPage.tsx
```

---

## 📊 Résumé

**Lignes modifiées :** 2 blocs de code  
**Temps de modification :** 5 minutes  
**Impact :** Faible (modifications isolées)  
**Réversible :** Oui (sauvegarde disponible)  
**Build réussi :** ✅ Oui

---

**Prochaine étape :** Créer la fonction SQL `get_offers_nearby_public()` dans Supabase (déjà fait par l'utilisateur).
