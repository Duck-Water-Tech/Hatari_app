# Branch Location Feature - Visual Flow Diagrams

## 1. User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Request Location Permission │
        └────────────┬───────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
    GRANTED                     DENIED
         │                        │
         ▼                        ▼
    Get GPS Coords        Show All Branches
         │                  (in original order)
         │                        │
         ▼                        └──────┐
    Calculate Distances                 │
         │                              │
         ▼                              │
    Filter Within 10km                  │
         │                              │
         ▼                              │
    Found 3+ Nearby?                    │
         │                              │
    ┌────┴────┐                         │
    │          │                        │
   YES       NO                         │
    │          │                        │
    ▼          ▼                        │
  Show 3   Show All                     │
  Nearby  Sorted by Distance            │
    │          │                        │
    └──────┬───┴────────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ User Sees Dropdown  │
    └──────────┬──────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    TAP BRANCH  TAP TOGGLE
        │             │
        ▼             ▼
    Select Branch   View All/Nearby
        │             │
        ▼             ▼
    Update Redux   Switch View
    Close Dropdown Update Filtered List
```

---

## 2. Distance Calculation Process

```
                    ┌──────────────────────┐
                    │  USER LOCATION       │
                    │  (22.5726, 88.3639)  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │Branch 1          │ │Branch 2      │ │Branch 3      │
    │(22.5889,88.3506) │ │(22.5450,...) │ │(22.4500,...) │
    └────────┬─────────┘ └──────┬───────┘ └────────┬─────┘
             │                  │                   │
             │ Haversine Formula (3x) ◄──────────────
             │
             ▼         ▼         ▼
         2.3 km    4.2 km    15.5 km
             │         │         │
             └────┬────┴────┬────┘
                  │         │
        ┌─────────▼─────────▼─────────┐
        │  Filter Within 10km Radius  │
        └─────────┬─────────┬─────────┘
                  │         │
              PASS        FAIL
                  │         │
              2.3 km    15.5 km (excluded)
              4.2 km
                  │
                  ▼
        ┌──────────────────────┐
        │ Show 2 Nearby Branch │
        │ + All Branches Toggle│
        └──────────────────────┘
```

---

## 3. Component State Management

```
┌───────────────────────────────────────────────────────────┐
│            HOMEHEADER COMPONENT STATE                     │
├───────────────────────────────────────────────────────────┤
│                                                            │
│ Redux Input:                                              │
│ ├─ restaurantList (10 branches)                           │
│ ├─ selectedRestaurant (current branch)                    │
│ └─ cartItems (for badge count)                           │
│                                                            │
│ Local State:                                              │
│ ├─ showDropdown (Boolean)                                 │
│ │   └─ Controls if branch list visible                   │
│ │                                                         │
│ ├─ showAllBranches (Boolean)                             │
│ │   └─ FALSE: Show nearby only                           │
│ │   └─ TRUE: Show all sorted by distance                │
│ │                                                         │
│ ├─ userLocation (Object)                                  │
│ │   └─ {latitude: 22.5726, longitude: 88.3639}          │
│ │                                                         │
│ ├─ nearbyBranches (Array)                                │
│ │   └─ Branches within 10km                              │
│ │                                                         │
│ └─ filteredRestaurants (Array)                           │
│     └─ Currently displayed branches                      │
│       └─ Based on showAllBranches flag                   │
│                                                            │
│ Effect Triggers:                                          │
│ └─ useEffect([restaurantList, showAllBranches])          │
│     Recalculates on list change or toggle                │
│                                                            │
└───────────────────────────────────────────────────────────┘
```

---

## 4. Branch Display Logic

```
        Input: restaurantList (10 branches)
                  + userLocation
        │
        ▼
   ┌─────────────────────────────────────┐
   │ Calculate distance for all branches │
   │ Using: Haversine formula            │
   └──────────────┬──────────────────────┘
                  │
        ┌─────────▼────────────┐
        │ Sort by distance ASC │
        └─────────┬────────────┘
                  │
        ┌─────────▼──────────────────────┐
        │ Filter within 10km (nearbyBr)  │
        └─────────┬──────────────────────┘
                  │
        ┌─────────▼─────────────────┐
        │ showAllBranches == TRUE?  │
        └─────────┬─────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
        YES               NO
         │                 │
         ▼                 ▼
   Return All      nearbyBr.length > 0?
   (Already        │
   Sorted)    ┌────┴────┐
              │          │
             YES        NO
              │          │
              ▼          ▼
          Return    Return All
          Nearby    Sorted
              │      │
              └──┬───┘
                 │
                 ▼
        ┌──────────────────────┐
        │ filteredRestaurants  │
        │ (to be displayed)    │
        └──────────────────────┘
```

---

## 5. UI Rendering Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                      HomeHeader                              │
└────────────┬─────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌─────────┐      ┌──────────────┐
│ Header  │      │ Dropdown     │
│ (Red)   │      │ (Conditional)│
└────┬────┘      └──────┬───────┘
     │                  │
     │                  ├─ BranchInfoBox (if nearby)
     │                  │  └─ "📍 3 branches within 10km"
     │                  │
     │                  ├─ ScrollView
     │                  │  ├─ DropdownItem (each branch)
     │                  │  │  ├─ Branch Name
     │                  │  │  ├─ Distance: "2.3 km away"
     │                  │  │  └─ "📍 Nearby" Badge (if within 10km)
     │                  │  │
     │                  │  └─ DropdownItem (more branches...)
     │                  │
     │                  └─ ToggleButton (if applicable)
     │                     └─ "View All 10 Branches →"
     │
     ├─ BranchSelector (Button)
     │  └─ Shows selected branch name
     │
     ├─ Cart (Button + Badge)
     │  └─ Shows item count
     │
     └─ SearchInput
        └─ Navigate to menu
```

---

## 6. Distance Filtering Example

```
Branch Data:                    After Calculation:
┌─────────────────────┐        ┌──────────────────────┐
│ Hatari Downtown     │        │ 2.3 km - Nearby      │
│ Hatari North        │   →    │ 3.8 km - Nearby      │
│ Hatari South        │        │ 4.2 km - Nearby      │
│ Hatari East         │        │ 12.5 km              │
│ Hatari West         │        │ 15.3 km              │
│ Hatari Central      │        │ 8.9 km - Nearby      │
│ Hatari SouthEast    │        │ 25.0 km              │
│ Hatari NorthEast    │        │ 18.5 km              │
│ Hatari SouthWest    │        │ 22.1 km              │
│ Hatari NorthWest    │        │ 19.8 km              │
└─────────────────────┘        └──────────────────────┘
    10 Branches                    Sorted by Distance

Display Logic:
┌─────────────────────────────────────┐
│ Filter 10km Radius:                 │
│ ✓ 2.3 km - Hatari Downtown (SHOW)   │
│ ✓ 3.8 km - Hatari North (SHOW)      │
│ ✓ 4.2 km - Hatari South (SHOW)      │
│ ✗ 8.9 km - Hatari Central (HIDE)    │  Wait, 8.9 < 10!
│ ✗ 12.5 km - Hatari East (HIDE)      │
│ ✓ 8.9 km - Hatari Central (SHOW)    │  Include in nearby
│ ... others excluded                  │
│                                     │
│ Result: 4 Branches Within 10km      │
│ Show: 4 Nearby + Toggle              │
└─────────────────────────────────────┘
```

---

## 7. Decision Tree

```
                        START
                          │
                          ▼
              ┌───────────────────────┐
              │ Location Permission?  │
              └────────┬──────┬───────┘
                      │      │
                    YES     NO
                      │      │
                      ▼      ▼
              ┌──────────┐ Show All
              │Get Coords│ Branches
              └────┬─────┘ (No Filter)
                   │
                   ▼
        ┌──────────────────────┐
        │ Calculate Distances  │
        │ for all branches     │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────┐
        │ Filter within    │
        │ 10km radius      │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────────────────┐
        │ nearbyBranches.length >= 1?  │
        └────────┬────────┬────────────┘
                 │        │
               YES        NO
                 │         │
                 ▼         ▼
        Show Nearby    Show All
        + Toggle       (No Toggle)
                 │         │
                 └────┬────┘
                      │
                      ▼
            ┌──────────────────┐
            │ Render Dropdown  │
            │ with Filtered    │
            │ Branches         │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ User Selects     │
            │ Branch           │
            └────────┬─────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Update Redux     │
            │ Close Dropdown   │
            └──────────────────┘
```

---

## 8. Component Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│                    COMPONENT MOUNTED                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Initialize State:      │
        │ - showDropdown: false  │
        │ - showAllBranches: false
        │ - userLocation: null   │
        │ - nearbyBranches: []   │
        │ - filteredRestaurants: []
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ useEffect Hook Triggered   │
        │ [restaurantList,           │
        │  showAllBranches]          │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Get Location or Fail   │
        │ (15s timeout)          │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
    SUCCESS                      ERROR
        │                         │
        ▼                         ▼
    Set userLocation      setFilteredRestaurants
    Calculate Distance    = restaurantList
    Filter Branches       (fallback)
        │                         │
        ▼                         ▼
    setState                  Component Renders
    - nearbyBranches            with All Branches
    - filteredRestaurants       (No Filter)
        │                         │
        │                         │
        └────────────┬────────────┘
                     │
                     ▼
        ┌────────────────────┐
        │ Component Renders  │
        │ with Filtered List │
        └────────────┬───────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ User Interaction:          │
        │ - Tap Dropdown             │
        │ - Select Branch            │
        │ - Toggle View              │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ Component Re-renders       │
        │ (useState/useEffect hooks) │
        └────────────────────────────┘
```

---

## 9. Distance Calculation (Haversine)

```
INPUT: 
  User: (22.5726°N, 88.3639°E)
  Branch: (22.5889°N, 88.3506°E)

FORMULA:
  R = 6371 km (Earth's radius)
  
  ΔLat = (22.5889 - 22.5726) × π/180 = 0.00285 rad
  ΔLon = (88.3506 - 88.3639) × π/180 = -0.00232 rad
  
  a = sin²(ΔLat/2) + cos(22.5726°) × cos(22.5889°) × sin²(ΔLon/2)
  c = 2 × atan2(√a, √(1-a))
  d = R × c

OUTPUT:
  Distance ≈ 2.3 km

ACCURACY:
  ✓ 4 decimal places = ~11 meters accuracy
  ✓ Straight-line distance (not road distance)
  ✓ Fast calculation (~1ms)
```

---

These diagrams help visualize:
- ✅ User interaction flow
- ✅ State management
- ✅ Component rendering
- ✅ Distance calculation
- ✅ Decision logic
- ✅ Component lifecycle
