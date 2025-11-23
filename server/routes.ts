import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, insertFieldRepSchema, insertAppointmentSchema, insertStakeholderSchema, insertUserSchema, insertSpecialtyColorSchema, insertCallOutcomeSchema } from "@shared/schema";
import { generateSmartCallingList, calculatePriorityScore } from "./services/optimization";
import { geocodeProspects, getFullAddressFromHere } from "./services/geocoding";
import { seedDatabase } from "./seedData";
import { seedAllMockData } from "./seedAllData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database on startup
  await seedDatabase().catch(err => console.error("Failed to seed database:", err));
  await seedAllMockData().catch(err => console.error("Failed to seed mock data:", err));
  
  // Initialize specialty colors
  await storage.initializeSpecialtyColors(["Dental", "Chiropractor", "Optometry", "Physical Therapy", "Orthodontics"]).catch(err => console.error("Failed to initialize specialty colors:", err));
  
  // Initialize call outcomes
  await storage.initializeCallOutcomes().catch(err => console.error("Failed to initialize call outcomes:", err));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // GET /api/prospects - List all prospects with pagination
  app.get("/api/prospects", async (req, res) => {
    try {
      const territory = req.query.territory as string;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;
      
      let prospects;
      if (territory) {
        prospects = await storage.listProspectsByTerritory(territory);
      } else {
        prospects = await storage.listAllProspects();
      }
      
      const total = prospects.length;
      const paginated = prospects.slice(offset, offset + limit);
      
      res.json({ data: paginated, total, offset, limit });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prospects" });
    }
  });

  // GET /api/calling-list/:fieldRepId - Get smart optimized calling list for field rep
  app.get("/api/calling-list/:fieldRepId", async (req, res) => {
    try {
      const { fieldRepId } = req.params;
      const fieldRep = await storage.getFieldRep(fieldRepId);
      
      if (!fieldRep) {
        return res.status(404).json({ error: "Field rep not found" });
      }

      const allProspects = await storage.listProspectsByTerritory(fieldRep.territory);
      
      // Generate smart calling list
      const optimizedList = generateSmartCallingList(allProspects, fieldRep);

      res.json({
        fieldRepId,
        territory: fieldRep.territory,
        count: optimizedList.length,
        prospects: optimizedList.slice(0, 50),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calling list" });
    }
  });

  // POST /api/prospects - Create prospect
  app.post("/api/prospects", async (req, res) => {
    try {
      const data = insertProspectSchema.parse(req.body);
      const prospect = await storage.createProspect(data);
      res.status(201).json(prospect);
    } catch (error) {
      res.status(400).json({ error: "Invalid prospect data" });
    }
  });

  // GET /api/prospects/:id - Get prospect
  app.get("/api/prospects/:id", async (req, res) => {
    try {
      const prospect = await storage.getProspect(req.params.id);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(prospect);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prospect" });
    }
  });

  // PATCH /api/prospects/:id - Update prospect
  app.patch("/api/prospects/:id", async (req, res) => {
    try {
      const prospect = await storage.updateProspect(req.params.id, req.body);
      if (!prospect) {
        return res.status(404).json({ error: "Prospect not found" });
      }
      res.json(prospect);
    } catch (error) {
      res.status(500).json({ error: "Failed to update prospect" });
    }
  });

  // GET /api/field-reps - List all field reps
  app.get("/api/field-reps", async (req, res) => {
    try {
      const reps = await storage.listFieldReps();
      res.json(reps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch field reps" });
    }
  });

  // POST /api/field-reps - Create field rep
  app.post("/api/field-reps", async (req, res) => {
    try {
      const data = insertFieldRepSchema.parse(req.body);
      const rep = await storage.createFieldRep(data);
      res.status(201).json(rep);
    } catch (error) {
      res.status(400).json({ error: "Invalid field rep data" });
    }
  });

  // POST /api/appointments - Create appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const data = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });

  // GET /api/appointments/:fieldRepId/:date - Get appointments for field rep on date
  app.get("/api/appointments/:fieldRepId/:date", async (req, res) => {
    try {
      const appointments = await storage.listAppointmentsByFieldRepAndDate(
        req.params.fieldRepId,
        req.params.date
      );
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // POST /api/call-outcome - Record call outcome
  app.post("/api/call-outcome", async (req, res) => {
    try {
      const { prospectId, callerId, outcome, notes } = req.body;
      await storage.recordCallOutcome(prospectId, callerId, outcome, notes);
      res.json({ status: "recorded" });
    } catch (error) {
      res.status(500).json({ error: "Failed to record call outcome" });
    }
  });

  // POST /api/geocode-prospects - Geocode unlocated prospects
  app.post("/api/geocode-prospects", async (req, res) => {
    try {
      const unlocated = await storage.listProspectsWithoutCoordinates();
      const results = await geocodeProspects(unlocated.map(p => ({
        id: p.id,
        addressStreet: p.addressStreet || undefined,
        addressCity: p.addressCity || undefined,
        addressState: p.addressState || undefined,
        addressZip: p.addressZip || undefined,
      })));

      // Update prospects with coordinates
      for (const result of results) {
        await storage.updateProspect(result.id, {
          addressLat: result.lat.toString() as any,
          addressLng: result.lng.toString() as any,
        });
      }

      res.json({
        geocoded: results.length,
        total: unlocated.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to geocode prospects" });
    }
  });

  // POST /api/recalculate-priorities - Recalculate priority scores for all prospects
  app.post("/api/recalculate-priorities", async (req, res) => {
    try {
      const prospects = await storage.listProspectsByTerritory(req.body.territory || "");
      
      for (const prospect of prospects) {
        const score = calculatePriorityScore(prospect);
        await storage.updateProspect(prospect.id, { priorityScore: score });
      }

      res.json({
        updated: prospects.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to recalculate priorities" });
    }
  });

  // GET /api/stakeholders/:prospectId - Get stakeholders for a prospect
  app.get("/api/stakeholders/:prospectId", async (req, res) => {
    try {
      const stakeholders = await storage.listStakeholdersByProspect(req.params.prospectId);
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stakeholders" });
    }
  });

  // POST /api/stakeholders - Create stakeholder
  app.post("/api/stakeholders", async (req, res) => {
    try {
      const data = insertStakeholderSchema.parse(req.body);
      const stakeholder = await storage.createStakeholder(data);
      res.status(201).json(stakeholder);
    } catch (error) {
      res.status(400).json({ error: "Invalid stakeholder data" });
    }
  });

  // GET /api/stakeholders/detail/:id - Get single stakeholder
  app.get("/api/stakeholders/detail/:id", async (req, res) => {
    try {
      const stakeholder = await storage.getStakeholder(req.params.id);
      if (!stakeholder) {
        return res.status(404).json({ error: "Stakeholder not found" });
      }
      res.json(stakeholder);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stakeholder" });
    }
  });

  // PATCH /api/stakeholders/:id - Update stakeholder
  app.patch("/api/stakeholders/:id", async (req, res) => {
    try {
      const stakeholder = await storage.updateStakeholder(req.params.id, req.body);
      if (!stakeholder) {
        return res.status(404).json({ error: "Stakeholder not found" });
      }
      res.json(stakeholder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stakeholder" });
    }
  });

  // DELETE /api/stakeholders/:id - Delete stakeholder
  app.delete("/api/stakeholders/:id", async (req, res) => {
    try {
      await storage.deleteStakeholder(req.params.id);
      res.json({ status: "deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stakeholder" });
    }
  });

  // GET /api/users - List all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // POST /api/users - Create user
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // GET /api/users/:id - Get user
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // GET /api/users/email/:email - Get user by email
  app.get("/api/users/email/:email", async (req, res) => {
    try {
      const user = await storage.getUserByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // PATCH /api/users/:id - Update user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // DELETE /api/users/:id - Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ status: "deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // POST /api/update-prospect-addresses - Update all prospects with full addresses from HERE API
  app.post("/api/update-prospect-addresses", async (req, res) => {
    try {
      const prospects = await storage.listAllProspects();
      let updated = 0;
      let failed = 0;
      const errors = [];

      for (const prospect of prospects) {
        try {
          const address = [
            prospect.addressStreet,
            prospect.addressCity,
            prospect.addressState,
            prospect.addressZip,
          ]
            .filter(Boolean)
            .join(", ");

          if (!address) {
            failed++;
            errors.push(`Prospect ${prospect.id}: No address to lookup`);
            continue;
          }

          const result = await getFullAddressFromHere(address);
          if (result) {
            await storage.updateProspect(prospect.id, {
              addressStreet: result.street || prospect.addressStreet,
              addressCity: result.city || prospect.addressCity,
              addressState: result.state || prospect.addressState,
              addressZip: result.zip || prospect.addressZip,
              addressLat: result.latitude.toString() as any,
              addressLng: result.longitude.toString() as any,
            });
            updated++;
          } else {
            failed++;
            errors.push(`Prospect ${prospect.id}: HERE API lookup failed`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (err) {
          failed++;
          errors.push(`Prospect ${prospect.id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      res.json({
        total: prospects.length,
        updated,
        failed,
        errors: errors.slice(0, 10), // Return first 10 errors
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update prospect addresses" });
    }
  });

  // GET /api/specialty-colors - List all specialty colors (cached)
  let cachedColors: any[] | null = null;
  let colorsCacheTime = 0;
  
  app.get("/api/specialty-colors", async (req, res) => {
    try {
      const now = Date.now();
      // Cache for 5 minutes
      if (cachedColors && (now - colorsCacheTime) < 300000) {
        return res.json(cachedColors);
      }
      
      const colors = await storage.listSpecialtyColors();
      cachedColors = colors;
      colorsCacheTime = now;
      res.json(colors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch specialty colors" });
    }
  });

  // GET /api/specialty-colors/:specialty - Get color for specific specialty
  app.get("/api/specialty-colors/:specialty", async (req, res) => {
    try {
      const color = await storage.getSpecialtyColor(req.params.specialty);
      if (!color) {
        return res.status(404).json({ error: "Specialty color not found" });
      }
      res.json(color);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch specialty color" });
    }
  });

  // PATCH /api/specialty-colors/:specialty - Update specialty color
  app.patch("/api/specialty-colors/:specialty", async (req, res) => {
    try {
      const color = await storage.updateSpecialtyColor(req.params.specialty, req.body);
      if (!color) {
        return res.status(404).json({ error: "Specialty color not found" });
      }
      res.json(color);
    } catch (error) {
      res.status(500).json({ error: "Failed to update specialty color" });
    }
  });

  // GET /api/call-outcomes - List all call outcomes (cached)
  let cachedOutcomes: any[] | null = null;
  let outcomesCacheTime = 0;
  
  app.get("/api/call-outcomes", async (req, res) => {
    try {
      const now = Date.now();
      // Cache for 5 minutes
      if (cachedOutcomes && (now - outcomesCacheTime) < 300000) {
        return res.json(cachedOutcomes);
      }
      
      const outcomes = await storage.listCallOutcomes();
      cachedOutcomes = outcomes;
      outcomesCacheTime = now;
      res.json(outcomes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch call outcomes" });
    }
  });

  // POST /api/call-outcomes - Create call outcome
  app.post("/api/call-outcomes", async (req, res) => {
    try {
      const data = insertCallOutcomeSchema.parse(req.body);
      const outcome = await storage.createCallOutcome(data);
      res.status(201).json(outcome);
    } catch (error) {
      res.status(400).json({ error: "Invalid call outcome data" });
    }
  });

  // PATCH /api/call-outcomes/:id - Update call outcome
  app.patch("/api/call-outcomes/:id", async (req, res) => {
    try {
      const outcome = await storage.updateCallOutcome(req.params.id, req.body);
      if (!outcome) {
        return res.status(404).json({ error: "Call outcome not found" });
      }
      cachedOutcomes = null; // Clear cache
      res.json(outcome);
    } catch (error) {
      res.status(500).json({ error: "Failed to update call outcome" });
    }
  });

  // DELETE /api/call-outcomes/:id - Delete call outcome
  app.delete("/api/call-outcomes/:id", async (req, res) => {
    try {
      await storage.deleteCallOutcome(req.params.id);
      cachedOutcomes = null; // Clear cache
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete call outcome" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
