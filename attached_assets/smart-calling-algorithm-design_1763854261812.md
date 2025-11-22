# Smart Calling & Route Optimization Algorithm Design
## QuantumPunch - Field Sales Visit Scheduler

**Version:** 1.0  
**Date:** November 22, 2025  
**Purpose:** Optimize calling team priorities and field rep routes to maximize in-person visit efficiency

---

## Executive Summary

This algorithm coordinates distributed calling teams (Nigeria/Pakistan) with field sales reps (Miami, DC) to optimize appointment booking and in-person visit routing. It dynamically clusters prospects geographically, suggests optimal appointment dates, and ensures field reps can complete 3-4 visits per 8-hour shift with 45-minute visits and reasonable drive times.

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CALLING TEAM INTERFACE                    │
│  - Prioritized prospect list (auto-refreshed)                │
│  - Suggested appointment dates/times                         │
│  - Real-time calendar availability                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SMART CALLING ALGORITHM (Core)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Route Analyzer (HERE API Integration)           │   │
│  │  2. Priority Scoring Engine                         │   │
│  │  3. Calendar Optimizer (Google Calendar)            │   │
│  │  4. Dynamic Clustering Logic                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA SOURCES & INTEGRATIONS                  │
│  - Prospect Database (CRM)                                   │
│  - Google Calendar API (Field Rep Availability)              │
│  - HERE Routing API v8 (Drive Time/Traffic)                 │
│  - HERE Geocoding API (Address → Coordinates)               │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Data Structures

### 1. Prospect Record
```javascript
{
  id: "uuid",
  businessName: "string",
  phoneNumber: "string",
  address: {
    street: "string",
    city: "string",
    state: "string",
    zipCode: "string",
    lat: null | number,  // Geocoded
    lng: null | number   // Geocoded
  },
  specialty: "dermatology" | "plastic_surgery" | "dentistry" | "chiropractic",
  territory: "miami" | "dc",
  callHistory: [
    {
      attemptDate: "ISO 8601",
      outcome: "no_answer" | "voicemail" | "declined" | "callback" | "booked",
      notes: "string"
    }
  ],
  appointmentStatus: {
    isBooked: boolean,
    scheduledDate: null | "ISO 8601",
    fieldRepId: null | "uuid"
  },
  priorityScore: null | number,  // Calculated dynamically
  lastContactDate: null | "ISO 8601"
}
```

### 2. Field Rep Record
```javascript
{
  id: "uuid",
  name: "string",
  territory: "miami" | "dc",
  homeZipCode: "string",  // "22101" for DC, configurable for Miami
  homeCoordinates: {
    lat: number,
    lng: number
  },
  workSchedule: {
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    startTime: "09:00",  // EST
    endTime: "17:00"     // EST
  },
  googleCalendarId: "string"
}
```

### 3. Route Day Object
```javascript
{
  date: "YYYY-MM-DD",
  fieldRepId: "uuid",
  territory: "miami" | "dc",
  anchorAppointment: {
    prospectId: "uuid",
    scheduledTime: "HH:MM",
    coordinates: { lat: number, lng: number }
  },
  appointments: [
    {
      prospectId: "uuid",
      scheduledTime: "HH:MM",
      estimatedDuration: 45,  // minutes
      coordinates: { lat: number, lng: number },
      driveTimeFromPrevious: number  // minutes
    }
  ],
  totalDriveTime: number,  // minutes
  totalVisitTime: number,  // minutes
  capacity: 3-4,  // visits per day
  clusterRadius: 30  // minutes drive time
}
```

---

## Algorithm Components

### Component 1: Geocoding Service
**Purpose:** Convert prospect addresses to lat/lng coordinates

```javascript
async function geocodeProspect(prospect) {
  const address = `${prospect.address.street}, ${prospect.address.city}, ${prospect.address.state} ${prospect.address.zipCode}`;
  
  const response = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${HERE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return {
      lat: data.items[0].position.lat,
      lng: data.items[0].position.lng
    };
  }
  
  throw new Error(`Unable to geocode address: ${address}`);
}

// Pre-process: Geocode all prospects on import/update
async function geocodeAllProspects(prospects) {
  const batchSize = 50;  // HERE API rate limit consideration
  
  for (let i = 0; i < prospects.length; i += batchSize) {
    const batch = prospects.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (prospect) => {
      if (!prospect.address.lat || !prospect.address.lng) {
        try {
          const coords = await geocodeProspect(prospect);
          prospect.address.lat = coords.lat;
          prospect.address.lng = coords.lng;
          await updateProspectInDB(prospect);
        } catch (error) {
          console.error(`Failed to geocode prospect ${prospect.id}:`, error);
        }
      }
    }));
    
    // Rate limiting pause
    await sleep(1000);
  }
}
```

---

### Component 2: Drive Time Calculator (HERE Routing API)
**Purpose:** Calculate real-time/predicted drive times between locations

```javascript
async function calculateDriveTime(originCoords, destinationCoords, departureTime) {
  // departureTime should be ISO 8601 format (e.g., "2025-11-25T10:30:00-05:00")
  
  const url = `https://router.hereapi.com/v8/routes?` + 
    `transportMode=car&` +
    `origin=${originCoords.lat},${originCoords.lng}&` +
    `destination=${destinationCoords.lat},${destinationCoords.lng}&` +
    `departureTime=${departureTime}&` +
    `return=summary&` +
    `apiKey=${HERE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.routes && data.routes.length > 0) {
    return {
      durationMinutes: Math.ceil(data.routes[0].sections[0].summary.duration / 60),
      distanceKm: data.routes[0].sections[0].summary.length / 1000
    };
  }
  
  throw new Error('Unable to calculate route');
}

// Calculate drive time matrix for multiple destinations
async function calculateDriveTimeMatrix(originCoords, destinationCoordsList, departureTime) {
  const results = [];
  
  for (const destCoords of destinationCoordsList) {
    try {
      const driveTime = await calculateDriveTime(originCoords, destCoords, departureTime);
      results.push({
        destination: destCoords,
        driveTimeMinutes: driveTime.durationMinutes,
        distanceKm: driveTime.distanceKm
      });
    } catch (error) {
      results.push({
        destination: destCoords,
        driveTimeMinutes: null,
        distanceKm: null,
        error: error.message
      });
    }
    
    // Rate limiting
    await sleep(200);
  }
  
  return results;
}
```

---

### Component 3: Priority Scoring Engine
**Purpose:** Rank prospects based on multiple factors

**Priority Hierarchy:**
1. Geographic density (highest weight)
2. Proximity to already-scheduled appointments
3. Time since last contact (longest = higher priority)
4. Specialty (Dermatology > Plastic Surgery > Dentistry > Chiropractic)

```javascript
function calculatePriorityScore(prospect, context) {
  let score = 0;
  
  // Factor 1: Geographic Density (Weight: 40%)
  // Find prospects within 5-mile radius
  const nearbyProspects = findProspectsWithinRadius(
    prospect.address.lat,
    prospect.address.lng,
    5,  // miles
    context.allProspects
  );
  
  const densityScore = Math.min(nearbyProspects.length * 10, 400);  // Cap at 400
  score += densityScore;
  
  // Factor 2: Proximity to Scheduled Appointments (Weight: 30%)
  const scheduledAppointments = context.scheduledAppointments.filter(
    appt => appt.territory === prospect.territory
  );
  
  if (scheduledAppointments.length > 0) {
    const closestAppointment = findClosestAppointment(prospect, scheduledAppointments);
    
    if (closestAppointment.driveTimeMinutes <= 30) {
      // Exponential decay: closer = higher score
      const proximityScore = 300 * Math.exp(-closestAppointment.driveTimeMinutes / 20);
      score += proximityScore;
    }
  }
  
  // Factor 3: Time Since Last Contact (Weight: 20%)
  const daysSinceLastContact = prospect.lastContactDate 
    ? Math.floor((Date.now() - new Date(prospect.lastContactDate)) / (1000 * 60 * 60 * 24))
    : 365;  // Assume 1 year if never contacted
  
  const recencyScore = Math.min(daysSinceLastContact * 2, 200);  // Cap at 200
  score += recencyScore;
  
  // Factor 4: Specialty Priority (Weight: 10%)
  const specialtyScores = {
    dermatology: 100,
    plastic_surgery: 75,
    dentistry: 50,
    chiropractic: 25
  };
  
  score += specialtyScores[prospect.specialty] || 0;
  
  // Bonus: Never contacted before (add 50 points)
  if (!prospect.lastContactDate) {
    score += 50;
  }
  
  return Math.round(score);
}

function findProspectsWithinRadius(lat, lng, radiusMiles, allProspects) {
  return allProspects.filter(p => {
    if (!p.address.lat || !p.address.lng) return false;
    
    const distance = calculateHaversineDistance(
      lat, lng,
      p.address.lat, p.address.lng
    );
    
    return distance <= radiusMiles;
  });
}

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3959;  // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
```

---

### Component 4: Calendar Availability Checker
**Purpose:** Check field rep calendar and ensure feasible scheduling

```javascript
async function getFieldRepAvailability(fieldRepId, startDate, endDate) {
  // Integrate with Google Calendar API
  const calendar = await googleCalendar.events.list({
    calendarId: fieldRep.googleCalendarId,
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  });
  
  return calendar.data.items;
}

async function findAvailableTimeSlots(fieldRepId, targetDate) {
  const fieldRep = await getFieldRep(fieldRepId);
  const existingEvents = await getFieldRepAvailability(
    fieldRepId,
    new Date(targetDate + 'T00:00:00'),
    new Date(targetDate + 'T23:59:59')
  );
  
  // Define work hours (9am-5pm EST)
  const workStart = 9;  // 9:00 AM
  const workEnd = 17;   // 5:00 PM
  
  const bookedSlots = existingEvents.map(event => ({
    start: new Date(event.start.dateTime).getHours() + 
           new Date(event.start.dateTime).getMinutes() / 60,
    end: new Date(event.end.dateTime).getHours() + 
         new Date(event.end.dateTime).getMinutes() / 60
  }));
  
  // Calculate available slots
  const availableSlots = [];
  let currentTime = workStart;
  
  bookedSlots.sort((a, b) => a.start - b.start);
  
  for (const slot of bookedSlots) {
    if (currentTime < slot.start) {
      availableSlots.push({
        start: currentTime,
        end: slot.start
      });
    }
    currentTime = Math.max(currentTime, slot.end);
  }
  
  // Add remaining time after last appointment
  if (currentTime < workEnd) {
    availableSlots.push({
      start: currentTime,
      end: workEnd
    });
  }
  
  return availableSlots;
}

function canFitAppointment(availableSlots, visitDuration, driveTime) {
  const totalTimeNeeded = (visitDuration + driveTime) / 60;  // Convert to hours
  
  for (const slot of availableSlots) {
    const slotDuration = slot.end - slot.start;
    if (slotDuration >= totalTimeNeeded) {
      return {
        canFit: true,
        suggestedStartTime: slot.start,
        suggestedEndTime: slot.start + totalTimeNeeded
      };
    }
  }
  
  return { canFit: false };
}
```

---

### Component 5: Dynamic Clustering Logic
**Purpose:** Build optimal route days by clustering nearby appointments

```javascript
async function findOrCreateRouteDay(prospect, fieldRep, targetDate = null) {
  // Step 1: Check if there's an existing route day with capacity
  const existingRouteDays = await getRouteDays(fieldRep.id, targetDate);
  
  for (const routeDay of existingRouteDays) {
    // Check if prospect is within 30-minute drive of route cluster
    const anchorCoords = routeDay.anchorAppointment.coordinates;
    const driveTime = await calculateDriveTime(
      anchorCoords,
      { lat: prospect.address.lat, lng: prospect.address.lng },
      `${routeDay.date}T10:00:00-05:00`  // Midday for average traffic
    );
    
    if (driveTime.durationMinutes <= 30 && routeDay.appointments.length < 4) {
      // Found a suitable route day
      return {
        routeDay: routeDay,
        suggestedDate: routeDay.date,
        isNewRoute: false
      };
    }
  }
  
  // Step 2: No existing route works - create new route day
  // Find next available date with open calendar
  const nextAvailableDate = await findNextAvailableDateForNewRoute(fieldRep.id);
  
  return {
    routeDay: {
      date: nextAvailableDate,
      fieldRepId: fieldRep.id,
      territory: fieldRep.territory,
      anchorAppointment: {
        prospectId: prospect.id,
        coordinates: { lat: prospect.address.lat, lng: prospect.address.lng }
      },
      appointments: [],
      totalDriveTime: 0,
      totalVisitTime: 0,
      capacity: 4
    },
    suggestedDate: nextAvailableDate,
    isNewRoute: true
  };
}

async function findNextAvailableDateForNewRoute(fieldRepId) {
  const fieldRep = await getFieldRep(fieldRepId);
  let checkDate = new Date();
  checkDate.setDate(checkDate.getDate() + 1);  // Start with tomorrow
  
  for (let i = 0; i < 30; i++) {  // Check next 30 days
    // Skip weekends
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    }
    
    const dateStr = checkDate.toISOString().split('T')[0];
    const availableSlots = await findAvailableTimeSlots(fieldRepId, dateStr);
    
    // Need at least 6 hours available for a route day (3-4 visits)
    const totalAvailableHours = availableSlots.reduce(
      (sum, slot) => sum + (slot.end - slot.start), 
      0
    );
    
    if (totalAvailableHours >= 6) {
      return dateStr;
    }
    
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  throw new Error('No available dates found in next 30 days');
}

async function optimizeRouteSequence(routeDay) {
  // Use Traveling Salesman Problem (TSP) heuristic
  // Start from field rep home, visit all appointments, return home
  
  const fieldRep = await getFieldRep(routeDay.fieldRepId);
  const locations = [
    { type: 'home', coords: fieldRep.homeCoordinates },
    ...routeDay.appointments.map(appt => ({
      type: 'appointment',
      prospectId: appt.prospectId,
      coords: appt.coordinates
    }))
  ];
  
  // Nearest neighbor algorithm for route optimization
  const optimizedRoute = [];
  const unvisited = [...locations.slice(1)];  // Exclude home
  let currentLocation = locations[0];  // Start at home
  
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestTime = Infinity;
    
    for (let i = 0; i < unvisited.length; i++) {
      const driveTime = await calculateDriveTime(
        currentLocation.coords,
        unvisited[i].coords,
        `${routeDay.date}T10:00:00-05:00`
      );
      
      if (driveTime.durationMinutes < shortestTime) {
        shortestTime = driveTime.durationMinutes;
        nearestIndex = i;
      }
    }
    
    const nextLocation = unvisited[nearestIndex];
    optimizedRoute.push({
      ...nextLocation,
      driveTimeFromPrevious: shortestTime
    });
    
    currentLocation = nextLocation;
    unvisited.splice(nearestIndex, 1);
  }
  
  return optimizedRoute;
}
```

---

### Component 6: Cold Start Territory Finder
**Purpose:** Find high-density territories when calendar is empty

```javascript
async function findHighDensityTerritories(fieldRep, maxTerritories = 5) {
  const prospects = await getProspects({ 
    territory: fieldRep.territory,
    appointmentStatus: { isBooked: false }
  });
  
  if (prospects.length === 0) {
    throw new Error('No unbooked prospects in territory');
  }
  
  // Geocode field rep home if not already done
  if (!fieldRep.homeCoordinates) {
    const coords = await geocodeZipCode(fieldRep.homeZipCode);
    fieldRep.homeCoordinates = coords;
    await updateFieldRep(fieldRep);
  }
  
  // Step 1: Calculate drive time from home to each prospect
  const prospectsWithDriveTime = await Promise.all(
    prospects.map(async (prospect) => {
      const driveTime = await calculateDriveTime(
        fieldRep.homeCoordinates,
        { lat: prospect.address.lat, lng: prospect.address.lng },
        'now'
      );
      
      return {
        ...prospect,
        driveTimeFromHome: driveTime.durationMinutes
      };
    })
  );
  
  // Step 2: Filter to reasonable drive time (e.g., within 60 minutes)
  const accessibleProspects = prospectsWithDriveTime.filter(
    p => p.driveTimeFromHome <= 60
  );
  
  // Step 3: Cluster analysis - find density hotspots
  const clusters = dbscanClustering(
    accessibleProspects,
    30,  // maxDistance in minutes drive time
    5    // minPoints for a cluster
  );
  
  // Step 4: Rank clusters by size and specialty mix
  const rankedClusters = clusters.map(cluster => {
    const specialtyDistribution = cluster.reduce((acc, prospect) => {
      acc[prospect.specialty] = (acc[prospect.specialty] || 0) + 1;
      return acc;
    }, {});
    
    const avgDriveTimeFromHome = cluster.reduce(
      (sum, p) => sum + p.driveTimeFromHome, 0
    ) / cluster.length;
    
    return {
      prospects: cluster,
      size: cluster.length,
      specialtyDistribution,
      avgDriveTimeFromHome,
      score: calculateClusterScore(cluster, specialtyDistribution)
    };
  }).sort((a, b) => b.score - a.score);
  
  return rankedClusters.slice(0, maxTerritories);
}

function calculateClusterScore(cluster, specialtyDistribution) {
  const sizeScore = cluster.length * 100;
  
  const specialtyWeights = {
    dermatology: 4,
    plastic_surgery: 3,
    dentistry: 2,
    chiropractic: 1
  };
  
  const specialtyScore = Object.entries(specialtyDistribution).reduce(
    (sum, [specialty, count]) => sum + (specialtyWeights[specialty] * count),
    0
  );
  
  return sizeScore + specialtyScore;
}

function dbscanClustering(prospects, maxDriveTimeMinutes, minPoints) {
  // Simplified DBSCAN for geographic clustering
  const clusters = [];
  const visited = new Set();
  
  for (const prospect of prospects) {
    if (visited.has(prospect.id)) continue;
    
    const neighbors = prospects.filter(p => {
      if (p.id === prospect.id) return false;
      const distance = calculateHaversineDistance(
        prospect.address.lat, prospect.address.lng,
        p.address.lat, p.address.lng
      );
      // Approximate: 1 mile ≈ 2 minutes drive time
      return distance * 2 <= maxDriveTimeMinutes;
    });
    
    if (neighbors.length >= minPoints) {
      const cluster = [prospect, ...neighbors];
      cluster.forEach(p => visited.add(p.id));
      clusters.push(cluster);
    }
  }
  
  return clusters;
}

async function geocodeZipCode(zipCode) {
  const response = await fetch(
    `https://geocode.search.hereapi.com/v1/geocode?q=${zipCode},USA&apiKey=${HERE_API_KEY}`
  );
  
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    return {
      lat: data.items[0].position.lat,
      lng: data.items[0].position.lng
    };
  }
  
  throw new Error(`Unable to geocode ZIP code: ${zipCode}`);
}
```

---

## Main Algorithm Flow

### Scenario A: Cold Start (Empty Calendar)

```javascript
async function coldStartPrioritization(fieldRep) {
  console.log(`Running cold start for ${fieldRep.name} (${fieldRep.territory})`);
  
  // Step 1: Find high-density territories near home
  const densityHotspots = await findHighDensityTerritories(fieldRep, 5);
  
  if (densityHotspots.length === 0) {
    console.log('No density hotspots found');
    // Fallback: prioritize by specialty only
    return await getProspects({
      territory: fieldRep.territory,
      appointmentStatus: { isBooked: false }
    }).sort((a, b) => {
      const specialtyOrder = ['dermatology', 'plastic_surgery', 'dentistry', 'chiropractic'];
      return specialtyOrder.indexOf(a.specialty) - specialtyOrder.indexOf(b.specialty);
    });
  }
  
  // Step 2: Extract all prospects from top clusters
  const prioritizedProspects = [];
  
  for (const cluster of densityHotspots) {
    // Sort within cluster by specialty
    const sortedCluster = cluster.prospects.sort((a, b) => {
      const specialtyOrder = ['dermatology', 'plastic_surgery', 'dentistry', 'chiropractic'];
      return specialtyOrder.indexOf(a.specialty) - specialtyOrder.indexOf(b.specialty);
    });
    
    prioritizedProspects.push(...sortedCluster);
  }
  
  // Step 3: Calculate priority scores for UI display
  const context = {
    allProspects: prioritizedProspects,
    scheduledAppointments: []
  };
  
  for (const prospect of prioritizedProspects) {
    prospect.priorityScore = calculatePriorityScore(prospect, context);
  }
  
  return prioritizedProspects;
}
```

---

### Scenario B: Clustering Mode (Appointments Exist)

```javascript
async function clusteringModePrioritization(fieldRep) {
  console.log(`Running clustering mode for ${fieldRep.name} (${fieldRep.territory})`);
  
  // Step 1: Get all scheduled appointments for this field rep
  const scheduledAppointments = await getScheduledAppointments(fieldRep.id);
  
  // Step 2: Get all unbooked prospects in territory
  const unbookedProspects = await getProspects({
    territory: fieldRep.territory,
    appointmentStatus: { isBooked: false }
  });
  
  // Step 3: Calculate priority scores for all prospects
  const context = {
    allProspects: unbookedProspects,
    scheduledAppointments: scheduledAppointments
  };
  
  for (const prospect of unbookedProspects) {
    prospect.priorityScore = calculatePriorityScore(prospect, context);
  }
  
  // Step 4: Sort by priority score (descending)
  const prioritizedProspects = unbookedProspects.sort(
    (a, b) => b.priorityScore - a.priorityScore
  );
  
  return prioritizedProspects;
}
```

---

### Unified Entry Point

```javascript
async function generateCallingList(fieldRepId, refreshInterval = 3600000) {
  // refreshInterval in milliseconds (default: 1 hour)
  
  const fieldRep = await getFieldRep(fieldRepId);
  
  // Check if field rep has any scheduled appointments
  const scheduledAppointments = await getScheduledAppointments(fieldRepId);
  
  let prioritizedList;
  
  if (scheduledAppointments.length === 0) {
    // Cold start scenario
    prioritizedList = await coldStartPrioritization(fieldRep);
  } else {
    // Clustering mode
    prioritizedList = await clusteringModePrioritization(fieldRep);
  }
  
  // Cache the list and schedule refresh
  await cacheCallingList(fieldRepId, prioritizedList);
  
  // Schedule next refresh
  setTimeout(() => {
    generateCallingList(fieldRepId, refreshInterval);
  }, refreshInterval);
  
  return prioritizedList;
}

// API endpoint for calling team to fetch prioritized list
app.get('/api/calling-list/:territory', async (req, res) => {
  const { territory } = req.params;
  
  // Get field rep for this territory
  const fieldRep = await getFieldRep({ territory });
  
  if (!fieldRep) {
    return res.status(404).json({ error: 'No field rep found for territory' });
  }
  
  // Check cache first
  let callingList = await getCachedCallingList(fieldRep.id);
  
  if (!callingList) {
    // Generate fresh list
    callingList = await generateCallingList(fieldRep.id);
  }
  
  // Return top 50 prospects
  res.json({
    territory,
    fieldRep: {
      name: fieldRep.name,
      id: fieldRep.id
    },
    prospects: callingList.slice(0, 50),
    lastUpdated: new Date().toISOString()
  });
});
```

---

## Appointment Booking Flow

```javascript
async function bookAppointmentWorkflow(prospectId, callerId) {
  // Step 1: Get prospect and field rep details
  const prospect = await getProspect(prospectId);
  const fieldRep = await getFieldRep({ territory: prospect.territory });
  
  // Step 2: Find or create optimal route day
  const routeInfo = await findOrCreateRouteDay(prospect, fieldRep);
  
  // Step 3: Calculate drive time to route cluster
  let driveTimeToCluster = 0;
  
  if (!routeInfo.isNewRoute) {
    const anchorCoords = routeInfo.routeDay.anchorAppointment.coordinates;
    const driveTime = await calculateDriveTime(
      anchorCoords,
      { lat: prospect.address.lat, lng: prospect.address.lng },
      `${routeInfo.suggestedDate}T10:00:00-05:00`
    );
    driveTimeToCluster = driveTime.durationMinutes;
  } else {
    // New route - calculate drive time from home
    const driveTime = await calculateDriveTime(
      fieldRep.homeCoordinates,
      { lat: prospect.address.lat, lng: prospect.address.lng },
      `${routeInfo.suggestedDate}T09:00:00-05:00`
    );
    driveTimeToCluster = driveTime.durationMinutes;
  }
  
  // Step 4: Check calendar availability
  const availableSlots = await findAvailableTimeSlots(
    fieldRep.id,
    routeInfo.suggestedDate
  );
  
  const fitCheck = canFitAppointment(availableSlots, 45, driveTimeToCluster);
  
  if (!fitCheck.canFit) {
    // Try next available date
    const nextDate = await findNextAvailableDateForNewRoute(fieldRep.id);
    return await bookAppointmentWorkflow(prospectId, callerId);
  }
  
  // Step 5: Generate time suggestions for caller
  const suggestedTimes = generateTimeSuggestions(
    availableSlots,
    fitCheck.suggestedStartTime
  );
  
  // Step 6: Return booking options to caller interface
  return {
    prospectId,
    fieldRep: {
      name: fieldRep.name,
      territory: fieldRep.territory
    },
    suggestedDate: routeInfo.suggestedDate,
    suggestedTimes: suggestedTimes,
    routeContext: {
      isNewRoute: routeInfo.isNewRoute,
      currentAppointments: routeInfo.routeDay.appointments.length,
      maxCapacity: routeInfo.routeDay.capacity,
      driveTimeMinutes: driveTimeToCluster
    },
    bookingUrl: `/api/appointments/confirm`,
    expiresIn: 300  // 5 minutes to confirm
  };
}

function generateTimeSuggestions(availableSlots, preferredStartTime) {
  const suggestions = [];
  
  // Round to nearest 30-minute increment
  const roundedStart = Math.ceil(preferredStartTime * 2) / 2;
  
  // Generate 3 time options
  for (let i = 0; i < 3; i++) {
    const suggestedTime = roundedStart + (i * 0.5);  // 30-minute increments
    
    // Check if time fits in available slots
    const fitsInSlot = availableSlots.some(
      slot => suggestedTime >= slot.start && (suggestedTime + 0.75) <= slot.end
    );
    
    if (fitsInSlot) {
      const hours = Math.floor(suggestedTime);
      const minutes = (suggestedTime % 1) * 60;
      
      suggestions.push({
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        available: true
      });
    }
  }
  
  return suggestions;
}

// Confirm appointment booking
app.post('/api/appointments/confirm', async (req, res) => {
  const { prospectId, selectedDate, selectedTime, callerId } = req.body;
  
  const prospect = await getProspect(prospectId);
  const fieldRep = await getFieldRep({ territory: prospect.territory });
  
  // Create Google Calendar event
  const event = {
    summary: `Visit: ${prospect.businessName}`,
    description: `
      Specialty: ${prospect.specialty}
      Phone: ${prospect.phoneNumber}
      Address: ${prospect.address.street}, ${prospect.address.city}, ${prospect.address.state} ${prospect.address.zipCode}
      Booked by: ${callerId}
    `,
    location: `${prospect.address.street}, ${prospect.address.city}, ${prospect.address.state} ${prospect.address.zipCode}`,
    start: {
      dateTime: `${selectedDate}T${selectedTime}:00-05:00`,
      timeZone: 'America/New_York'
    },
    end: {
      dateTime: calculateEndTime(selectedDate, selectedTime, 45),
      timeZone: 'America/New_York'
    }
  };
  
  const calendarEvent = await googleCalendar.events.insert({
    calendarId: fieldRep.googleCalendarId,
    resource: event
  });
  
  // Update prospect record
  await updateProspect(prospectId, {
    appointmentStatus: {
      isBooked: true,
      scheduledDate: `${selectedDate}T${selectedTime}:00-05:00`,
      fieldRepId: fieldRep.id,
      googleCalendarEventId: calendarEvent.id
    },
    callHistory: [
      ...prospect.callHistory,
      {
        attemptDate: new Date().toISOString(),
        outcome: 'booked',
        notes: `Appointment scheduled for ${selectedDate} at ${selectedTime}`,
        callerId: callerId
      }
    ]
  });
  
  // Trigger list refresh for all callers in this territory
  await generateCallingList(fieldRep.id);
  
  res.json({
    success: true,
    appointment: {
      prospectId,
      date: selectedDate,
      time: selectedTime,
      fieldRep: fieldRep.name,
      googleCalendarEventId: calendarEvent.id
    }
  });
});

function calculateEndTime(date, startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date(`${date}T${startTime}:00-05:00`);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return endDate.toISOString();
}
```

---

## API Integration Requirements

### 1. HERE API Setup

**Required Services:**
- Geocoding API v1
- Routing API v8
- (Future: Isoline Routing API for territory visualization)

**API Key Management:**
```javascript
// Environment variables
HERE_API_KEY=your_here_api_key

// Rate limits (as of Nov 2025):
// - Geocoding: 250,000 requests/month (free tier)
// - Routing: 250,000 routes/month (free tier)

// Recommended: Implement request caching
const cache = new Map();

async function cachedGeocode(address) {
  const cacheKey = `geocode:${address}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const result = await geocodeProspect({ address });
  cache.set(cacheKey, result);
  
  return result;
}
```

**Documentation:**
- Geocoding: https://developer.here.com/documentation/geocoding-search-api/dev_guide/index.html
- Routing: https://developer.here.com/documentation/routing-api/dev_guide/index.html

---

### 2. Google Calendar API Setup

**Required Scopes:**
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

**OAuth Setup:**
```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Per-user authentication
oauth2Client.setCredentials({
  refresh_token: fieldRep.googleRefreshToken
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
```

**Documentation:**
- Google Calendar API: https://developers.google.com/calendar/api/guides/overview

---

## Performance Optimization

### 1. Caching Strategy

```javascript
const cacheConfig = {
  callingLists: {
    ttl: 3600,  // 1 hour
    key: (fieldRepId) => `calling-list:${fieldRepId}`
  },
  geocoding: {
    ttl: 2592000,  // 30 days (addresses rarely change)
    key: (address) => `geocode:${address}`
  },
  driveTime: {
    ttl: 3600,  // 1 hour (traffic patterns change)
    key: (origin, dest, time) => `drivetime:${origin}:${dest}:${time}`
  },
  availability: {
    ttl: 300,  // 5 minutes (calendar changes frequently)
    key: (fieldRepId, date) => `availability:${fieldRepId}:${date}`
  }
};

// Use Redis for production caching
const redis = require('redis');
const client = redis.createClient();

async function getCached(key, fetchFn, ttl) {
  const cached = await client.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const result = await fetchFn();
  await client.setex(key, ttl, JSON.stringify(result));
  
  return result;
}
```

---

### 2. Batch Processing

```javascript
// Process geocoding in batches to respect rate limits
async function batchGeocodeProspects(prospects, batchSize = 50) {
  const results = [];
  
  for (let i = 0; i < prospects.length; i += batchSize) {
    const batch = prospects.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(p => geocodeProspect(p))
    );
    
    results.push(...batchResults);
    
    // Rate limiting pause (250k/month ≈ 346/hour ≈ 6/min)
    await sleep(10000);  // 10 seconds between batches
  }
  
  return results;
}
```

---

### 3. Database Indexing

```sql
-- Recommended indexes for performance

-- Prospects table
CREATE INDEX idx_prospects_territory ON prospects(territory);
CREATE INDEX idx_prospects_specialty ON prospects(specialty);
CREATE INDEX idx_prospects_coordinates ON prospects(address_lat, address_lng);
CREATE INDEX idx_prospects_appointment_status ON prospects(appointment_status);
CREATE INDEX idx_prospects_last_contact ON prospects(last_contact_date);

-- Appointments table
CREATE INDEX idx_appointments_field_rep ON appointments(field_rep_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_territory ON appointments(territory);

-- Call history table
CREATE INDEX idx_call_history_prospect ON call_history(prospect_id);
CREATE INDEX idx_call_history_caller ON call_history(caller_id);
CREATE INDEX idx_call_history_date ON call_history(attempt_date);
```

---

## User Interface Integration

### Calling Team Dashboard

**Key Features:**
1. **Prioritized Prospect List** (auto-refreshing every hour)
2. **Quick Booking Interface** (date/time suggestions)
3. **Route Day Visualizations** (show how appointments cluster)
4. **Real-time Calendar Availability**

**Example UI Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  CALLING DASHBOARD - Miami Territory                        │
├─────────────────────────────────────────────────────────────┤
│  Priority Prospects (Last updated: 2:30 PM)          [🔄]   │
│                                                              │
│  1. [CALL] South Beach Dermatology                          │
│     📞 305-555-0123  |  Priority: 875  |  Specialty: Derm   │
│     📍 1234 Ocean Dr, Miami Beach - 12 min from anchor      │
│     💡 Cluster: Nov 25 Route (2/4 visits booked)            │
│     ⏰ Last contact: Never                                   │
│                                                              │
│  2. [CALL] Miami Plastic Surgery Center                     │
│     📞 305-555-0456  |  Priority: 820  |  Specialty: PS     │
│     📍 5678 Collins Ave, Miami Beach - 8 min from anchor    │
│     💡 Cluster: Nov 25 Route (2/4 visits booked)            │
│     ⏰ Last contact: 14 days ago                             │
│                                                              │
│  3. [CALL] Brickell Dental Group                            │
│     📞 305-555-0789  |  Priority: 645  |  Specialty: Dent   │
│     📍 999 Brickell Ave, Miami - 35 min from anchor         │
│     💡 New cluster recommended for Nov 27                   │
│     ⏰ Last contact: Never                                   │
└─────────────────────────────────────────────────────────────┘

[When "CALL" clicked → Opens booking modal]

┌─────────────────────────────────────────────────────────────┐
│  BOOK APPOINTMENT: South Beach Dermatology                  │
├─────────────────────────────────────────────────────────────┤
│  Field Rep: Sarah Johnson (Miami)                           │
│  Suggested Date: Monday, November 25, 2025                  │
│                                                              │
│  Available Times:                                           │
│  ⚪ 10:30 AM - 11:15 AM  [SELECT]                           │
│  ⚪ 1:00 PM - 1:45 PM    [SELECT]                           │
│  ⚪ 3:30 PM - 4:15 PM    [SELECT]                           │
│                                                              │
│  Route Context:                                             │
│  • This would be visit 3/4 for Nov 25                       │
│  • 12 minutes from previous appointment                     │
│  • High-density area (8 prospects nearby)                   │
│                                                              │
│  [CONFIRM BOOKING]  [TRY DIFFERENT DATE]  [CANCEL]          │
└─────────────────────────────────────────────────────────────┘
```

---

### Field Rep Mobile App

**Key Features:**
1. **Daily Route View** (optimized sequence with drive times)
2. **Navigation Integration** (one-tap directions)
3. **Visit Notes & Outcomes**
4. **Real-time Schedule Updates**

---

## Error Handling & Edge Cases

### 1. Geocoding Failures

```javascript
async function handleGeocodingFailure(prospect) {
  console.error(`Failed to geocode: ${prospect.businessName}`);
  
  // Mark prospect for manual review
  await updateProspect(prospect.id, {
    geocodeStatus: 'failed',
    requiresManualReview: true,
    notes: `Unable to geocode address: ${JSON.stringify(prospect.address)}`
  });
  
  // Notify admin
  await notifyAdmin({
    type: 'geocoding_failure',
    prospectId: prospect.id,
    address: prospect.address
  });
}
```

---

### 2. Calendar Sync Issues

```javascript
async function handleCalendarSyncError(fieldRepId, error) {
  console.error(`Calendar sync failed for ${fieldRepId}:`, error);
  
  // Fallback: Use cached calendar data
  const cachedCalendar = await getCachedCalendar(fieldRepId);
  
  if (cachedCalendar) {
    console.log('Using cached calendar data');
    return cachedCalendar;
  }
  
  // No cache available - notify user
  throw new Error('Unable to sync calendar. Please try again or contact support.');
}
```

---

### 3. No Available Route Days

```javascript
async function handleNoAvailableRouteDays(fieldRepId) {
  // Field rep calendar is fully booked
  
  // Option 1: Suggest overflow to another rep in same territory
  const alternateReps = await getFieldReps({ 
    territory: fieldRep.territory,
    id: { $ne: fieldRepId }
  });
  
  if (alternateReps.length > 0) {
    return {
      error: 'primary_rep_full',
      suggestion: 'overflow_to_alternate',
      alternateReps: alternateReps.map(r => ({
        id: r.id,
        name: r.name
      }))
    };
  }
  
  // Option 2: Suggest scheduling further out (30+ days)
  return {
    error: 'territory_fully_booked',
    suggestion: 'schedule_extended_timeframe',
    nextAvailableDate: null
  };
}
```

---

### 4. Route Capacity Limits

```javascript
function checkRouteCapacity(routeDay) {
  const maxVisitsPerDay = 4;
  const maxDriveTimePerDay = 180;  // 3 hours
  const maxTotalTimePerDay = 480;  // 8 hours
  
  if (routeDay.appointments.length >= maxVisitsPerDay) {
    return {
      canAddMore: false,
      reason: 'max_visits_reached'
    };
  }
  
  if (routeDay.totalDriveTime >= maxDriveTimePerDay) {
    return {
      canAddMore: false,
      reason: 'max_drive_time_exceeded'
    };
  }
  
  const totalTime = routeDay.totalDriveTime + (routeDay.appointments.length * 45);
  
  if (totalTime >= maxTotalTimePerDay) {
    return {
      canAddMore: false,
      reason: 'max_day_duration_exceeded'
    };
  }
  
  return { canAddMore: true };
}
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Priority Scoring Engine', () => {
  it('should prioritize high-density areas', async () => {
    const prospect = mockProspect({ 
      lat: 25.7617, 
      lng: -80.1918  // Miami
    });
    
    const context = {
      allProspects: createDenseCluster(25.7617, -80.1918, 10),
      scheduledAppointments: []
    };
    
    const score = calculatePriorityScore(prospect, context);
    
    expect(score).toBeGreaterThan(500);
  });
  
  it('should prioritize prospects near scheduled appointments', async () => {
    // Test implementation
  });
});

describe('Route Clustering', () => {
  it('should create new route when no nearby appointments exist', async () => {
    // Test implementation
  });
  
  it('should add to existing route when within 30-minute drive', async () => {
    // Test implementation
  });
});
```

---

### Integration Tests

```javascript
describe('Full Booking Workflow', () => {
  it('should successfully book appointment and update calendar', async () => {
    const prospect = await createTestProspect();
    const fieldRep = await createTestFieldRep();
    
    const booking = await bookAppointmentWorkflow(prospect.id, 'test_caller');
    
    expect(booking.suggestedDate).toBeDefined();
    expect(booking.suggestedTimes.length).toBeGreaterThan(0);
    
    // Confirm booking
    const confirmation = await confirmAppointment({
      prospectId: prospect.id,
      selectedDate: booking.suggestedDate,
      selectedTime: booking.suggestedTimes[0].time
    });
    
    expect(confirmation.success).toBe(true);
    
    // Verify calendar event created
    const calendarEvents = await getCalendarEvents(fieldRep.googleCalendarId);
    expect(calendarEvents).toContainEvent(confirmation.googleCalendarEventId);
  });
});
```

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Algorithm Performance:**
   - Average priority score distribution
   - Clustering efficiency (% of appointments in clusters vs. standalone)
   - Route optimization quality (actual vs. predicted drive times)

2. **Operational Metrics:**
   - Appointments booked per day/week
   - Average time from call to booked appointment
   - Field rep utilization (visits per day, % of calendar filled)
   - Territory coverage (% of prospects contacted)

3. **System Health:**
   - API response times (HERE, Google Calendar)
   - Cache hit rates
   - Failed geocoding attempts
   - Calendar sync errors

---

## Logging

```javascript
// Structured logging for algorithm decisions

logger.info('calling_list_generated', {
  fieldRepId: fieldRep.id,
  territory: fieldRep.territory,
  mode: scheduledAppointments.length === 0 ? 'cold_start' : 'clustering',
  prospectCount: prioritizedList.length,
  avgPriorityScore: calculateAverage(prioritizedList.map(p => p.priorityScore)),
  timestamp: new Date().toISOString()
});

logger.info('appointment_booked', {
  prospectId: prospect.id,
  fieldRepId: fieldRep.id,
  territory: prospect.territory,
  routeDate: selectedDate,
  clusterSize: routeDay.appointments.length,
  driveTimeToCluster: driveTimeMinutes,
  callerId: callerId,
  timestamp: new Date().toISOString()
});
```

---

## Future Enhancements

### Phase 2 Improvements

1. **Machine Learning Optimization:**
   - Predict appointment booking probability
   - Learn optimal calling times
   - Dynamic priority weight adjustment

2. **Advanced Routing:**
   - Multi-day route planning
   - Traffic-aware scheduling (avoid rush hours)
   - Weather-based adjustments

3. **Expanded Territory Features:**
   - Automatic territory boundary detection
   - Overlap zone management (border areas between territories)
   - Dynamic territory rebalancing

4. **Integration Enhancements:**
   - Waze/Google Maps direct integration
   - CRM activity tracking
   - Automated follow-up scheduling

---

## Implementation Checklist

- [ ] Set up HERE API account and obtain API key
- [ ] Configure Google Calendar OAuth for field reps
- [ ] Geocode all existing prospects in database
- [ ] Implement priority scoring engine
- [ ] Build route clustering logic
- [ ] Create calling team API endpoints
- [ ] Develop booking workflow with calendar integration
- [ ] Set up caching layer (Redis)
- [ ] Build calling team UI dashboard
- [ ] Create field rep mobile app views
- [ ] Write unit and integration tests
- [ ] Set up monitoring and logging
- [ ] Conduct beta testing with small prospect set
- [ ] Train calling team on new interface
- [ ] Deploy to production
- [ ] Monitor and iterate based on usage data

---

## Appendix: API Endpoint Reference

### GET `/api/calling-list/:territory`
Returns prioritized prospect list for a territory.

**Response:**
```json
{
  "territory": "miami",
  "fieldRep": {
    "name": "Sarah Johnson",
    "id": "uuid"
  },
  "prospects": [
    {
      "id": "uuid",
      "businessName": "South Beach Dermatology",
      "phoneNumber": "305-555-0123",
      "address": { ... },
      "specialty": "dermatology",
      "priorityScore": 875,
      "lastContactDate": null,
      "clusterInfo": {
        "routeDate": "2025-11-25",
        "driveTimeMinutes": 12,
        "clusterSize": 2
      }
    }
  ],
  "lastUpdated": "2025-11-22T14:30:00Z"
}
```

---

### POST `/api/appointments/booking-options`
Get booking options for a specific prospect.

**Request:**
```json
{
  "prospectId": "uuid",
  "callerId": "uuid"
}
```

**Response:**
```json
{
  "prospectId": "uuid",
  "fieldRep": {
    "name": "Sarah Johnson",
    "territory": "miami"
  },
  "suggestedDate": "2025-11-25",
  "suggestedTimes": [
    { "time": "10:30", "available": true },
    { "time": "13:00", "available": true },
    { "time": "15:30", "available": true }
  ],
  "routeContext": {
    "isNewRoute": false,
    "currentAppointments": 2,
    "maxCapacity": 4,
    "driveTimeMinutes": 12
  },
  "expiresIn": 300
}
```

---

### POST `/api/appointments/confirm`
Confirm and book an appointment.

**Request:**
```json
{
  "prospectId": "uuid",
  "selectedDate": "2025-11-25",
  "selectedTime": "10:30",
  "callerId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "prospectId": "uuid",
    "date": "2025-11-25",
    "time": "10:30",
    "fieldRep": "Sarah Johnson",
    "googleCalendarEventId": "abc123"
  }
}
```

---

## Support & Maintenance

**Algorithm Owner:** Development Team  
**Documentation Version:** 1.0  
**Last Updated:** November 22, 2025

For questions or issues, contact: dev-team@quantumpunch.com
