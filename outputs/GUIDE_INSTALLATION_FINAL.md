# 🚀 GUIDE D'INSTALLATION - SEPET UX AMÉLIORATIONS

## 📦 FICHIERS À INSTALLER

Vous avez **3 fichiers** à copier/coller :

1. **OfferDetailsModal_FINAL.tsx**
2. **OffersPage_FINAL.tsx**
3. **MerchantDashboardPage_FINAL.tsx** (déjà bon)

---

## ✅ ÉTAPE 1 : SAUVEGARDER VOS FICHIERS ACTUELS

```bash
# Dans le terminal, depuis la racine du projet
cd src/components
mv OfferDetailsModal.tsx OfferDetailsModal_OLD.tsx

cd ../pages
mv OffersPage.tsx OffersPage_OLD.tsx
```

---

## ✅ ÉTAPE 2 : COPIER LES NOUVEAUX FICHIERS

### 📁 Fichier 1 : `OfferDetailsModal.tsx`

**Emplacement :** `src/components/OfferDetailsModal.tsx`

👉 Copiez le contenu de `outputs/OfferDetailsModal_FINAL.tsx` dans `src/components/OfferDetailsModal.tsx`

---

### 📁 Fichier 2 : `OffersPage.tsx`

**Emplacement :** `src/pages/OffersPage.tsx`

👉 Copiez le contenu de `outputs/OffersPage_FINAL.tsx` dans `src/pages/OffersPage.tsx`

---

### 📁 Fichier 3 : `MerchantDashboardPage.tsx`

**Emplacement :** `src/pages/MerchantDashboardPage.tsx`

✅ **DÉJÀ BON !** Votre fichier actuel a déjà toutes les améliorations.

Si vous voulez quand même le remplacer :
👉 Copiez le contenu de `outputs/MerchantDashboardPage_FINAL.tsx` dans `src/pages/MerchantDashboardPage.tsx`

---

## ✅ ÉTAPE 3 : LANCER LE PROJET

```bash
# Depuis la racine du projet
npm run dev
```

---

## 🧪 ÉTAPE 4 : TESTER

### Test 1 : Page Offres (Client)
- ✅ Ouvrez la page des offres
- ✅ Cliquez sur un logo marchand sur la carte
- ✅ Le bottom sheet apparaît avec toutes les offres du marchand
- ✅ Cliquez sur une offre → Modal s'ouvre
- ✅ Dans le modal, cliquez sur un "autre produit" en bas → Le modal change de produit (SANS se fermer)
- ✅ Vérifiez que le slider de rayon (10 km) est bien DERRIÈRE le modal (pas par-dessus)
- ✅ Si non connecté, cliquez "Réserver" → Modal de connexion apparaît
- ✅ Cliquez "Se connecter" → Redirige vers `/customer/auth`
- ✅ Cliquez "Commerçant ? Rejoignez-nous" → Redirige vers `/merchant/auth`

### Test 2 : Dashboard Marchand
- ✅ Connectez-vous en tant que marchand
- ✅ Créez une nouvelle offre → Elle apparaît EN HAUT à gauche
- ✅ Vérifiez les 2 sections :
  - **✅ Offres Actives** (en haut)
  - **⏸️ Offres Inactives** (en bas)
- ✅ Éditez une offre → Changez la quantité → Cliquez "Update"
- ✅ L'offre reste EN HAUT (fix du bug `updated_at`)
- ✅ Désactivez une offre (bouton Pause) → Elle passe dans "Inactives"
- ✅ Réactivez-la → Elle remonte dans "Actives" en haut

### Test 3 : Modal Détails Offre
- ✅ Vérifiez que "Position GPS, À définir" a disparu
- ✅ Barre de progression colorée visible :
  - **Verte** si > 66% du temps restant
  - **Orange** si 33-66%
  - **Rouge** si < 33%
- ✅ Format du temps intelligent :
  - Si > 48h → "X jours Yh"
  - Si < 24h → "Xh Ymin"
  - Si < 1h → "X min"
- ✅ Étoiles d'avis (grises) avec "Bientôt disponible"
- ✅ Icône favoris ❤️ (grise, pas cliquable)
- ✅ Bouton GPS "Itinéraire" fonctionne

---

## 🐛 EN CAS DE PROBLÈME

### Erreur : "Cannot find module OfferDetailsModal"
**Solution :** Vérifiez que le fichier est bien dans `src/components/OfferDetailsModal.tsx` (sans `_FINAL`)

### Le slider passe encore par-dessus le modal
**Solution :** Videz le cache du navigateur (Ctrl+Shift+Delete) et rechargez

### GPS Xiaomi ne fonctionne toujours pas
**Solution :** C'est un problème de permissions MIUI. Le message d'aide apparaît maintenant quand ça bloque.

### L'offre mise à jour ne remonte pas en haut
**Solution :** Vérifiez que la ligne 549 dans `MerchantDashboardPage.tsx` contient bien :
```typescript
updated_at: new Date().toISOString(),
```

---

## 🔙 REVENIR EN ARRIÈRE

Si quelque chose ne marche pas :

```bash
cd src/components
mv OfferDetailsModal_OLD.tsx OfferDetailsModal.tsx

cd ../pages
mv OffersPage_OLD.tsx OffersPage.tsx

# Puis relancer
npm run dev
```

---

## ✅ CE QUI A ÉTÉ AMÉLIORÉ

### 🎯 Dashboard Marchand
- ✅ 2 sections claires (Actives / Inactives)
- ✅ Nouvelles offres en haut
- ✅ Offres réactivées remontent
- ✅ Fix bug mise à jour (`updated_at`)

### 🎯 Page Offres
- ✅ Bottom Sheet pour toutes les offres du marchand
- ✅ Clic sur "autre produit" → Change sans fermer
- ✅ Slider rayon derrière le modal (z-index fixé)
- ✅ Meilleur message d'erreur GPS Xiaomi
- ✅ Modal connexion si non authentifié

### 🎯 Modal Détails
- ✅ Layout professionnel (3 zones)
- ✅ Barre progression colorée
- ✅ Format temps intelligent
- ✅ Suppression "Position GPS, À définir"
- ✅ Emplacement avis (visuel)
- ✅ Icône favoris (visuel)
- ✅ Bouton GPS itinéraire
- ✅ Responsive mobile/desktop

---

## 📞 BESOIN D'AIDE ?

Si ça ne marche pas :
1. Lisez les messages d'erreur dans la console (F12)
2. Vérifiez que les fichiers sont aux bons emplacements
3. Essayez de vider le cache et recharger

---

**Temps estimé :** 5-10 minutes
**Complexité :** ⭐⭐☆☆☆ (Facile - Juste du copier/coller)

Bon courage ! 🚀
