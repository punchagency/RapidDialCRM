import { CustomServerClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type { Prospect, User, FieldRep, Appointment, Stakeholder, SpecialtyColor, CallOutcome } from '@/lib/types';

interface EndpointParserProps {
 raw_endpoint?: string;
 params?: Record<string, string>;
 queryParams?: Record<string, string>;
}

class EndpointHelper {
 static parser({ raw_endpoint, params = {}, queryParams = {} }: EndpointParserProps) {
    if (!raw_endpoint) throw new Error('Endpoint is required');
  let [method, endpoint] = raw_endpoint.split(" ");

  let endpointWithValue = endpoint
  Object.entries(params).forEach(([k, v]) => {
   endpointWithValue = endpointWithValue.replace(`:${k}`, v)
  });

  let queries = ""
  Object.entries(queryParams).forEach(([k, v], i) => {
   if (i === 0) {
    queries += `?${k}=${v}`
   } else {
    queries += `&${k}=${v}`
   }
  });

  return {
   endpoint: endpointWithValue + queries,
   method
  }
 }
}

interface ApiResponse<T = any> {
  has_error: boolean;
  message: string;
  data?: T;
  [key: string]: any;
}

export class CustomServerApi {
 // Get authorization token from localStorage
 private static getAuthToken(): string | null {
  try {
   const authData = localStorage.getItem('auth.user');
   if (authData) {
    const parsedData = JSON.parse(authData);
    return parsedData.access_token || null;
   }
  } catch (error) {
   console.error('Error getting auth token:', error);
  }
  return null;
 }

 // Refresh token when it expires
 private static async refreshAuthToken(): Promise<string | null> {
  try {
   const authData = localStorage.getItem('auth.user');
   if (!authData) return null;

   const parsedData = JSON.parse(authData);
   const refreshToken = parsedData.refresh_token;

   if (!refreshToken) return null;

      // Note: Auth endpoints not yet implemented in backend
      // When auth is implemented, uncomment this:
      // const { data, error } = await this.makeRequest(API_ENDPOINTS.auth.refresh, { refresh_token: refreshToken });
      // if (error || !data) return null;
      // const updatedAuthData = { ...parsedData, access_token: data.access_token, refresh_token: data.refresh_token || refreshToken };
      // localStorage.setItem('auth.user', JSON.stringify(updatedAuthData));
      // return data.access_token;
      
      // For now, return null as auth is not implemented
      return null;
  } catch (error) {
   localStorage.removeItem('auth.user');
   console.error('Error refreshing token:', error);
   return null;
  }
 }

 // Generic method for making API calls
  private static async makeRequest<T = any>(
  endpoint: string,
  data?: any,
  config?: Partial<EndpointParserProps>
  ): Promise<{ data: T | null; error: string | null; loading: boolean }> {
  const { endpoint: parsedEndpoint, method } = EndpointHelper.parser({
   raw_endpoint: endpoint,
   params: config?.params,
   queryParams: config?.queryParams,
  });

  const url = import.meta.env.VITE_CUSTOM_SERVER_URL + parsedEndpoint;
  let token = this.getAuthToken();

  let response = {
      data: null as T | null,
      error: null as string | null,
   loading: false
  };

  // First attempt with current token
  await CustomServerClient.http({
      onSuccess: (data: ApiResponse<T>) => {
        // Handle backend response format: { has_error, message, data }
        if (data && typeof data === 'object' && 'has_error' in data) {
          if (data.has_error) {
            response.error = data.message || 'An error occurred';
          } else {
            response.data = data.data !== undefined ? data.data : data as T;
          }
        } else {
          response.data = data as T;
        }
      },
      onError: async (error: string) => {
    // If we get a 401 and have a refresh token, try to refresh
    if (error?.includes('401') || error?.includes('Unauthorized')) {
     const newToken = await this.refreshAuthToken();
     if (newToken) {
      // Retry the request with the new token
      await CustomServerClient.http({
              onSuccess: (data: ApiResponse<T>) => {
                if (data && typeof data === 'object' && 'has_error' in data) {
                  if (data.has_error) {
                    response.error = data.message || 'An error occurred';
                  } else {
                    response.data = data.data !== undefined ? data.data : data as T;
                  }
                } else {
                  response.data = data as T;
                }
              },
              onError: (retryError: string) => {
        response.error = retryError;
       },
              onLoading: (loading: boolean) => {
        response.loading = loading;
       },
       url,
       method,
       data,
       token: newToken
      });
      return;
     }
    }
    response.error = error;
   },
      onLoading: (loading: boolean) => {
        response.loading = loading;
      },
   url,
   method,
   data,
   token: token || undefined
  });

  return response;
 }

  // ==================== PROSPECTS ====================
  static async getProspects(params?: { territory?: string; limit?: number; offset?: number }) {
    const queryParams: Record<string, string> = {};
    if (params?.territory) queryParams.territory = params.territory;
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.offset) queryParams.offset = params.offset.toString();

    return this.makeRequest<Prospect[]>(API_ENDPOINTS.prospects.findAll, undefined, { queryParams });
  }

  static async getProspect(id: string) {
    return this.makeRequest<Prospect>(API_ENDPOINTS.prospects.findOne, undefined, { params: { id } });
  }

  static async createProspect(data: Partial<Prospect>) {
    return this.makeRequest<Prospect>(API_ENDPOINTS.prospects.create, data);
  }

  static async updateProspect(id: string, data: Partial<Prospect>) {
    return this.makeRequest<Prospect>(API_ENDPOINTS.prospects.update, data, { params: { id } });
  }

  static async deleteProspect(id: string) {
    return this.makeRequest(API_ENDPOINTS.prospects.delete, undefined, { params: { id } });
  }

  static async getProspectsByTerritory(territory: string) {
    return this.makeRequest<Prospect[]>(API_ENDPOINTS.prospects.findByTerritory, undefined, { params: { territory } });
  }

  // ==================== CALLING LIST ====================
  static async getCallingList(fieldRepId: string) {
    return this.makeRequest<{ fieldRepId: string; territory: string; count: number; prospects: Prospect[] }>(
      API_ENDPOINTS.callingList.getByFieldRep,
      undefined,
      { params: { fieldRepId } }
    );
  }

  // ==================== FIELD REPS ====================
  static async getFieldReps() {
    return this.makeRequest<FieldRep[]>(API_ENDPOINTS.fieldReps.findAll);
  }

  static async createFieldRep(data: Partial<FieldRep>) {
    return this.makeRequest<FieldRep>(API_ENDPOINTS.fieldReps.create, data);
  }

  static async updateFieldRep(id: string, data: Partial<FieldRep>) {
    return this.makeRequest<FieldRep>(API_ENDPOINTS.fieldReps.update, data, { params: { id } });
  }

  // ==================== APPOINTMENTS ====================
  static async createAppointment(data: Partial<Appointment>) {
    return this.makeRequest<Appointment>(API_ENDPOINTS.appointments.create, data);
  }

  static async getAppointmentsByFieldRepAndDate(fieldRepId: string, date: string) {
    return this.makeRequest<Appointment[]>(
      API_ENDPOINTS.appointments.getByFieldRepAndDate,
      undefined,
      { params: { fieldRepId, date } }
    );
  }

  static async getTodayAppointments(params?: { territory?: string }) {
    const queryParams: Record<string, string> = {};
    if (params?.territory) queryParams.territory = params.territory;
    return this.makeRequest<Appointment[]>(API_ENDPOINTS.appointments.getToday, undefined, { queryParams });
  }

  static async updateAppointment(id: string, data: Partial<Appointment>) {
    return this.makeRequest<Appointment>(API_ENDPOINTS.appointments.update, data, { params: { id } });
  }

  // ==================== CALL OUTCOMES ====================
  static async recordCallOutcome(prospectId: string, callerId: string, outcome: string, notes?: string) {
    return this.makeRequest(API_ENDPOINTS.callOutcome.record, { prospectId, callerId, outcome, notes });
  }

  // ==================== GEOCODING ====================
  static async geocodeProspects() {
    return this.makeRequest<{ geocoded: number; total: number }>(API_ENDPOINTS.geocoding.geocodeProspects, {});
  }

  static async recalculatePriorities(territory?: string) {
    return this.makeRequest<{ updated: number }>(API_ENDPOINTS.geocoding.recalculatePriorities, { territory });
  }

  // ==================== STAKEHOLDERS ====================
  static async getStakeholdersByProspect(prospectId: string) {
    return this.makeRequest<Stakeholder[]>(
      API_ENDPOINTS.stakeholders.getByProspect,
      undefined,
      { params: { prospectId } }
    );
  }

  static async createStakeholder(data: Partial<Stakeholder>) {
    return this.makeRequest<Stakeholder>(API_ENDPOINTS.stakeholders.create, data);
  }

  static async getStakeholder(id: string) {
    return this.makeRequest<Stakeholder>(API_ENDPOINTS.stakeholders.getOne, undefined, { params: { id } });
  }

  static async updateStakeholder(id: string, data: Partial<Stakeholder>) {
    return this.makeRequest<Stakeholder>(API_ENDPOINTS.stakeholders.update, data, { params: { id } });
  }

  static async deleteStakeholder(id: string) {
    return this.makeRequest(API_ENDPOINTS.stakeholders.delete, undefined, { params: { id } });
  }

  // ==================== USERS ====================
  static async getUsers() {
    return this.makeRequest<User[]>(API_ENDPOINTS.users.findAll);
  }

  static async createUser(data: Partial<User>) {
    return this.makeRequest<User>(API_ENDPOINTS.users.create, data);
  }

  static async getUser(id: string) {
    return this.makeRequest<User>(API_ENDPOINTS.users.findOne, undefined, { params: { id } });
  }

  static async getUserByEmail(email: string) {
    return this.makeRequest<User>(API_ENDPOINTS.users.findByEmail, undefined, { params: { email } });
  }

  static async updateUser(id: string, data: Partial<User>) {
    return this.makeRequest<User>(API_ENDPOINTS.users.update, data, { params: { id } });
  }

  static async deleteUser(id: string) {
    return this.makeRequest(API_ENDPOINTS.users.delete, undefined, { params: { id } });
  }

  // ==================== USER TERRITORIES ====================
  static async getUserTerritories(userId: string) {
    return this.makeRequest<string[]>(API_ENDPOINTS.userTerritories.getUserTerritories, undefined, { params: { id: userId } });
  }

  static async setUserTerritories(userId: string, territories: string[]) {
    return this.makeRequest<string[]>(
      API_ENDPOINTS.userTerritories.setUserTerritories,
      { territories },
      { params: { id: userId } }
    );
  }

  static async getAllTerritories() {
    return this.makeRequest<string[]>(API_ENDPOINTS.userTerritories.getAllTerritories);
  }

  // ==================== USER PROFESSIONS ====================
  static async getUserProfessions(userId: string) {
    return this.makeRequest<string[]>(API_ENDPOINTS.userProfessions.getUserProfessions, undefined, { params: { id: userId } });
  }

  static async setUserProfessions(userId: string, professions: string[]) {
    return this.makeRequest<string[]>(
      API_ENDPOINTS.userProfessions.setUserProfessions,
      { professions },
      { params: { id: userId } }
    );
  }

  static async getAllProfessions() {
    return this.makeRequest<string[]>(API_ENDPOINTS.userProfessions.getAllProfessions);
  }

  // ==================== USER ASSIGNMENTS ====================
  static async getUserAssignments(userId: string) {
    return this.makeRequest<{ territories: string[]; professions: string[] }>(
      API_ENDPOINTS.userAssignments.getAssignments,
      undefined,
      { params: { id: userId } }
    );
  }

  static async setUserAssignments(userId: string, assignments: { territories: string[]; professions: string[] }) {
    return this.makeRequest<{ territories: string[]; professions: string[] }>(
      API_ENDPOINTS.userAssignments.setAssignments,
      assignments,
      { params: { id: userId } }
    );
  }

  // ==================== SPECIALTY COLORS ====================
  static async getSpecialtyColors() {
    return this.makeRequest<SpecialtyColor[]>(API_ENDPOINTS.specialtyColors.findAll);
  }

  static async getSpecialtyColor(specialty: string) {
    return this.makeRequest<SpecialtyColor>(API_ENDPOINTS.specialtyColors.findOne, undefined, { params: { specialty } });
  }

  static async updateSpecialtyColor(specialty: string, data: Partial<SpecialtyColor>) {
    return this.makeRequest<SpecialtyColor>(API_ENDPOINTS.specialtyColors.update, data, { params: { specialty } });
  }

  // ==================== CALL OUTCOMES CONFIG ====================
  static async getCallOutcomes() {
    return this.makeRequest<CallOutcome[]>(API_ENDPOINTS.callOutcomes.findAll);
  }

  static async createCallOutcome(data: Partial<CallOutcome>) {
    return this.makeRequest<CallOutcome>(API_ENDPOINTS.callOutcomes.create, data);
  }

  static async updateCallOutcome(id: string, data: Partial<CallOutcome>) {
    return this.makeRequest<CallOutcome>(API_ENDPOINTS.callOutcomes.update, data, { params: { id } });
  }

  static async deleteCallOutcome(id: string) {
    return this.makeRequest(API_ENDPOINTS.callOutcomes.delete, undefined, { params: { id } });
  }

  // ==================== TWILIO ====================
  static async generateTwilioToken(identity: string) {
    return this.makeRequest<{ token: string; identity: string }>(API_ENDPOINTS.twilio.generateToken, { identity });
  }

  static async makeTwilioCall(to: string, prospectId?: string) {
    return this.makeRequest<{ success: boolean; callSid: string; status: string; to: string; from: string }>(
      API_ENDPOINTS.twilio.makeCall,
      { to, prospectId }
    );
  }

  static async getTwilioConfig() {
    return this.makeRequest<{ configured: boolean; phoneNumber: string | null }>(API_ENDPOINTS.twilio.getConfig);
  }

  // ==================== LIVEKIT ====================
  static async getLiveKitConfig() {
    return this.makeRequest<{ configured: boolean; url: string }>(API_ENDPOINTS.livekit.getConfig);
  }

  static async generateLiveKitToken(identity: string, roomName?: string, name?: string) {
    return this.makeRequest<{ token: string; identity: string; roomName: string; url: string }>(
      API_ENDPOINTS.livekit.generateToken,
      { identity, roomName, name }
    );
  }

  static async createLiveKitCall(callerId: string, callerName: string, phoneNumber: string, prospectId?: string) {
    return this.makeRequest<{ success: boolean; roomName: string; token: string; url: string; phoneNumber: string }>(
      API_ENDPOINTS.livekit.createCall,
      { callerId, callerName, phoneNumber, prospectId }
    );
  }

  static async endLiveKitCall(roomName: string, prospectId?: string, callerId?: string, outcome?: string, notes?: string, duration?: number) {
    return this.makeRequest(API_ENDPOINTS.livekit.endCall, { roomName, prospectId, callerId, outcome, notes, duration });
  }

  // ==================== BULK OPERATIONS ====================
  static async bulkSearch(specialty: string, location: string) {
    return this.makeRequest<{ results: any[] }>(API_ENDPOINTS.bulk.search, { specialty, location });
  }

  static async bulkAdd(contacts: any[], territory: string, specialty: string) {
    return this.makeRequest<{ added: number; skipped: number; details: { added: any[]; skipped: any[] } }>(
      API_ENDPOINTS.bulk.add,
      { contacts, territory, specialty }
    );
  }

  static async updateProspectAddresses() {
    return this.makeRequest<{ total: number; updated: number; failed: number; errors: string[] }>(
      API_ENDPOINTS.bulk.updateProspectAddresses,
      {}
    );
  }

  // ==================== ISSUES ====================
  static async getIssues(status?: string) {
    const queryParams: Record<string, string> = {};
    if (status) queryParams.status = status;
    return this.makeRequest<any[]>(API_ENDPOINTS.issues.findAll, undefined, { queryParams });
  }

  static async getIssue(id: string) {
    return this.makeRequest<any>(API_ENDPOINTS.issues.findOne, undefined, { params: { id } });
  }

  static async createIssue(data: Partial<any>) {
    return this.makeRequest<any>(API_ENDPOINTS.issues.create, data);
  }

  static async updateIssue(id: string, data: Partial<any>) {
    return this.makeRequest<any>(API_ENDPOINTS.issues.update, data, { params: { id } });
  }

  static async deleteIssue(id: string) {
    return this.makeRequest(API_ENDPOINTS.issues.delete, undefined, { params: { id } });
  }

  // ==================== LINEAR ====================
  static async getLinearTeams() {
    return this.makeRequest<any[]>(API_ENDPOINTS.linear.getTeams);
  }

  static async getLinearIssues(teamId?: string) {
    const queryParams: Record<string, string> = {};
    if (teamId) queryParams.teamId = teamId;
    return this.makeRequest<any[]>(API_ENDPOINTS.linear.getIssues, undefined, { queryParams });
  }
}
