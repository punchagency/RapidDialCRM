import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProspectSchema, insertFieldRepSchema, insertAppointmentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // GET /api/calling-list/:territory - Get prioritized calling list
  app.get("/api/calling-list/:territory", async (req, res) => {
    try {
      const { territory } = req.params;
      const prospects = await storage.listProspectsByTerritory(territory);

      // Sort by priority score (descending)
      const sorted = prospects.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));

      res.json({
        territory,
        count: sorted.length,
        prospects: sorted.slice(0, 50), // Return top 50
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

  const httpServer = createServer(app);
  return httpServer;
}
