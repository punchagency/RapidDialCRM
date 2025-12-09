# REPLIT AGENT INSTRUCTIONS: Smart Calling & Route Optimization Algorithm

## CONTEXT
You are building a system that coordinates distributed calling teams with field sales reps to optimize appointment booking and route planning. This is for the QuantumPunch Power Dialer platform.

**Read this FIRST**: `/home/claude/smart-calling-algorithm-design.md` - Contains complete technical specifications.

---

## CRITICAL SETUP INFORMATION

### Field Rep Configuration
- **DC Territory**: Home ZIP code is `22101`
- **Miami Territory**: Home ZIP code TBD (leave configurable)
- **Work Hours**: 9am-5pm EST, Monday-Friday
- **Visit Duration**: 45 minutes per appointment
- **Capacity**: 3-4 visits per 8-hour shift
- **Clustering Radius**: 30 minutes drive time

### Priority Hierarchy
1. Geographic density (40% weight)
2. Proximity to already-scheduled appointments (30%)
3. Time since last contact - longest first (20%)
4. Specialty: Dermatology > Plastic Surgery > Dentistry > Chiropractic (10%)

---

## PHASE 1: PROJECT INITIALIZATION

### Step 1.1: Create Project Structure
```bash
# Create directory structure
mkdir -p src/{services,routes,models,utils,jobs}
mkdir -p tests/{unit,integration}
mkdir -p scripts
mkdir -p config
```

### Step 1.2: Initialize Package.json
```bash
npm init -y
```

### Step 1.3: Install Dependencies
```bash
npm install --save \
  express \
  dotenv \
  pg \
  redis \
  googleapis \
  node-fetch \
  node-cron \
  cors \
  helmet

npm install --save-dev \
  jest \
  supertest \
  nodemon
```

### Step 1.4: Create Environment Variables File
Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/quantumpunch

# HERE API
HERE_API_KEY=your_here_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development

# Field Rep Configuration
DC_REP_HOME_ZIP=22101
MIAMI_REP_HOME_ZIP=TBD
```

### Step 1.5: Register for HERE API
**MANUAL STEP - Provide these instructions to user:**
1. Go to https://developer.here.com/
2. Create account (free tier gives 250k requests/month)
3. Create new project
4. Enable: Geocoding API v1 + Routing API v8
5. Copy API key and add to `.env` as `HERE_API_KEY`

---

## PHASE 2: DATABASE SETUP

### Step 2.1: Create Database Connection
File: `src/config/database.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

### Step 2.2: Create Database Schema
File: `scripts/setup-database.sql`

```sql
-- Prospects Table
CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  address_lat DECIMAL(10, 8),
  address_lng DECIMAL(11, 8),
  specialty VARCHAR(50) CHECK (specialty IN ('dermatology', 'plastic_surgery', 'dentistry', 'chiropractic')),
  territory VARCHAR(20) CHECK (territory IN ('miami', 'dc')),
  last_contact_date TIMESTAMP,
  appointment_status JSONB DEFAULT '{"isBooked": false, "scheduledDate": null, "fieldRepId": null}'::jsonb,
  priority_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for prospects
CREATE INDEX IF NOT EXISTS idx_prospects_territory ON prospects(territory);
CREATE INDEX IF NOT EXISTS idx_prospects_coordinates ON prospects(address_lat, address_lng);
CREATE INDEX IF NOT EXISTS idx_prospects_specialty ON prospects(specialty);
CREATE INDEX IF NOT EXISTS idx_prospects_appointment_status ON prospects((appointment_status->>'isBooked'));
CREATE INDEX IF NOT EXISTS idx_prospects_last_contact ON prospects(last_contact_date);

-- Field Reps Table
CREATE TABLE IF NOT EXISTS field_reps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  territory VARCHAR(20) NOT NULL CHECK (territory IN ('miami', 'dc')),
  home_zip_code VARCHAR(10),
  home_lat DECIMAL(10, 8),
  home_lng DECIMAL(11, 8),
  google_calendar_id VARCHAR(255),
  google_refresh_token TEXT,
  work_schedule JSONB DEFAULT '{"daysOfWeek": ["monday","tuesday","wednesday","thursday","friday"], "startTime": "09:00", "endTime": "17:00"}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Call History Table
CREATE TABLE IF NOT EXISTS call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  caller_id VARCHAR(100),
  attempt_date TIMESTAMP NOT NULL DEFAULT NOW(),
  outcome VARCHAR(50) CHECK (outcome IN ('no_answer', 'voicemail', 'declined', 'callback', 'booked', 'not_interested')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_history_prospect ON call_history(prospect_id);
CREATE INDEX IF NOT EXISTS idx_call_history_date ON call_history(attempt_date);
CREATE INDEX IF NOT EXISTS idx_call_history_caller ON call_history(caller_id);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
  field_rep_id UUID REFERENCES field_reps(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  google_calendar_event_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_field_rep ON appointments(field_rep_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_territory_date ON appointments(field_rep_id, scheduled_date);

-- Route Days Cache Table (for optimization)
CREATE TABLE IF NOT EXISTS route_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_rep_id UUID REFERENCES field_reps(id) ON DELETE CASCADE,
  route_date DATE NOT NULL,
  anchor_prospect_id UUID REFERENCES prospects(id),
  total_appointments INTEGER DEFAULT 0,
  total_drive_time_minutes INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(field_rep_id, route_date)
);

-- Calling List Cache Table
CREATE TABLE IF NOT EXISTS calling_list_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_rep_id UUID REFERENCES field_reps(id) ON DELETE CASCADE,
  territory VARCHAR(20),
  cached_list JSONB,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(field_rep_id)
);

CREATE INDEX IF NOT EXISTS idx_calling_list_cache_expires ON calling_list_cache(expires_at);
```

### Step 2.3: Run Database Setup
File: `scripts/run-db-setup.js`

```javascript
const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'setup-database.sql'),
      'utf8'
    );
    
    await db.query(sql);
    
    console.log('✓ Database schema created successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
```

**RUN THIS:**
```bash
node scripts/run-db-setup.js
```

---

## PHASE 3: CORE SERVICES

### Step 3.1: Geocoding Service
File: `src/services/geocoding.service.js`

```javascript
const fetch = require('node-fetch');

class GeocodingService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.HERE_API_KEY;
    this.baseUrl = 'https://geocode.search.hereapi.com/v1';
    
    if (!this.apiKey) {
      throw new Error('HERE_API_KEY is required');
    }
  }

  async geocodeAddress(address) {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    
    const url = `${this.baseUrl}/geocode?q=${encodeURIComponent(fullAddress)}&apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return {
          lat: data.items[0].position.lat,
          lng: data.items[0].position.lng,
          quality: data.items[0].scoring?.queryScore || 0
        };
      }
      
      throw new Error(`No results found for: ${fullAddress}`);
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Unable to geocode: ${fullAddress}`);
    }
  }

  async geocodeZipCode(zipCode) {
    const url = `${this.baseUrl}/geocode?q=${zipCode},USA&apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        return {
          lat: data.items[0].position.lat,
          lng: data.items[0].position.lng
        };
      }
      
      throw new Error(`Unable to geocode ZIP: ${zipCode}`);
    } catch (error) {
      console.error('ZIP geocoding error:', error);
      throw error;
    }
  }

  async batchGeocodeProspects(prospects, batchSize = 50) {
    const results = [];
    
    for (let i = 0; i < prospects.length; i += batchSize) {
      const batch = prospects.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prospects.length / batchSize)}`);
      
      const batchResults = await Promise.allSettled(
        batch.map(p => this.geocodeAddress(p.address))
      );
      
      results.push(...batchResults);
      
      // Rate limiting: 250k/month = ~346/hour = ~6/minute
      // Wait 10 seconds between batches to be safe
      if (i + batchSize < prospects.length) {
        console.log('Waiting 10 seconds for rate limit...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
    
    return results;
  }
}

module.exports = GeocodingService;
```

### Step 3.2: Routing Service
File: `src/services/routing.service.js`

```javascript
const fetch = require('node-fetch');

class RoutingService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.HERE_API_KEY;
    this.baseUrl = 'https://router.hereapi.com/v8/routes';
    
    if (!this.apiKey) {
      throw new Error('HERE_API_KEY is required');
    }
  }

  async calculateDriveTime(originCoords, destCoords, departureTime = 'now') {
    const url = `${this.baseUrl}?` +
      `transportMode=car&` +
      `origin=${originCoords.lat},${originCoords.lng}&` +
      `destination=${destCoords.lat},${destCoords.lng}&` +
      `departureTime=${departureTime}&` +
      `return=summary&` +
      `apiKey=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].sections[0];
        return {
          durationMinutes: Math.ceil(route.summary.duration / 60),
          distanceKm: route.summary.length / 1000,
          distanceMiles: (route.summary.length / 1000) * 0.621371
        };
      }
      
      throw new Error('No route found');
    } catch (error) {
      console.error('Routing error:', error);
      throw new Error('Unable to calculate route');
    }
  }

  async calculateDriveTimeMatrix(originCoords, destCoordsList, departureTime = 'now') {
    const results = [];
    
    for (let i = 0; i < destCoordsList.length; i++) {
      try {
        const driveTime = await this.calculateDriveTime(
          originCoords, 
          destCoordsList[i], 
          departureTime
        );
        
        results.push({
          destination: destCoordsList[i],
          driveTimeMinutes: driveTime.durationMinutes,
          distanceKm: driveTime.distanceKm,
          error: null
        });
      } catch (error) {
        results.push({
          destination: destCoordsList[i],
          driveTimeMinutes: null,
          distanceKm: null,
          error: error.message
        });
      }
      
      // Rate limiting: small pause between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  }

  // Haversine distance calculation (backup when API unavailable)
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = RoutingService;
```

### Step 3.3: Priority Scoring Service
File: `src/services/priority.service.js`

```javascript
const RoutingService = require('./routing.service');

class PriorityService {
  constructor(routingService) {
    this.routing = routingService || new RoutingService();
  }

  async calculatePriorityScore(prospect, context) {
    let score = 0;
    
    // Factor 1: Geographic Density (40% weight - max 400 points)
    const nearbyProspects = this.findProspectsWithinRadius(
      prospect.address_lat,
      prospect.address_lng,
      5, // 5-mile radius
      context.allProspects
    );
    
    const densityScore = Math.min(nearbyProspects.length * 10, 400);
    score += densityScore;
    
    // Factor 2: Proximity to Scheduled Appointments (30% weight - max 300 points)
    if (context.scheduledAppointments && context.scheduledAppointments.length > 0) {
      const territoryAppointments = context.scheduledAppointments.filter(
        appt => appt.territory === prospect.territory
      );
      
      if (territoryAppointments.length > 0) {
        const closestAppointment = this.findClosestAppointment(prospect, territoryAppointments);
        
        if (closestAppointment && closestAppointment.driveTimeMinutes <= 30) {
          // Exponential decay: closer = higher score
          const proximityScore = 300 * Math.exp(-closestAppointment.driveTimeMinutes / 20);
          score += proximityScore;
        }
      }
    }
    
    // Factor 3: Time Since Last Contact (20% weight - max 200 points)
    const daysSinceLastContact = prospect.last_contact_date 
      ? Math.floor((Date.now() - new Date(prospect.last_contact_date)) / (1000 * 60 * 60 * 24))
      : 365; // Assume 1 year if never contacted
    
    const recencyScore = Math.min(daysSinceLastContact * 2, 200);
    score += recencyScore;
    
    // Factor 4: Specialty Priority (10% weight - max 100 points)
    const specialtyScores = {
      'dermatology': 100,
      'plastic_surgery': 75,
      'dentistry': 50,
      'chiropractic': 25
    };
    
    score += specialtyScores[prospect.specialty] || 0;
    
    // Bonus: Never contacted before (add 50 points)
    if (!prospect.last_contact_date) {
      score += 50;
    }
    
    return Math.round(score);
  }

  findProspectsWithinRadius(lat, lng, radiusMiles, allProspects) {
    if (!lat || !lng) return [];
    
    return allProspects.filter(p => {
      if (!p.address_lat || !p.address_lng) return false;
      
      const distance = this.routing.calculateHaversineDistance(
        lat, lng,
        p.address_lat, p.address_lng
      );
      
      return distance <= radiusMiles;
    });
  }

  findClosestAppointment(prospect, appointments) {
    if (!prospect.address_lat || !prospect.address_lng) return null;
    
    let closestAppointment = null;
    let minDistance = Infinity;
    
    for (const appt of appointments) {
      if (!appt.lat || !appt.lng) continue;
      
      const distance = this.routing.calculateHaversineDistance(
        prospect.address_lat, prospect.address_lng,
        appt.lat, appt.lng
      );
      
      // Approximate: 1 mile ≈ 2 minutes drive time
      const estimatedDriveTime = distance * 2;
      
      if (estimatedDriveTime < minDistance) {
        minDistance = estimatedDriveTime;
        closestAppointment = {
          ...appt,
          driveTimeMinutes: estimatedDriveTime
        };
      }
    }
    
    return closestAppointment;
  }
}

module.exports = PriorityService;
```

### Step 3.4: Calendar Service
File: `src/services/calendar.service.js`

```javascript
const { google } = require('googleapis');

class CalendarService {
  constructor(credentials) {
    this.oauth2Client = new google.auth.OAuth2(
      credentials?.clientId || process.env.GOOGLE_CLIENT_ID,
      credentials?.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
      credentials?.redirectUri || process.env.GOOGLE_REDIRECT_URI
    );
  }

  setUserCredentials(refreshToken) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async getAvailability(calendarId, startDate, endDate) {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('Calendar availability error:', error);
      throw new Error('Unable to fetch calendar availability');
    }
  }

  async findAvailableTimeSlots(calendarId, targetDate) {
    const startOfDay = new Date(targetDate + 'T00:00:00');
    const endOfDay = new Date(targetDate + 'T23:59:59');
    
    const events = await this.getAvailability(calendarId, startOfDay, endOfDay);
    
    const workStart = 9;  // 9:00 AM
    const workEnd = 17;   // 5:00 PM
    
    const bookedSlots = events.map(event => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      
      return {
        start: start.getHours() + start.getMinutes() / 60,
        end: end.getHours() + end.getMinutes() / 60
      };
    });
    
    const availableSlots = [];
    let currentTime = workStart;
    
    bookedSlots.sort((a, b) => a.start - b.start);
    
    for (const slot of bookedSlots) {
      if (currentTime < slot.start) {
        availableSlots.push({
          start: currentTime,
          end: slot.start,
          durationHours: slot.start - currentTime
        });
      }
      currentTime = Math.max(currentTime, slot.end);
    }
    
    if (currentTime < workEnd) {
      availableSlots.push({
        start: currentTime,
        end: workEnd,
        durationHours: workEnd - currentTime
      });
    }
    
    return availableSlots;
  }

  canFitAppointment(availableSlots, visitDurationMinutes, driveTimeMinutes) {
    const totalTimeNeeded = (visitDurationMinutes + driveTimeMinutes) / 60; // Convert to hours
    
    for (const slot of availableSlots) {
      if (slot.durationHours >= totalTimeNeeded) {
        return {
          canFit: true,
          suggestedStartTime: slot.start,
          suggestedEndTime: slot.start + totalTimeNeeded,
          slotIndex: availableSlots.indexOf(slot)
        };
      }
    }
    
    return { canFit: false };
  }

  async createEvent(calendarId, eventDetails) {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        resource: eventDetails
      });
      
      return response.data;
    } catch (error) {
      console.error('Calendar event creation error:', error);
      throw new Error('Unable to create calendar event');
    }
  }

  formatTimeSlots(availableSlots, preferredStartTime) {
    const suggestions = [];
    
    // Round to nearest 30-minute increment
    const roundedStart = Math.ceil(preferredStartTime * 2) / 2;
    
    // Generate 3 time options
    for (let i = 0; i < 3; i++) {
      const suggestedTime = roundedStart + (i * 0.5); // 30-minute increments
      
      // Check if time fits in available slots
      const fitsInSlot = availableSlots.some(
        slot => suggestedTime >= slot.start && (suggestedTime + 0.75) <= slot.end
      );
      
      if (fitsInSlot) {
        const hours = Math.floor(suggestedTime);
        const minutes = (suggestedTime % 1) * 60;
        
        suggestions.push({
          time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
          timeDecimal: suggestedTime,
          available: true
        });
      }
    }
    
    return suggestions;
  }
}

module.exports = CalendarService;
```

### Step 3.5: Cache Service
File: `src/services/cache.service.js`

```javascript
const redis = require('redis');

class CacheService {
  constructor(redisUrl) {
    this.redisUrl = redisUrl || process.env.REDIS_URL;
    this.client = null;
  }

  async connect() {
    if (this.client) return;
    
    try {
      this.client = redis.createClient({ url: this.redisUrl });
      this.client.on('error', (err) => console.error('Redis error:', err));
      await this.client.connect();
      console.log('✓ Redis connected');
    } catch (error) {
      console.error('Redis connection failed:', error);
      // Fallback to in-memory cache
      this.client = new InMemoryCache();
    }
  }

  async get(key) {
    await this.connect();
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.connect();
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async del(key) {
    await this.connect();
    await this.client.del(key);
  }

  async getCached(key, fetchFn, ttl = 3600) {
    const cached = await this.get(key);
    
    if (cached) {
      console.log(`Cache HIT: ${key}`);
      return cached;
    }
    
    console.log(`Cache MISS: ${key}`);
    const result = await fetchFn();
    await this.set(key, result, ttl);
    
    return result;
  }
}

// Fallback in-memory cache if Redis unavailable
class InMemoryCache {
  constructor() {
    this.cache = new Map();
  }

  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async setEx(key, ttl, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    });
  }

  async del(key) {
    this.cache.delete(key);
  }
}

module.exports = CacheService;
```

---

## PHASE 4: ALGORITHM IMPLEMENTATION

### Step 4.1: Cold Start Service
File: `src/services/coldstart.service.js`

```javascript
const db = require('../config/database');

class ColdStartService {
  constructor(dependencies) {
    this.geocoding = dependencies.geocoding;
    this.routing = dependencies.routing;
    this.priority = dependencies.priority;
  }

  async coldStartPrioritization(fieldRep) {
    console.log(`Running cold start for ${fieldRep.name} (${fieldRep.territory})`);
    
    // Step 1: Find high-density territories near home
    const densityHotspots = await this.findHighDensityTerritories(fieldRep, 5);
    
    if (densityHotspots.length === 0) {
      console.log('No density hotspots found, falling back to specialty sort');
      return await this.fallbackToSpecialtySorting(fieldRep.territory);
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
      prospect.priority_score = await this.priority.calculatePriorityScore(prospect, context);
    }
    
    return prioritizedProspects;
  }

  async findHighDensityTerritories(fieldRep, maxTerritories = 5) {
    // Get unbooked prospects in territory
    const result = await db.query(`
      SELECT * FROM prospects 
      WHERE territory = $1 
      AND (appointment_status->>'isBooked')::boolean = false
      AND address_lat IS NOT NULL 
      AND address_lng IS NOT NULL
    `, [fieldRep.territory]);
    
    const prospects = result.rows;
    
    if (prospects.length === 0) {
      return [];
    }
    
    // Ensure field rep home is geocoded
    if (!fieldRep.home_lat || !fieldRep.home_lng) {
      const coords = await this.geocoding.geocodeZipCode(fieldRep.home_zip_code);
      fieldRep.home_lat = coords.lat;
      fieldRep.home_lng = coords.lng;
      
      await db.query(
        'UPDATE field_reps SET home_lat = $1, home_lng = $2 WHERE id = $3',
        [coords.lat, coords.lng, fieldRep.id]
      );
    }
    
    // Filter to prospects within 60 minutes drive
    const accessibleProspects = prospects.filter(p => {
      const distance = this.routing.calculateHaversineDistance(
        fieldRep.home_lat, fieldRep.home_lng,
        p.address_lat, p.address_lng
      );
      // Rough approximation: 1 mile = 2 minutes
      return distance * 2 <= 60;
    });
    
    // Cluster analysis
    const clusters = this.dbscanClustering(accessibleProspects, 30, 5);
    
    // Rank clusters
    const rankedClusters = clusters.map(cluster => {
      const specialtyDistribution = cluster.reduce((acc, prospect) => {
        acc[prospect.specialty] = (acc[prospect.specialty] || 0) + 1;
        return acc;
      }, {});
      
      return {
        prospects: cluster,
        size: cluster.length,
        specialtyDistribution,
        score: this.calculateClusterScore(cluster, specialtyDistribution)
      };
    }).sort((a, b) => b.score - a.score);
    
    return rankedClusters.slice(0, maxTerritories);
  }

  dbscanClustering(prospects, maxDriveTimeMinutes, minPoints) {
    const clusters = [];
    const visited = new Set();
    
    for (const prospect of prospects) {
      if (visited.has(prospect.id)) continue;
      
      const neighbors = prospects.filter(p => {
        if (p.id === prospect.id) return false;
        const distance = this.routing.calculateHaversineDistance(
          prospect.address_lat, prospect.address_lng,
          p.address_lat, p.address_lng
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

  calculateClusterScore(cluster, specialtyDistribution) {
    const sizeScore = cluster.length * 100;
    
    const specialtyWeights = {
      'dermatology': 4,
      'plastic_surgery': 3,
      'dentistry': 2,
      'chiropractic': 1
    };
    
    const specialtyScore = Object.entries(specialtyDistribution).reduce(
      (sum, [specialty, count]) => sum + (specialtyWeights[specialty] * count),
      0
    );
    
    return sizeScore + specialtyScore;
  }

  async fallbackToSpecialtySorting(territory) {
    const result = await db.query(`
      SELECT * FROM prospects 
      WHERE territory = $1 
      AND (appointment_status->>'isBooked')::boolean = false
      ORDER BY 
        CASE specialty 
          WHEN 'dermatology' THEN 1
          WHEN 'plastic_surgery' THEN 2
          WHEN 'dentistry' THEN 3
          WHEN 'chiropractic' THEN 4
        END,
        business_name
      LIMIT 100
    `, [territory]);
    
    return result.rows;
  }
}

module.exports = ColdStartService;
```

### Step 4.2: Clustering Service
File: `src/services/clustering.service.js`

```javascript
const db = require('../config/database');

class ClusteringService {
  constructor(dependencies) {
    this.routing = dependencies.routing;
    this.calendar = dependencies.calendar;
  }

  async findOrCreateRouteDay(prospect, fieldRep, targetDate = null) {
    // Step 1: Get existing route days with capacity
    const result = await db.query(`
      SELECT rd.*, 
             p.address_lat as anchor_lat, 
             p.address_lng as anchor_lng
      FROM route_days rd
      JOIN prospects p ON rd.anchor_prospect_id = p.id
      WHERE rd.field_rep_id = $1 
      AND rd.status = 'active'
      AND rd.total_appointments < 4
      ${targetDate ? 'AND rd.route_date = $2' : ''}
      ORDER BY rd.route_date
    `, targetDate ? [fieldRep.id, targetDate] : [fieldRep.id]);
    
    // Step 2: Check if prospect fits in existing route
    for (const routeDay of result.rows) {
      const driveTime = await this.routing.calculateDriveTime(
        { lat: routeDay.anchor_lat, lng: routeDay.anchor_lng },
        { lat: prospect.address_lat, lng: prospect.address_lng },
        `${routeDay.route_date}T10:00:00-05:00`
      );
      
      if (driveTime.durationMinutes <= 30) {
        return {
          routeDay: routeDay,
          suggestedDate: routeDay.route_date,
          isNewRoute: false,
          driveTimeMinutes: driveTime.durationMinutes
        };
      }
    }
    
    // Step 3: Create new route day
    const nextDate = await this.findNextAvailableDateForNewRoute(fieldRep.id);
    
    const newRoute = await db.query(`
      INSERT INTO route_days (field_rep_id, route_date, anchor_prospect_id, total_appointments)
      VALUES ($1, $2, $3, 0)
      RETURNING *
    `, [fieldRep.id, nextDate, prospect.id]);
    
    return {
      routeDay: newRoute.rows[0],
      suggestedDate: nextDate,
      isNewRoute: true,
      driveTimeMinutes: 0
    };
  }

  async findNextAvailableDateForNewRoute(fieldRepId) {
    const fieldRep = await db.query('SELECT * FROM field_reps WHERE id = $1', [fieldRepId]);
    
    if (fieldRep.rows.length === 0) {
      throw new Error('Field rep not found');
    }
    
    const rep = fieldRep.rows[0];
    this.calendar.setUserCredentials(rep.google_refresh_token);
    
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + 1); // Start with tomorrow
    
    for (let i = 0; i < 30; i++) {
      // Skip weekends
      const dayOfWeek = checkDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        checkDate.setDate(checkDate.getDate() + 1);
        continue;
      }
      
      const dateStr = checkDate.toISOString().split('T')[0];
      
      try {
        const availableSlots = await this.calendar.findAvailableTimeSlots(
          rep.google_calendar_id,
          dateStr
        );
        
        const totalAvailableHours = availableSlots.reduce(
          (sum, slot) => sum + slot.durationHours, 
          0
        );
        
        // Need at least 6 hours for a route day (3-4 visits)
        if (totalAvailableHours >= 6) {
          return dateStr;
        }
      } catch (error) {
        console.error(`Error checking availability for ${dateStr}:`, error);
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }
    
    throw new Error('No available dates found in next 30 days');
  }
}

module.exports = ClusteringService;
```

### Step 4.3: Main Algorithm Service
File: `src/services/algorithm.service.js`

```javascript
const db = require('../config/database');

class AlgorithmService {
  constructor(dependencies) {
    this.geocoding = dependencies.geocoding;
    this.routing = dependencies.routing;
    this.priority = dependencies.priority;
    this.calendar = dependencies.calendar;
    this.clustering = dependencies.clustering;
    this.coldStart = dependencies.coldStart;
    this.cache = dependencies.cache;
  }

  async generateCallingList(fieldRepId) {
    // Check cache first
    const cacheKey = `calling-list:${fieldRepId}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      console.log('Returning cached calling list');
      return cached;
    }
    
    const fieldRep = await this.getFieldRep(fieldRepId);
    const scheduledAppointments = await this.getScheduledAppointments(fieldRepId);
    
    let prioritizedList;
    
    if (scheduledAppointments.length === 0) {
      console.log('Running cold start mode');
      prioritizedList = await this.coldStart.coldStartPrioritization(fieldRep);
    } else {
      console.log('Running clustering mode');
      prioritizedList = await this.clusteringModePrioritization(fieldRep, scheduledAppointments);
    }
    
    // Cache for 1 hour
    await this.cache.set(cacheKey, prioritizedList, 3600);
    
    return prioritizedList;
  }

  async clusteringModePrioritization(fieldRep, scheduledAppointments) {
    const result = await db.query(`
      SELECT p.* 
      FROM prospects p
      WHERE p.territory = $1 
      AND (p.appointment_status->>'isBooked')::boolean = false
      AND p.address_lat IS NOT NULL 
      AND p.address_lng IS NOT NULL
    `, [fieldRep.territory]);
    
    const unbookedProspects = result.rows;
    
    // Get coordinates for scheduled appointments
    const appointmentsWithCoords = await Promise.all(
      scheduledAppointments.map(async (appt) => {
        const prospectResult = await db.query(
          'SELECT address_lat as lat, address_lng as lng FROM prospects WHERE id = $1',
          [appt.prospect_id]
        );
        return {
          ...appt,
          ...prospectResult.rows[0]
        };
      })
    );
    
    const context = {
      allProspects: unbookedProspects,
      scheduledAppointments: appointmentsWithCoords
    };
    
    // Calculate priority scores
    for (const prospect of unbookedProspects) {
      prospect.priority_score = await this.priority.calculatePriorityScore(prospect, context);
    }
    
    return unbookedProspects.sort((a, b) => b.priority_score - a.priority_score);
  }

  async getFieldRep(fieldRepId) {
    const result = await db.query('SELECT * FROM field_reps WHERE id = $1', [fieldRepId]);
    
    if (result.rows.length === 0) {
      throw new Error('Field rep not found');
    }
    
    return result.rows[0];
  }

  async getScheduledAppointments(fieldRepId) {
    const result = await db.query(`
      SELECT * FROM appointments 
      WHERE field_rep_id = $1 
      AND scheduled_date >= CURRENT_DATE
      AND status = 'confirmed'
      ORDER BY scheduled_date, scheduled_time
    `, [fieldRepId]);
    
    return result.rows;
  }
}

module.exports = AlgorithmService;
```

---

## PHASE 5: API ROUTES

### Step 5.1: Create Routes
File: `src/routes/calling.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/calling-list/:territory
router.get('/calling-list/:territory', async (req, res) => {
  try {
    const { territory } = req.params;
    
    // Get field rep for territory
    const fieldRepResult = await db.query(
      'SELECT * FROM field_reps WHERE territory = $1',
      [territory]
    );
    
    if (fieldRepResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'No field rep found for territory',
        territory 
      });
    }
    
    const fieldRep = fieldRepResult.rows[0];
    
    // Get algorithm service (injected via app context)
    const algorithmService = req.app.get('algorithmService');
    const callingList = await algorithmService.generateCallingList(fieldRep.id);
    
    res.json({
      territory,
      fieldRep: {
        name: fieldRep.name,
        id: fieldRep.id
      },
      prospects: callingList.slice(0, 50), // Return top 50
      totalProspects: callingList.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching calling list:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/calling-list/refresh/:territory
router.post('/calling-list/refresh/:territory', async (req, res) => {
  try {
    const { territory } = req.params;
    
    const fieldRepResult = await db.query(
      'SELECT * FROM field_reps WHERE territory = $1',
      [territory]
    );
    
    if (fieldRepResult.rows.length === 0) {
      return res.status(404).json({ error: 'No field rep found for territory' });
    }
    
    const fieldRep = fieldRepResult.rows[0];
    const cacheService = req.app.get('cacheService');
    
    // Clear cache
    await cacheService.del(`calling-list:${fieldRep.id}`);
    
    // Regenerate
    const algorithmService = req.app.get('algorithmService');
    const callingList = await algorithmService.generateCallingList(fieldRep.id);
    
    res.json({
      success: true,
      message: 'Calling list refreshed',
      totalProspects: callingList.length
    });
  } catch (error) {
    console.error('Error refreshing calling list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

File: `src/routes/appointments.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/appointments/booking-options
router.post('/appointments/booking-options', async (req, res) => {
  try {
    const { prospectId, callerId } = req.body;
    
    if (!prospectId) {
      return res.status(400).json({ error: 'prospectId is required' });
    }
    
    // Get prospect
    const prospectResult = await db.query(
      'SELECT * FROM prospects WHERE id = $1',
      [prospectId]
    );
    
    if (prospectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const prospect = prospectResult.rows[0];
    
    // Get field rep
    const fieldRepResult = await db.query(
      'SELECT * FROM field_reps WHERE territory = $1',
      [prospect.territory]
    );
    
    if (fieldRepResult.rows.length === 0) {
      return res.status(404).json({ error: 'No field rep for territory' });
    }
    
    const fieldRep = fieldRepResult.rows[0];
    
    // Get clustering service
    const clusteringService = req.app.get('clusteringService');
    const routeInfo = await clusteringService.findOrCreateRouteDay(prospect, fieldRep);
    
    // Get calendar service
    const calendarService = req.app.get('calendarService');
    calendarService.setUserCredentials(fieldRep.google_refresh_token);
    
    const availableSlots = await calendarService.findAvailableTimeSlots(
      fieldRep.google_calendar_id,
      routeInfo.suggestedDate
    );
    
    const fitCheck = calendarService.canFitAppointment(
      availableSlots,
      45, // visit duration
      routeInfo.driveTimeMinutes
    );
    
    if (!fitCheck.canFit) {
      return res.json({
        error: 'no_availability',
        message: 'No available time slots on suggested date',
        suggestedDate: routeInfo.suggestedDate
      });
    }
    
    const suggestedTimes = calendarService.formatTimeSlots(
      availableSlots,
      fitCheck.suggestedStartTime
    );
    
    res.json({
      prospectId,
      prospectName: prospect.business_name,
      fieldRep: {
        name: fieldRep.name,
        territory: fieldRep.territory
      },
      suggestedDate: routeInfo.suggestedDate,
      suggestedTimes,
      routeContext: {
        isNewRoute: routeInfo.isNewRoute,
        currentAppointments: routeInfo.routeDay.total_appointments,
        maxCapacity: 4,
        driveTimeMinutes: routeInfo.driveTimeMinutes
      }
    });
  } catch (error) {
    console.error('Error getting booking options:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/appointments/confirm
router.post('/appointments/confirm', async (req, res) => {
  try {
    const { prospectId, selectedDate, selectedTime, callerId } = req.body;
    
    if (!prospectId || !selectedDate || !selectedTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: prospectId, selectedDate, selectedTime' 
      });
    }
    
    // Get prospect and field rep
    const prospectResult = await db.query('SELECT * FROM prospects WHERE id = $1', [prospectId]);
    const prospect = prospectResult.rows[0];
    
    const fieldRepResult = await db.query(
      'SELECT * FROM field_reps WHERE territory = $1',
      [prospect.territory]
    );
    const fieldRep = fieldRepResult.rows[0];
    
    // Create calendar event
    const calendarService = req.app.get('calendarService');
    calendarService.setUserCredentials(fieldRep.google_refresh_token);
    
    const startDateTime = `${selectedDate}T${selectedTime}:00-05:00`;
    const endTime = new Date(startDateTime);
    endTime.setMinutes(endTime.getMinutes() + 45);
    
    const event = await calendarService.createEvent(fieldRep.google_calendar_id, {
      summary: `Visit: ${prospect.business_name}`,
      description: `
Specialty: ${prospect.specialty}
Phone: ${prospect.phone_number}
Address: ${prospect.address_street}, ${prospect.address_city}, ${prospect.address_state} ${prospect.address_zip}
Booked by: ${callerId || 'Unknown'}
      `.trim(),
      location: `${prospect.address_street}, ${prospect.address_city}, ${prospect.address_state} ${prospect.address_zip}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York'
      }
    });
    
    // Create appointment record
    await db.query(`
      INSERT INTO appointments (prospect_id, field_rep_id, scheduled_date, scheduled_time, google_calendar_event_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [prospectId, fieldRep.id, selectedDate, selectedTime, event.id]);
    
    // Update prospect
    await db.query(`
      UPDATE prospects 
      SET appointment_status = jsonb_set(
        jsonb_set(
          jsonb_set(appointment_status, '{isBooked}', 'true'),
          '{scheduledDate}', to_jsonb($1::text)
        ),
        '{fieldRepId}', to_jsonb($2::text)
      ),
      updated_at = NOW()
      WHERE id = $3
    `, [startDateTime, fieldRep.id, prospectId]);
    
    // Add call history
    await db.query(`
      INSERT INTO call_history (prospect_id, caller_id, outcome, notes)
      VALUES ($1, $2, 'booked', $3)
    `, [prospectId, callerId || 'system', `Appointment scheduled for ${selectedDate} at ${selectedTime}`]);
    
    // Update route day
    await db.query(`
      UPDATE route_days 
      SET total_appointments = total_appointments + 1,
          updated_at = NOW()
      WHERE field_rep_id = $1 AND route_date = $2
    `, [fieldRep.id, selectedDate]);
    
    // Clear cache
    const cacheService = req.app.get('cacheService');
    await cacheService.del(`calling-list:${fieldRep.id}`);
    
    res.json({
      success: true,
      appointment: {
        prospectId,
        prospectName: prospect.business_name,
        date: selectedDate,
        time: selectedTime,
        fieldRep: fieldRep.name,
        googleCalendarEventId: event.id
      }
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
```

---

## PHASE 6: MAIN APPLICATION

### Step 6.1: Create Main App
File: `src/app.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import services
const GeocodingService = require('./services/geocoding.service');
const RoutingService = require('./services/routing.service');
const PriorityService = require('./services/priority.service');
const CalendarService = require('./services/calendar.service');
const ClusteringService = require('./services/clustering.service');
const ColdStartService = require('./services/coldstart.service');
const AlgorithmService = require('./services/algorithm.service');
const CacheService = require('./services/cache.service');

// Import routes
const callingRoutes = require('./routes/calling.routes');
const appointmentRoutes = require('./routes/appointments.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize services
const geocodingService = new GeocodingService();
const routingService = new RoutingService();
const priorityService = new PriorityService(routingService);
const calendarService = new CalendarService();
const cacheService = new CacheService();

const clusteringService = new ClusteringService({
  routing: routingService,
  calendar: calendarService
});

const coldStartService = new ColdStartService({
  geocoding: geocodingService,
  routing: routingService,
  priority: priorityService
});

const algorithmService = new AlgorithmService({
  geocoding: geocodingService,
  routing: routingService,
  priority: priorityService,
  calendar: calendarService,
  clustering: clusteringService,
  coldStart: coldStartService,
  cache: cacheService
});

// Make services available to routes
app.set('algorithmService', algorithmService);
app.set('clusteringService', clusteringService);
app.set('calendarService', calendarService);
app.set('cacheService', cacheService);

// Routes
app.use('/api', callingRoutes);
app.use('/api', appointmentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  QuantumPunch Algorithm Server                            ║
║  Port: ${PORT}                                           ║
║  Environment: ${process.env.NODE_ENV}                    ║
║  Time: ${new Date().toISOString()}                       ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
```

---

## PHASE 7: DATA SCRIPTS

### Step 7.1: Geocode Existing Prospects
File: `scripts/geocode-prospects.js`

```javascript
const db = require('../src/config/database');
const GeocodingService = require('../src/services/geocoding.service');

async function geocodeAllProspects() {
  const geocodingService = new GeocodingService();
  
  const result = await db.query(`
    SELECT * FROM prospects 
    WHERE address_lat IS NULL OR address_lng IS NULL
    ORDER BY created_at DESC
  `);
  
  const prospects = result.rows;
  
  console.log(`\nFound ${prospects.length} prospects to geocode\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < prospects.length; i++) {
    const prospect = prospects[i];
    
    try {
      const coords = await geocodingService.geocodeAddress({
        street: prospect.address_street,
        city: prospect.address_city,
        state: prospect.address_state,
        zipCode: prospect.address_zip
      });
      
      await db.query(
        'UPDATE prospects SET address_lat = $1, address_lng = $2, updated_at = NOW() WHERE id = $3',
        [coords.lat, coords.lng, prospect.id]
      );
      
      successCount++;
      console.log(`✓ [${i + 1}/${prospects.length}] ${prospect.business_name}`);
    } catch (error) {
      failCount++;
      console.error(`✗ [${i + 1}/${prospects.length}] ${prospect.business_name}: ${error.message}`);
    }
    
    // Rate limiting: pause every 50 requests
    if ((i + 1) % 50 === 0 && i + 1 < prospects.length) {
      console.log('\n⏸️  Pausing 10 seconds for rate limit...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log(`\n✅ Geocoding complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  
  process.exit(0);
}

geocodeAllProspects().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### Step 7.2: Initialize Field Reps
File: `scripts/init-field-reps.js`

```javascript
const db = require('../src/config/database');
const GeocodingService = require('../src/services/geocoding.service');

async function initializeFieldReps() {
  const geocodingService = new GeocodingService();
  
  console.log('Initializing field reps...\n');
  
  // DC Rep
  console.log('Setting up DC field rep...');
  const dcCoords = await geocodingService.geocodeZipCode('22101');
  
  await db.query(`
    INSERT INTO field_reps (name, territory, home_zip_code, home_lat, home_lng)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT DO NOTHING
  `, ['DC Field Rep', 'dc', '22101', dcCoords.lat, dcCoords.lng]);
  
  console.log(`✓ DC Rep created (Home: 22101, ${dcCoords.lat}, ${dcCoords.lng})`);
  
  // Miami Rep (placeholder)
  console.log('Setting up Miami field rep...');
  await db.query(`
    INSERT INTO field_reps (name, territory, home_zip_code)
    VALUES ($1, $2, $3)
    ON CONFLICT DO NOTHING
  `, ['Miami Field Rep', 'miami', 'TBD']);
  
  console.log('✓ Miami Rep created (Home: TBD - needs configuration)');
  
  console.log('\n✅ Field reps initialized!');
  process.exit(0);
}

initializeFieldReps().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
```

---

## PHASE 8: PACKAGE.JSON SCRIPTS

Add to `package.json`:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "setup-db": "node scripts/run-db-setup.js",
    "init-reps": "node scripts/init-field-reps.js",
    "geocode": "node scripts/geocode-prospects.js",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## EXECUTION SEQUENCE

Run these commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Set up database schema
npm run setup-db

# 3. Initialize field reps
npm run init-reps

# 4. Geocode existing prospects (if you have data)
npm run geocode

# 5. Start the server
npm run dev
```

---

## TESTING THE API

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

### Test 2: Get Calling List
```bash
curl http://localhost:3000/api/calling-list/dc
```

### Test 3: Get Booking Options
```bash
curl -X POST http://localhost:3000/api/appointments/booking-options \
  -H "Content-Type: application/json" \
  -d '{"prospectId": "YOUR_PROSPECT_ID", "callerId": "test_caller"}'
```

---

## IMPORTANT NOTES

1. **HERE API Key**: You MUST register at https://developer.here.com/ and get an API key
2. **Google Calendar**: You need to set up OAuth credentials in Google Cloud Console
3. **Database**: Ensure PostgreSQL is running and DATABASE_URL is correct
4. **Redis**: Optional but recommended for production (falls back to in-memory cache)
5. **Miami Rep Home ZIP**: Update this when you know the Miami rep's home location

---

## NEXT STEPS AFTER IMPLEMENTATION

1. **Load test data**: Import your 3,000+ Florida healthcare prospects
2. **Configure Google Calendar**: Set up OAuth for field reps
3. **Test booking flow**: Book a test appointment and verify calendar integration
4. **Monitor performance**: Check API response times and cache hit rates
5. **Iterate**: Adjust priority weights based on real-world results

---

## TROUBLESHOOTING

### Issue: "HERE_API_KEY is required"
- Register at https://developer.here.com/
- Copy API key to `.env` file

### Issue: Database connection failed
- Check DATABASE_URL in `.env`
- Ensure PostgreSQL is running
- Run `npm run setup-db` to create tables

### Issue: No prospects returned
- Run `npm run geocode` to geocode addresses
- Check that prospects have `territory` set correctly

### Issue: Calendar integration fails
- Verify Google OAuth credentials
- Check that field rep has `google_refresh_token` set
- Ensure calendar API is enabled in Google Cloud Console

---

## SUCCESS CRITERIA

✅ API starts without errors
✅ Database schema is created
✅ Field reps are initialized
✅ Prospects are geocoded
✅ Calling list returns prioritized prospects
✅ Booking options returns available times
✅ Appointments create calendar events
✅ Cache reduces duplicate API calls

---

**Full design documentation**: `/home/claude/smart-calling-algorithm-design.md`
**Linear ticket**: TYPU-18
