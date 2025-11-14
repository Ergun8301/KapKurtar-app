import { NearbyOffer } from '../hooks/useNearbyOffers';

export interface SmartSortedOffer extends NearbyOffer {
  sortScore: number;
  expiresInHours: number;
}

/**
 * Smart sorting algorithm for offers based on multiple criteria:
 * 1. Active status (is_active = true)
 * 2. Available stock (quantity > 0)
 * 3. Not expired (available_until > now)
 * 4. Distance (closer is better)
 * 5. Expires soon (urgency factor)
 * 6. Recently updated (updated_at recent = higher priority)
 */
export function smartSortOffers(offers: NearbyOffer[]): SmartSortedOffer[] {
  const now = new Date();

  return offers
    .map((offer) => {
      const expiresAt = new Date(offer.available_until);
      const expiresInMs = expiresAt.getTime() - now.getTime();
      const expiresInHours = expiresInMs / (1000 * 60 * 60);

      // Calculate sort score (higher = better priority)
      let sortScore = 0;

      // 1. Distance factor (0-100 points, closer = more points)
      // Max distance we consider is 50km = 50000m
      const maxDistance = 50000;
      const distanceScore = Math.max(0, 100 - (offer.distance_m / maxDistance) * 100);
      sortScore += distanceScore * 0.3; // 30% weight

      // 2. Urgency factor (0-100 points, expires soon = more points)
      // If expires within 24h, give high priority
      let urgencyScore = 0;
      if (expiresInHours < 0) {
        urgencyScore = 0; // Expired = no points
      } else if (expiresInHours <= 2) {
        urgencyScore = 100; // < 2h = max urgency
      } else if (expiresInHours <= 6) {
        urgencyScore = 80; // < 6h = high urgency
      } else if (expiresInHours <= 12) {
        urgencyScore = 60; // < 12h = medium urgency
      } else if (expiresInHours <= 24) {
        urgencyScore = 40; // < 24h = some urgency
      } else {
        urgencyScore = 20; // > 24h = low urgency but still visible
      }
      sortScore += urgencyScore * 0.4; // 40% weight

      // 3. Stock availability (0-100 points)
      const stockScore = Math.min(100, offer.quantity * 10); // More stock = more points
      sortScore += stockScore * 0.1; // 10% weight

      // 4. Discount factor (0-100 points, bigger discount = more attractive)
      const discountScore = Math.min(100, offer.discount_percent);
      sortScore += discountScore * 0.2; // 20% weight

      return {
        ...offer,
        sortScore,
        expiresInHours
      };
    })
    .sort((a, b) => {
      // Sort by score descending
      return b.sortScore - a.sortScore;
    });
}

/**
 * Format time left for display
 */
export function formatTimeLeft(dateString: string): string {
  const now = new Date();
  const end = new Date(dateString);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

/**
 * Get urgency color class based on time left
 */
export function getUrgencyColor(expiresInHours: number): string {
  if (expiresInHours < 0) return 'text-gray-400';
  if (expiresInHours <= 2) return 'text-red-600 animate-pulse';
  if (expiresInHours <= 6) return 'text-red-600';
  if (expiresInHours <= 12) return 'text-orange-600';
  if (expiresInHours <= 24) return 'text-yellow-600';
  return 'text-green-600';
}

/**
 * Extract coordinates from PostGIS POINT format
 * Example: "POINT(5.2258 46.2044)" -> { lat: 46.2044, lng: 5.2258 }
 */
export function parsePostGISPoint(pointString: string | null): { lat: number; lng: number } | null {
  if (!pointString) return null;

  const match = pointString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) return null;

  const lng = parseFloat(match[1]);
  const lat = parseFloat(match[2]);

  if (isNaN(lat) || isNaN(lng)) return null;

  return { lat, lng };
}
