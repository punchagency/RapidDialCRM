import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, insertFieldRepSchema, insertAppointmentSchema } from "@shared/schema";
import { generateSmartCallingList, calculatePriorityScore } from "./services/optimization";
import { geocodeProspects } from "./services/geocoding";
import { seedDatabase } from "./seedData";
import { seedAllMockData } from "./seedAllData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed database on startup
  await seedDatabase().catch(err => console.error("Failed to seed database:", err));
  await seedAllMockData().catch(err => console.error("Failed to seed mock data:", err));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // GET /api/prospects - List all prospects
  app.get("/api/prospects", async (req, res) => {
    try {
      const territory = req.query.territory as string;
      let prospects;
      if (territory) {
        prospects = await storage.listProspectsByTerritory(territory);
      } else {
        prospects = await storage.listAllProspects();
      }
      res.json(prospects);
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

  const httpServer = createServer(app);
  return httpServer;
}
