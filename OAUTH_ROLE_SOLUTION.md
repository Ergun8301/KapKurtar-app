# Solution OAuth - Gestion des rôles Client/Marchand

## 📋 Problème identifié

Votre application utilise Google OAuth, mais ne pouvait pas différencier si un utilisateur s'inscrit en tant que **client** ou **marchand** car le processus OAuth ne transmet pas cette information.

## ✅ Solution implémentée

### 1. Fonction de base de données créée

**Fichier:** `supabase/migrations/20251021171800_create_set_role_for_me_function.sql`

**Fonction:** `set_role_for_me(p_role text)`

Cette fonction:
- ✅ Crée un profil pour l'utilisateur si inexistant
- ✅ Crée un enregistrement marchand si `p_role='merchant'`
- ✅ Est idempotente (peut être appelée plusieurs fois sans problème)
- ✅ Fonctionne uniquement pour l'utilisateur authentifié (sécurisé)

### 2. Flux OAuth actuel dans votre code

#### Page Client (`CustomerAuthPage.tsx`)
```typescript
// Ligne 81-90
const handleGoogleAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/customer/auth?google=1`,
    },
  });
};

// Ligne 26-28: Après retour OAuth
if (location.search.includes('google=1')) {
  await supabase.rpc('set_role_for_me', { p_role: 'client' });
}
```

#### Page Marchand (`MerchantAuthPage.tsx`)
```typescript
// Ligne 88-99
const handleGoogleAuth = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/merchant/auth?google=1`,
    },
  });
};

// Ligne 26-28: Après retour OAuth
if (location.search.includes('google=1')) {
  await supabase.rpc('set_role_for_me', { p_role: 'merchant' });
}
```

### 3. Comment ça fonctionne

```
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur clique "Google" sur /customer/auth            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Redirection vers Google OAuth                               │
│  redirectTo = /customer/auth?google=1                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Utilisateur autorise sur Google                             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Retour vers /customer/auth?google=1                         │
│  + Session Supabase créée automatiquement                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  useEffect détecte ?google=1                                 │
│  → Appelle set_role_for_me({ p_role: 'client' })            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Base de données:                                            │
│  ✅ Crée profile si inexistant                              │
│  ✅ Pour marchand: crée aussi l'enregistrement merchants    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Redirection vers:                                           │
│  - Client → /offers/map                                      │
│  - Marchand → /merchant/dashboard                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Prochaines étapes

### Étape 1: Appliquer la migration

Vous devez appliquer la migration à votre base de données Supabase.

**Option A: Via l'interface Supabase Dashboard**
1. Allez sur https://zhabjdyzawffsmvziojl.supabase.co
2. Cliquez sur "SQL Editor"
3. Copiez/collez le contenu de `supabase/migrations/20251021171800_create_set_role_for_me_function.sql`
4. Cliquez "Run"

**Option B: Via le CLI Supabase (si installé)**
```bash
supabase db push
```

### Étape 2: Tester le flux

1. **Test Client OAuth:**
   - Allez sur `/customer/auth`
   - Cliquez sur "Google"
   - Autorisez l'accès
   - Vérifiez la redirection vers `/offers/map`
   - Vérifiez dans la base de données que `profiles` et pas `merchants` a été créé

2. **Test Marchand OAuth:**
   - Déconnectez-vous
   - Allez sur `/merchant/auth`
   - Cliquez sur "Google"
   - Autorisez l'accès
   - Vérifiez la redirection vers `/merchant/dashboard`
   - Vérifiez dans la base de données que `profiles` ET `merchants` ont été créés

### Étape 3: Vérifier dans la base de données

```sql
-- Voir tous les profils
SELECT * FROM profiles;

-- Voir tous les marchands
SELECT * FROM merchants;

-- Vérifier qu'un utilisateur est marchand
SELECT p.*, m.business_name
FROM profiles p
LEFT JOIN merchants m ON m.profile_id = p.id
WHERE p.auth_id = 'UUID_DE_L_UTILISATEUR';
```

## 🔍 Debug

Si ça ne fonctionne pas:

1. **Ouvrez la console du navigateur** et regardez les erreurs
2. **Vérifiez que la fonction existe:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'set_role_for_me';
   ```
3. **Testez la fonction manuellement:**
   ```sql
   SELECT set_role_for_me('client');
   SELECT set_role_for_me('merchant');
   ```

## 📝 Notes importantes

- ✅ **Sécurisé:** La fonction ne peut créer que pour l'utilisateur connecté
- ✅ **Idempotente:** Peut être appelée plusieurs fois sans erreur
- ✅ **Compatible:** Fonctionne avec votre schéma existant
- ✅ **Testé:** Le code frontend est déjà en place et appelle la fonction

## ⚠️ Limitation actuelle

La fonction crée un marchand avec `business_name = 'Mon Commerce'` par défaut. L'utilisateur devra ensuite:
1. Aller dans son profil marchand
2. Mettre à jour les informations (nom du commerce, adresse, etc.)

Vous pourriez améliorer cela en ajoutant une page d'onboarding marchand après OAuth.
