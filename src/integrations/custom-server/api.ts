import { ApiPrep } from "./api-prep";
import { API_ENDPOINTS } from "./endpoints";
import type {
  Prospect,
  User,
  FieldRep,
  Appointment,
  Stakeholder,
  SpecialtyColor,
  CallOutcome,
  CallHistory,
} from "@/lib/types";

export class CustomServerApi {
  // ==================== AUTH ====================
  static async login(email: string, password: string) {
    return ApiPrep.makeRequest<{ token: string; user: User }>(
      API_ENDPOINTS.auth.login,
      { email, password }
    );
  }

  static async register(payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
    territory?: string;
  }) {
    return ApiPrep.makeRequest<{ token: string; user: User }>(
      API_ENDPOINTS.auth.register,
      payload
    );
  }

  static async me() {
    return ApiPrep.makeRequest<User>(API_ENDPOINTS.auth.me);
  }

  static async requestPasswordReset(email: string) {
    return ApiPrep.makeRequest<{ message: string }>(
      API_ENDPOINTS.auth.passwordResetRequest,
      { email }
    );
  }

  static async confirmPasswordReset(payload: {
    token: string;
    password: string;
  }) {
    return ApiPrep.makeRequest<{ message: string }>(
      API_ENDPOINTS.auth.passwordResetConfirm,
      payload
    );
  }

  static async googleLogin(idToken: string) {
    return ApiPrep.makeRequest<{ token: string; user: User }>(
      API_ENDPOINTS.auth.googleLogin,
      { idToken }
    );
  }

  // ==================== PROSPECTS ====================
  static async getProspects(params?: {
    territory?: string;
    limit?: number;
    offset?: number;
    called?: boolean;
  }) {
    const queryParams: Record<string, string> = {};
    if (params?.territory) queryParams.territory = params.territory;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();
    if (params?.called) queryParams.called = params.called.toString();

    return ApiPrep.makeRequest<Prospect[]>(
      API_ENDPOINTS.prospects.findAll,
      undefined,
      { queryParams }
    );
  }

  static async getProspect(id: string) {
    return ApiPrep.makeRequest<Prospect>(
      API_ENDPOINTS.prospects.findOne,
      undefined,
      { params: { id } }
    );
  }

  static async createProspect(data: Partial<Prospect>) {
    return ApiPrep.makeRequest<Prospect>(API_ENDPOINTS.prospects.create, data);
  }

  static async updateProspect(id: string, data: Partial<Prospect>) {
    return ApiPrep.makeRequest<Prospect>(API_ENDPOINTS.prospects.update, data, {
      params: { id },
    });
  }

  static async deleteProspect(id: string) {
    return ApiPrep.makeRequest(API_ENDPOINTS.prospects.delete, undefined, {
      params: { id },
    });
  }

  static async getProspectsByTerritory(territory: string) {
    return ApiPrep.makeRequest<Prospect[]>(
      API_ENDPOINTS.prospects.findByTerritory,
      undefined,
      { params: { territory } }
    );
  }

  // ==================== CALLING LIST ====================
  static async getCallingList(fieldRepId: string) {
    return ApiPrep.makeRequest<{
      fieldRepId: string;
      territory: string;
      count: number;
      prospects: Prospect[];
    }>(API_ENDPOINTS.callingList.getByFieldRep, undefined, {
      params: { fieldRepId },
    });
  }

  // ==================== FIELD REPS ====================
  static async getFieldReps() {
    return ApiPrep.makeRequest<FieldRep[]>(API_ENDPOINTS.fieldReps.findAll);
  }

  static async createFieldRep(data: Partial<FieldRep>) {
    return ApiPrep.makeRequest<FieldRep>(API_ENDPOINTS.fieldReps.create, data);
  }

  static async updateFieldRep(id: string, data: Partial<FieldRep>) {
    return ApiPrep.makeRequest<FieldRep>(API_ENDPOINTS.fieldReps.update, data, {
      params: { id },
    });
  }

  // ==================== APPOINTMENTS ====================
  static async createAppointment(data: Partial<Appointment>) {
    return ApiPrep.makeRequest<Appointment>(
      API_ENDPOINTS.appointments.create,
      data
    );
  }

  static async getAppointmentsByFieldRepAndDate(
    fieldRepId: string,
    date: string
  ) {
    return ApiPrep.makeRequest<Appointment[]>(
      API_ENDPOINTS.appointments.getByFieldRepAndDate,
      undefined,
      { params: { fieldRepId, date } }
    );
  }

  static async getTodayAppointments(params?: { territory?: string }) {
    const queryParams: Record<string, string> = {};
    if (params?.territory) queryParams.territory = params.territory;
    return ApiPrep.makeRequest<Appointment[]>(
      API_ENDPOINTS.appointments.getToday,
      undefined,
      { queryParams }
    );
  }

  static async updateAppointment(id: string, data: Partial<Appointment>) {
    return ApiPrep.makeRequest<Appointment>(
      API_ENDPOINTS.appointments.update,
      data,
      { params: { id } }
    );
  }

  // ==================== CALL OUTCOMES ====================
  static async recordCallOutcome(
    prospectId: string,
    callerId: string,
    outcome: string,
    notes?: string
  ) {
    return ApiPrep.makeRequest(API_ENDPOINTS.callOutcome.record, {
      prospectId,
      callerId,
      outcome,
      notes,
    });
  }

  // ==================== GEOCODING ====================
  static async geocodeProspects() {
    return ApiPrep.makeRequest<{ geocoded: number; total: number }>(
      API_ENDPOINTS.geocoding.geocodeProspects,
      {}
    );
  }

  static async recalculatePriorities(territory?: string) {
    return ApiPrep.makeRequest<{ updated: number }>(
      API_ENDPOINTS.geocoding.recalculatePriorities,
      { territory }
    );
  }

  // ==================== STAKEHOLDERS ====================
  static async getStakeholdersByProspect(prospectId: string) {
    return ApiPrep.makeRequest<Stakeholder[]>(
      API_ENDPOINTS.stakeholders.getByProspect,
      undefined,
      { params: { prospectId } }
    );
  }

  static async createStakeholder(data: Partial<Stakeholder>) {
    return ApiPrep.makeRequest<Stakeholder>(
      API_ENDPOINTS.stakeholders.create,
      data
    );
  }

  static async getStakeholder(id: string) {
    return ApiPrep.makeRequest<Stakeholder>(
      API_ENDPOINTS.stakeholders.getOne,
      undefined,
      { params: { id } }
    );
  }

  static async updateStakeholder(id: string, data: Partial<Stakeholder>) {
    return ApiPrep.makeRequest<Stakeholder>(
      API_ENDPOINTS.stakeholders.update,
      data,
      { params: { id } }
    );
  }

  static async deleteStakeholder(id: string) {
    return ApiPrep.makeRequest(API_ENDPOINTS.stakeholders.delete, undefined, {
      params: { id },
    });
  }

  // ==================== USERS ====================
  static async getUsers() {
    return ApiPrep.makeRequest<User[]>(API_ENDPOINTS.users.findAll);
  }

  static async createUser(data: Partial<User>) {
    return ApiPrep.makeRequest<User>(API_ENDPOINTS.users.create, data);
  }

  static async getUser(id: string) {
    return ApiPrep.makeRequest<User>(API_ENDPOINTS.users.findOne, undefined, {
      params: { id },
    });
  }

  static async getUserByEmail(email: string) {
    return ApiPrep.makeRequest<User>(
      API_ENDPOINTS.users.findByEmail,
      undefined,
      { params: { email } }
    );
  }

  static async updateUser(id: string, data: Partial<User>) {
    return ApiPrep.makeRequest<User>(API_ENDPOINTS.users.update, data, {
      params: { id },
    });
  }

  static async deleteUser(id: string) {
    return ApiPrep.makeRequest(API_ENDPOINTS.users.delete, undefined, {
      params: { id },
    });
  }

  // ==================== USER TERRITORIES ====================
  static async getUserTerritories(userId: string) {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userTerritories.getUserTerritories,
      undefined,
      { params: { id: userId } }
    );
  }

  static async setUserTerritories(userId: string, territories: string[]) {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userTerritories.setUserTerritories,
      { territories },
      { params: { id: userId } }
    );
  }

  static async getAllTerritories() {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userTerritories.getAllTerritories
    );
  }

  // ==================== USER PROFESSIONS ====================
  static async getUserProfessions(userId: string) {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userProfessions.getUserProfessions,
      undefined,
      { params: { id: userId } }
    );
  }

  static async setUserProfessions(userId: string, professions: string[]) {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userProfessions.setUserProfessions,
      { professions },
      { params: { id: userId } }
    );
  }

  static async getAllProfessions() {
    return ApiPrep.makeRequest<string[]>(
      API_ENDPOINTS.userProfessions.getAllProfessions
    );
  }

  // ==================== USER ASSIGNMENTS ====================
  static async getUserAssignments(userId: string) {
    return ApiPrep.makeRequest<{
      territories: string[];
      professions: string[];
    }>(API_ENDPOINTS.userAssignments.getAssignments, undefined, {
      params: { id: userId },
    });
  }

  static async setUserAssignments(
    userId: string,
    assignments: { territories: string[]; professions: string[] }
  ) {
    return ApiPrep.makeRequest<{
      territories: string[];
      professions: string[];
    }>(API_ENDPOINTS.userAssignments.setAssignments, assignments, {
      params: { id: userId },
    });
  }

  // ==================== SPECIALTY COLORS ====================
  static async getSpecialtyColors() {
    return ApiPrep.makeRequest<SpecialtyColor[]>(
      API_ENDPOINTS.specialtyColors.findAll
    );
  }

  static async getSpecialtyColor(specialty: string) {
    return ApiPrep.makeRequest<SpecialtyColor>(
      API_ENDPOINTS.specialtyColors.findOne,
      undefined,
      { params: { specialty } }
    );
  }

  static async updateSpecialtyColor(
    specialty: string,
    data: Partial<SpecialtyColor>
  ) {
    return ApiPrep.makeRequest<SpecialtyColor>(
      API_ENDPOINTS.specialtyColors.update,
      data,
      { params: { specialty } }
    );
  }

  // ==================== CALL OUTCOMES CONFIG ====================
  static async getCallOutcomes() {
    return ApiPrep.makeRequest<CallOutcome[]>(
      API_ENDPOINTS.callOutcomes.findAll
    );
  }

  static async createCallOutcome(data: Partial<CallOutcome>) {
    return ApiPrep.makeRequest<CallOutcome>(
      API_ENDPOINTS.callOutcomes.create,
      data
    );
  }

  static async updateCallOutcome(id: string, data: Partial<CallOutcome>) {
    return ApiPrep.makeRequest<CallOutcome>(
      API_ENDPOINTS.callOutcomes.update,
      data,
      { params: { id } }
    );
  }

  static async deleteCallOutcome(id: string) {
    return ApiPrep.makeRequest(API_ENDPOINTS.callOutcomes.delete, undefined, {
      params: { id },
    });
  }

  // ==================== CALL HISTORY ====================
  static async getCallHistory(params?: { limit?: number; offset?: number }) {
    const queryParams: Record<string, string> = {};
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    return ApiPrep.makeRequest<CallHistory[]>(
      API_ENDPOINTS.callHistory.findAll,
      undefined,
      { queryParams }
    );
  }

  // ==================== TWILIO ====================
  static async generateTwilioToken(identity: string) {
    return ApiPrep.makeRequest<{ token: string; identity: string }>(
      API_ENDPOINTS.twilio.generateToken,
      { identity }
    );
  }

  static async makeTwilioCall(to: string, prospectId?: string) {
    return ApiPrep.makeRequest<{
      success: boolean;
      callSid: string;
      status: string;
      to: string;
      from: string;
    }>(API_ENDPOINTS.twilio.makeCall, { to, prospectId });
  }

  static async getTwilioConfig() {
    return ApiPrep.makeRequest<{
      configured: boolean;
      phoneNumber: string | null;
    }>(API_ENDPOINTS.twilio.getConfig);
  }

  // ==================== LIVEKIT ====================
  static async getLiveKitConfig() {
    return ApiPrep.makeRequest<{ configured: boolean; url: string }>(
      API_ENDPOINTS.livekit.getConfig
    );
  }

  static async generateLiveKitToken(
    identity: string,
    roomName?: string,
    name?: string
  ) {
    return ApiPrep.makeRequest<{
      token: string;
      identity: string;
      roomName: string;
      url: string;
    }>(API_ENDPOINTS.livekit.generateToken, { identity, roomName, name });
  }

  static async createLiveKitCall(
    callerId: string,
    callerName: string,
    phoneNumber: string,
    prospectId?: string
  ) {
    return ApiPrep.makeRequest<{
      success: boolean;
      roomName: string;
      token: string;
      url: string;
      phoneNumber: string;
    }>(API_ENDPOINTS.livekit.createCall, {
      callerId,
      callerName,
      phoneNumber,
      prospectId,
    });
  }

  static async endLiveKitCall(
    roomName: string,
    prospectId?: string,
    callerId?: string,
    outcome?: string,
    notes?: string,
    duration?: number
  ) {
    return ApiPrep.makeRequest(API_ENDPOINTS.livekit.endCall, {
      roomName,
      prospectId,
      callerId,
      outcome,
      notes,
      duration,
    });
  }

  // ==================== BULK OPERATIONS ====================
  static async bulkSearch(specialty: string, location: string) {
    return ApiPrep.makeRequest<{ results: any[] }>(API_ENDPOINTS.bulk.search, {
      specialty,
      location,
    });
  }

  static async bulkAdd(contacts: any[], territory: string, specialty: string) {
    return ApiPrep.makeRequest<{
      added: number;
      skipped: number;
      details: { added: any[]; skipped: any[] };
    }>(API_ENDPOINTS.bulk.add, { contacts, territory, specialty });
  }

  static async updateProspectAddresses() {
    return ApiPrep.makeRequest<{
      total: number;
      updated: number;
      failed: number;
      errors: string[];
    }>(API_ENDPOINTS.bulk.updateProspectAddresses, {});
  }

  // ==================== ISSUES ====================
  static async getIssues(status?: string) {
    const queryParams: Record<string, string> = {};
    if (status) queryParams.status = status;
    return ApiPrep.makeRequest<any[]>(API_ENDPOINTS.issues.findAll, undefined, {
      queryParams,
    });
  }

  static async getIssue(id: string) {
    return ApiPrep.makeRequest<any>(API_ENDPOINTS.issues.findOne, undefined, {
      params: { id },
    });
  }

  static async createIssue(data: Partial<any>) {
    return ApiPrep.makeRequest<any>(API_ENDPOINTS.issues.create, data);
  }

  static async updateIssue(id: string, data: Partial<any>) {
    return ApiPrep.makeRequest<any>(API_ENDPOINTS.issues.update, data, {
      params: { id },
    });
  }

  static async deleteIssue(id: string) {
    return ApiPrep.makeRequest(API_ENDPOINTS.issues.delete, undefined, {
      params: { id },
    });
  }

  // ==================== LINEAR ====================
  static async getLinearTeams() {
    return ApiPrep.makeRequest<any[]>(API_ENDPOINTS.linear.getTeams);
  }

  static async getLinearIssues(teamId?: string) {
    const queryParams: Record<string, string> = {};
    if (teamId) queryParams.teamId = teamId;
    return ApiPrep.makeRequest<any[]>(
      API_ENDPOINTS.linear.getIssues,
      undefined,
      { queryParams }
    );
  }
}
