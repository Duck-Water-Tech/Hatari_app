/**
 * Location Helper Utilities
 * Handles geolocation and distance calculations for branch filtering
 */

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param {number} lat1 - User's latitude
 * @param {number} lon1 - User's longitude
 * @param {number} lat2 - Branch latitude
 * @param {number} lon2 - Branch longitude
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const getBranchCoordinates = branch => {
  const lat =
    toNumber(branch?.latitude) ??
    toNumber(branch?.lat) ??
    toNumber(branch?.location?.latitude) ??
    toNumber(branch?.location?.lat) ??
    toNumber(branch?.coordinates?.latitude) ??
    toNumber(branch?.coordinates?.lat) ??
    toNumber(branch?.coordinates?.[1]);

  const lon =
    toNumber(branch?.longitude) ??
    toNumber(branch?.lng) ??
    toNumber(branch?.lon) ??
    toNumber(branch?.location?.longitude) ??
    toNumber(branch?.location?.lng) ??
    toNumber(branch?.coordinates?.longitude) ??
    toNumber(branch?.coordinates?.lng) ??
    toNumber(branch?.coordinates?.[0]);

  return { lat, lon };
};

/**
 * Filter branches within a specified radius from user location
 * @param {array} branches - Array of restaurant branches with latitude/longitude
 * @param {object} userLocation - User location {latitude, longitude}
 * @param {number} radiusKm - Radius in kilometers (default: 10)
 * @returns {array} - Filtered branches sorted by distance
 */
export const getNearbybranches = (
  branches,
  userLocation,
  radiusKm = 10
) => {
  if (!userLocation || !branches || branches.length === 0) {
    return branches;
  }

  const { latitude: userLat, longitude: userLon } = userLocation;

  // Calculate distance for each branch
  const branchesWithDistance = branches
    .map(branch => {
      const { lat, lon } = getBranchCoordinates(branch);
      if (lat == null || lon == null) {
        return {
          ...branch,
          distance: Number.POSITIVE_INFINITY,
        };
      }

      return {
        ...branch,
        distance: calculateDistance(userLat, userLon, lat, lon),
      };
    })
    .filter(branch => Number.isFinite(branch.distance));

  // Filter branches within radius
  const nearby = branchesWithDistance.filter(b => b.distance <= radiusKm);

  // Sort by distance (closest first)
  nearby.sort((a, b) => a.distance - b.distance);

  return nearby;
};

/**
 * Get all branches sorted by distance
 * @param {array} branches - Array of restaurant branches
 * @param {object} userLocation - User location {latitude, longitude}
 * @returns {array} - All branches sorted by distance
 */
export const sortBranchesByDistance = (branches, userLocation) => {
  if (!userLocation || !branches || branches.length === 0) {
    return branches;
  }

  const { latitude: userLat, longitude: userLon } = userLocation;

  const branchesWithDistance = branches.map(branch => {
    const { lat, lon } = getBranchCoordinates(branch);
    const distance =
      lat == null || lon == null
        ? Number.POSITIVE_INFINITY
        : calculateDistance(userLat, userLon, lat, lon);

    return {
      ...branch,
      distance,
      _latitude: lat,
      _longitude: lon,
    };
  });

  branchesWithDistance.sort((a, b) => a.distance - b.distance);
  return branchesWithDistance;
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)} km`;
};
