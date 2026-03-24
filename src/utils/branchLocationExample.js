/**
 * Example API Response Format for Restaurant Branches
 * This shows the data structure expected by the branch location filtering feature
 */

// Example: GET /api/restaurant/list response
const exampleRestaurantListResponse = {
  success: true,
  message: "Restaurants fetched successfully",
  data: [
    {
      _id: "641a2f1b3e5f9c2d4e6g7h8i",
      name: "Hatari Downtown",
      latitude: 22.5726,
      longitude: 88.3639,
      address: "123 Main St, Kolkata",
      city: "Kolkata",
      phone: "+91 98765 43210",
      isActive: true,
      isOpen: true,
      rating: 4.5,
      deliveryTime: 30,
      deliveryCharges: 40,
      image: "https://api.example.com/images/branch1.jpg",
      // ... other fields
    },
    {
      _id: "641a2f1b3e5f9c2d4e6g7h8j",
      name: "Hatari North",
      latitude: 22.5889,
      longitude: 88.3506,
      address: "456 Park Ave, Kolkata",
      city: "Kolkata",
      phone: "+91 98765 43211",
      isActive: true,
      isOpen: true,
      rating: 4.7,
      deliveryTime: 25,
      deliveryCharges: 30,
      image: "https://api.example.com/images/branch2.jpg",
      // ... other fields
    },
    {
      _id: "641a2f1b3e5f9c2d4e6g7h8k",
      name: "Hatari South",
      latitude: 22.5450,
      longitude: 88.3450,
      address: "789 Beach Rd, Kolkata",
      city: "Kolkata",
      phone: "+91 98765 43212",
      isActive: true,
      isOpen: false, // Closed now, but shown as unavailable
      rating: 4.3,
      deliveryTime: 35,
      deliveryCharges: 45,
      image: "https://api.example.com/images/branch3.jpg",
      // ... other fields
    },
    // ... more branches (up to 10 total)
  ],
};

/**
 * How the feature uses this data:
 * 
 * 1. User opens app → component fetches restaurantList from Redux
 * 2. HomeHeader component gets user's location via Geolocation
 * 3. For each branch, calculates distance using:
 *    distance = Haversine(userLat, userLon, branch.latitude, branch.longitude)
 * 
 * 4. Adds distance property to each branch:
 *    branch.distance = 2.3  // km
 * 
 * 5. Filters branches:
 *    nearbyBranches = branches.filter(b => b.distance <= 10)  // within 10km
 * 
 * 6. Display behavior:
 *    - If nearbyBranches.length > 0: Show nearby branches first
 *    - Otherwise: Show all branches sorted by distance
 *    - If showAllBranches = true: Show all branches sorted by distance
 */

// Example: After distance calculation and filtering
const exampleBranchesWithDistance = [
  {
    _id: "641a2f1b3e5f9c2d4e6g7h8i",
    name: "Hatari Downtown",
    latitude: 22.5726,
    longitude: 88.3639,
    address: "123 Main St, Kolkata",
    distance: 2.3, // 2.3 km away
    isActive: true,
    // ... other fields
  },
  {
    _id: "641a2f1b3e5f9c2d4e6g7h8j",
    name: "Hatari North",
    latitude: 22.5889,
    longitude: 88.3506,
    address: "456 Park Ave, Kolkata",
    distance: 3.8, // 3.8 km away
    isActive: true,
    // ... other fields
  },
  {
    _id: "641a2f1b3e5f9c2d4e6g7h8k",
    name: "Hatari South",
    latitude: 22.5450,
    longitude: 88.3450,
    address: "789 Beach Rd, Kolkata",
    distance: 4.2, // 4.2 km away
    isActive: true,
    // ... other fields
  },
  // ... more branches, only showing those within 10km
];

/**
 * Ensuring your API response includes latitude and longitude:
 * 
 * Backend Requirements:
 * - Each branch MUST have latitude and longitude fields
 * - Use decimal format (e.g., 22.5726, not "22°34'21.4"N")
 * - Accuracy should be to at least 4 decimal places (≈11 meters)
 * 
 * If your API doesn't return these:
 * 1. Update backend to include: latitude, longitude in response
 * 2. Or: Map them from separate geolocation API
 * 3. Or: Store them in a separate coordinates table
 * 
 * Example backend query:
 * db.restaurants.find({}, {
 *   name: 1,
 *   address: 1,
 *   latitude: 1,      // REQUIRED
 *   longitude: 1,     // REQUIRED
 *   isActive: 1,
 *   // ... other fields
 * })
 */

/**
 * Testing the feature:
 * 
 * Scenario 1: User in city center (22.5726, 88.3639)
 * Expected: Shows 3 nearby branches, offers "View All 10 Branches"
 * 
 * Scenario 2: User in outskirts (22.4500, 88.5000)
 * Expected: Shows 2 nearby branches within 10km
 * 
 * Scenario 3: User denies location permission
 * Expected: Shows all 10 branches (no filtering)
 * 
 * Scenario 4: User toggles "View All Branches"
 * Expected: All branches shown sorted by distance
 * 
 * Scenario 5: User selects a branch
 * Expected: Branch name updates in header, dropdown closes,
 *          experience state updated in Redux
 */

export { exampleRestaurantListResponse, exampleBranchesWithDistance };
