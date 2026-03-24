# Branch Location Filtering Feature

## Overview
This feature shows users the nearest restaurant branches based on their current location. By default, only branches within 10km are displayed. Users can toggle to view all available branches with distance information.

## Features Implemented

### 1. **Auto-detect User Location**
- Uses `react-native-geolocation-service` to get real-time user coordinates
- Triggers automatically when the header mounts
- Includes error handling for location permission denial

### 2. **10km Proximity Filter**
- Automatically filters branches within 10km radius
- If 3 (or more) nearby branches exist, shows only these by default
- Falls back to showing all branches if none are within 10km

### 3. **Distance Calculation**
- Uses Haversine formula for accurate geographic distance
- Calculates straight-line distance between user and branch
- Displays distance to 1 decimal place (e.g., "2.3 km away")

### 4. **Toggle Between Views**
- **Nearby View**: Shows branches within 10km with "📍 Nearby" badge
- **All Branches View**: Shows all branches sorted by distance
- Toggle button appears only if nearby branches exist and are fewer than total branches
- Button text shows: "View All {count} Branches →" or "← View {count} Nearby Branches"

### 5. **Visual Indicators**
- **Nearby Branches**: Highlighted with light red background (#FFEBEE)
- **Distance Labels**: Gray subtext showing "X.X km away"
- **Info Box**: Orange header showing "📍 {count} branch(es) within 10km"
- **Selected Branch**: Bold red text (#e91e3c)

## Data Structure Required

Each branch in `restaurantList` must include:
```javascript
{
  _id: "branch_id",
  name: "Branch Name",
  latitude: 22.5726,        // Required for distance calculation
  longitude: 88.3639,       // Required for distance calculation
  isActive: true,
  // ... other fields
}
```

## Files Modified

### 1. `/src/components/Homeheader.js`
- Added location-based branch filtering logic
- Implements toggle between nearby and all branches
- Enhanced dropdown UI with distance display and badges

**Key Changes:**
- State: `showAllBranches`, `userLocation`, `nearbyBranches`, `filteredRestaurants`
- Location permission: Uses device location with graceful fallback
- Dynamic filtering based on user location and view preference

### 2. `/src/utils/locationHelper.js` (NEW)
- Centralized location calculation utilities
- `calculateDistance()`: Haversine formula implementation
- `getNearbybranches()`: Filter branches within radius
- `sortBranchesByDistance()`: Sort all branches by proximity
- `formatDistance()`: Format distance for display

## Usage Example

When user opens the app:
1. Location is fetched automatically
2. If 3 branches exist within 10km:
   - Show only those 3 with orange info header: "📍 3 branches within 10km"
   - Each shows "2.5 km away" distance
   - "View All 10 Branches →" button appears
3. User can tap "View All 10 Branches →" to see all branches
4. Each branch shows distance sorted from nearest to farthest
5. "← View 3 Nearby Branches" button allows returning to nearby view

## Permissions Required (Android/iOS)

**Android** (`AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

**iOS** (`Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby branches</string>
```

## Performance Considerations

- **Calculation**: Only runs when `restaurantList` or `showAllBranches` changes
- **Geolocation**: Timeout of 15 seconds, caches location for 10 seconds
- **Rendering**: Only filtered branches are rendered in dropdown
- **Memory**: Minimal overhead with distance property added to branch objects

## Fallback Behavior

If location access is denied or unavailable:
1. Shows all branches in default order
2. No distance information displayed
3. User can still select any branch manually
4. No error message displayed (silent fallback)

## Future Enhancements

Possible improvements for Phase 2:
- Geofencing: Notify when user enters delivery zone
- Real-time location updates (continuous tracking)
- Map view integration
- Estimated delivery time based on distance
- Branch operating hours check
- Category-specific nearest branch (e.g., "nearest with desserts")
- Cache location to reduce permission requests

## Testing Checklist

- [ ] Location permission grant → shows nearby branches
- [ ] Location permission denied → shows all branches
- [ ] Toggle between nearby and all views
- [ ] Distance calculation accuracy (compare with Google Maps)
- [ ] App works on Android and iOS
- [ ] Performance with 10+ branches
- [ ] Branch selection updates correctly
- [ ] Cart updates when branch changes

## Dependencies

```json
{
  "react-native-geolocation-service": "^5.3.1"
}
```

Already installed in `package.json`.

## Support

For issues or questions about branch filtering, check:
1. Branch data includes `latitude` and `longitude`
2. Location permissions are granted
3. Device GPS is enabled
4. Network connectivity is available
