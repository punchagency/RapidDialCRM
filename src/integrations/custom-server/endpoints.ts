export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    register: "POST /api/v1/auth/register",
    login: "POST /api/v1/auth/login",
    refresh: "POST /api/v1/auth/refresh",
    me: "GET /api/v1/auth/me",
    passwordResetRequest: "POST /api/v1/auth/password-reset/request",
    passwordResetConfirm: "POST /api/v1/auth/password-reset/confirm",
    googleLogin: "POST /api/v1/auth/google",
  },

  // Health check
  health: {
    check: "GET /api/v1/health",
  },

  // Prospects endpoints
  prospects: {
    findAll: "GET /api/v1/prospects",
    findOne: "GET /api/v1/prospects/:id",
    create: "POST /api/v1/prospects",
    update: "PATCH /api/v1/prospects/:id",
    delete: "DELETE /api/v1/prospects/:id",
    findByTerritory: "GET /api/v1/prospects/territory/:territory",
  },

  // Calling list endpoints
  callingList: {
    getByFieldRep: "GET /api/v1/calling-list/:fieldRepId",
  },

  // Field reps endpoints
  fieldReps: {
    findAll: "GET /api/v1/field-reps",
    create: "POST /api/v1/field-reps",
    update: "PATCH /api/v1/field-reps/:id",
  },

  // Appointments endpoints
  appointments: {
    create: "POST /api/v1/appointments",
    getByFieldRepAndDate: "GET /api/v1/appointments/:fieldRepId/:date",
    getToday: "GET /api/v1/appointments/today",
    update: "PATCH /api/v1/appointments/:id",
  },

  // Call outcomes endpoints
  callOutcome: {
    record: "POST /api/v1/call-outcome",
  },

  // Geocoding endpoints
  geocoding: {
    geocodeProspects: "POST /api/v1/geocode-prospects",
    recalculatePriorities: "POST /api/v1/recalculate-priorities",
  },

  // Stakeholders endpoints
  stakeholders: {
    getByProspect: "GET /api/v1/stakeholders/:prospectId",
    create: "POST /api/v1/stakeholders",
    getOne: "GET /api/v1/stakeholders/detail/:id",
    update: "PATCH /api/v1/stakeholders/:id",
    delete: "DELETE /api/v1/stakeholders/:id",
  },

  // Users endpoints
  users: {
    findAll: "GET /api/v1/users",
    create: "POST /api/v1/users",
    findOne: "GET /api/v1/users/:id",
    findByEmail: "GET /api/v1/users/email/:email",
    update: "PATCH /api/v1/users/:id",
    delete: "DELETE /api/v1/users/:id",
  },

  // User territories endpoints
  userTerritories: {
    getUserTerritories: "GET /api/v1/users/:id/territories",
    setUserTerritories: "PUT /api/v1/users/:id/territories",
    getAllTerritories: "GET /api/v1/territories",
  },

  // User professions endpoints
  userProfessions: {
    getUserProfessions: "GET /api/v1/users/:id/professions",
    setUserProfessions: "PUT /api/v1/users/:id/professions",
    getAllProfessions: "GET /api/v1/professions",
  },

  // Territories endpoints (standalone table)
  territories: {
    findAll: "GET /api/v1/territories",
    findOne: "GET /api/v1/territories/:id",
    create: "POST /api/v1/territories",
    update: "PATCH /api/v1/territories/:id",
    delete: "DELETE /api/v1/territories/:id",
  },

  // Professions endpoints (standalone table)
  professions: {
    findAll: "GET /api/v1/professions",
    findOne: "GET /api/v1/professions/:id",
    create: "POST /api/v1/professions",
    update: "PATCH /api/v1/professions/:id",
    delete: "DELETE /api/v1/professions/:id",
  },

  // User assignments endpoints
  userAssignments: {
    getAssignments: "GET /api/v1/users/:id/assignments",
    setAssignments: "PUT /api/v1/users/:id/assignments",
  },

  // Specialty colors endpoints
  specialtyColors: {
    findAll: "GET /api/v1/specialty-colors",
    findOne: "GET /api/v1/specialty-colors/:specialty",
    update: "PATCH /api/v1/specialty-colors/:specialty",
  },

  // Call outcomes configuration endpoints
  callOutcomes: {
    findAll: "GET /api/v1/call-outcomes",
    create: "POST /api/v1/call-outcomes",
    update: "PATCH /api/v1/call-outcomes/:id",
    delete: "DELETE /api/v1/call-outcomes/:id",
  },

  callHistory: {
    findAll: "GET /api/v1/call-history",
    create: "POST /api/v1/call-history",
    update: "PATCH /api/v1/call-history/:id",
    delete: "DELETE /api/v1/call-history/:id",
  },

  // Twilio endpoints
  twilio: {
    generateToken: "POST /api/v1/twilio/token",
    voice: "POST /api/v1/twilio/voice",
    makeCall: "POST /api/v1/twilio/call",
    status: "POST /api/v1/twilio/status",
    getConfig: "GET /api/v1/twilio/config",
  },

  // LiveKit endpoints
  livekit: {
    getConfig: "GET /api/v1/livekit/config",
    generateToken: "POST /api/v1/livekit/token",
    createCall: "POST /api/v1/livekit/call",
    endCall: "POST /api/v1/livekit/end-call",
  },

  // Bulk operations endpoints
  bulk: {
    search: "POST /api/v1/bulk-search",
    add: "POST /api/v1/bulk-add",
    updateProspectAddresses: "POST /api/v1/update-prospect-addresses",
  },

  // Issues endpoints
  issues: {
    findAll: "GET /api/v1/issues",
    findOne: "GET /api/v1/issues/:id",
    create: "POST /api/v1/issues",
    update: "PATCH /api/v1/issues/:id",
    delete: "DELETE /api/v1/issues/:id",
  },

  // Linear endpoints
  linear: {
    getTeams: "GET /api/v1/linear/teams",
    getIssues: "GET /api/v1/linear/issues",
  },

  // Team relationships endpoints
  teamRelationships: {
    findAll: "GET /api/v1/team-relationships",
    save: "POST /api/v1/team-relationships",
    delete: "DELETE /api/v1/team-relationships/:insideRepId",
  },

  // Email templates endpoints
  emailTemplates: {
    findAll: "GET /api/v1/email-templates",
    findOne: "GET /api/v1/email-templates/:id",
    create: "POST /api/v1/email-templates",
    update: "PATCH /api/v1/email-templates/:id",
    delete: "DELETE /api/v1/email-templates/:id",
  },
  email: {
    findAll: "GET /api/v1/email",
    findOne: "GET /api/v1/email/:id",
    create: "POST /api/v1/email",
  },
};

export default API_ENDPOINTS;
