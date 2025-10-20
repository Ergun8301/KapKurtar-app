# Scripts Directory

This directory previously contained geocoding automation scripts that have been removed as part of the project's transition to a GPS-only geolocation approach.

## Removed Scripts

The following scripts have been removed:
- `geocode-clients.ts` - Client geocoding automation
- `geocode-merchants.ts` - Merchant geocoding automation
- `geocode-all.ts` - Combined geocoding script

## Current Approach

The project now uses GPS-based geolocation exclusively via the browser's `navigator.geolocation` API. Users provide their location by:

1. Granting permission to access their device location
2. Using the "Use Current Location" button in the UI
3. Coordinates are directly saved to the database via RPC functions

## Location Update Functions

The following RPC functions are available for updating user locations:

- `profiles_update_location(user_id, longitude, latitude)` - Updates profile location
- `update_client_location(client_id, longitude, latitude, status)` - Updates client location
- `update_merchant_location(merchant_id, longitude, latitude, status)` - Updates merchant location

These functions accept GPS coordinates directly from the browser and store them in PostGIS format in the database.
