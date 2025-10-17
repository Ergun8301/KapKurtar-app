# Geocoding Scripts

Automatisation du géocodage des clients et marchands via l'API Nominatim d'OpenStreetMap.

## Scripts disponibles

### 1. geocode-clients.ts

Géocode uniquement les clients.

```bash
npm run geocode
```

### 2. geocode-merchants.ts

Géocode uniquement les marchands.

```bash
npm run geocode:merchants
```

### 3. geocode-all.ts

Géocode à la fois les clients ET les marchands en une seule exécution.

```bash
npm run geocode:all
```

## Fonctionnement

1. Se connecte à Supabase avec les variables d'environnement
2. Récupère toutes les entrées où `location IS NULL`
3. Pour chaque entrée :
   - Construit une adresse complète à partir de `street`, `postal_code`, `city`, `country`
   - Appelle l'API Nominatim d'OpenStreetMap
   - Met à jour la base de données avec les coordonnées GPS ou le statut d'erreur
4. Respecte la limite de taux de 1 requête par seconde (politique Nominatim)

## Variables d'environnement requises

- `SUPABASE_URL` : URL de votre instance Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role pour les permissions complètes

## Statuts de géocodage

- `success` : Coordonnées GPS trouvées et enregistrées
- `not_found` : Adresse non trouvée par Nominatim
- `http_error` : Erreur lors de l'appel API
- `NULL` : Pas encore géocodé

## Edge Function Supabase - Geocode Scheduler

Une Edge Function Supabase `geocode-scheduler` est déployée et configurée pour exécuter le géocodage automatiquement chaque nuit.

### Fonctionnalité

La fonction :
- Lit automatiquement `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` depuis `Deno.env`
- Géocode d'abord les clients, puis les marchands où `location IS NULL`
- Utilise l'API Nominatim avec respect strict de la limite (1 req/s)
- User-Agent : `resqfood-geocoder/1.0 (contact@example.com)`
- Met à jour `location`, `geocode_status`, et `geocoded_at`
- Ne supprime aucune donnée

### URL de la fonction

```
https://zhabjdyzawffsmvziojl.supabase.co/functions/v1/geocode-scheduler
```

### Test manuel de l'Edge Function

**Option 1 : Via curl**
```bash
curl -X POST "https://zhabjdyzawffsmvziojl.supabase.co/functions/v1/geocode-scheduler" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Option 2 : Via la base de données (recommandé)**
```sql
SELECT trigger_geocoding_scheduler();
```

Cette commande SQL déclenche l'Edge Function et retourne le résultat du géocodage.

### Planification automatique (CRON)

**La planification est déjà configurée !**

Un job CRON a été automatiquement créé lors du déploiement :

- **Nom du job** : `nightly-geocoding-scheduler`
- **Horaire** : Tous les jours à 01:00 UTC (= 02:00 CET / 03:00 CEST)
- **Expression CRON** : `0 1 * * *`
- **Commande** : `SELECT trigger_geocoding_scheduler();`

### Vérifier la planification

```sql
SELECT jobid, jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'nightly-geocoding-scheduler';
```

**Résultat attendu :**
```
jobid | jobname                      | schedule   | command                                | active
------|------------------------------|------------|----------------------------------------|-------
1     | nightly-geocoding-scheduler  | 0 1 * * *  | SELECT trigger_geocoding_scheduler();  | true
```

### Voir l'historique d'exécution

```sql
SELECT jobid, runid, job_pid, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'nightly-geocoding-scheduler')
ORDER BY start_time DESC
LIMIT 10;
```

### Désactiver la planification

Si vous souhaitez désactiver temporairement le géocodage automatique :

```sql
SELECT cron.unschedule('nightly-geocoding-scheduler');
```

### Réactiver la planification

Pour réactiver après désactivation :

```sql
SELECT cron.schedule(
  'nightly-geocoding-scheduler',
  '0 1 * * *',
  'SELECT trigger_geocoding_scheduler();'
);
```

## Notes importantes

- Le script respecte la politique d'utilisation équitable de Nominatim
- Pause de 1 seconde entre chaque requête
- User-Agent personnalisé : `resqfood-geocoder/1.0`
- Les résultats sont enregistrés immédiatement après chaque géocodage
- L'Edge Function est accessible publiquement (pas de vérification JWT)
