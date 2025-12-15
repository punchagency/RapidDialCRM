import http from "./http";

export interface TwilioTokenResponse {
  token: string;
  identity: string;
  phoneNumber?: string;
}

export interface LogCallParams {
  prospectId: string;
  callerId: string;
  callSid?: string;
  phoneNumber: string;
  duration: number;
  outcome?: string;
}

export interface CallDetails {
  sid: string;
  status: string;
  duration: number;
  from: string;
  to: string;
  startTime: string;
  endTime: string;
}

export interface TwilioConfig {
  configured: boolean;
  voiceConfigured: boolean;
  phoneNumber: string | null;
  twimlAppConfigured: boolean;
}

/**
 * Get Twilio access token for making calls
 */
export const getTwilioToken = async (
  identity: string
): Promise<TwilioTokenResponse> => {
  const response = await http.post<TwilioTokenResponse>("twilio/token", {
    identity,
  });
  return response.data;
};

/**
 * Log call details to backend
 */
export const logTwilioCall = async (params: LogCallParams): Promise<void> => {
  await http.post("twilio/call/log", params);
};

/**
 * Get call details from Twilio
 */
export const getTwilioCallDetails = async (
  callSid: string
): Promise<CallDetails> => {
  const response = await http.get<CallDetails>(`twilio/call/${callSid}`);
  return response.data;
};

/**
 * Get Twilio configuration status
 */
export const getTwilioConfig = async (): Promise<TwilioConfig> => {
  const response = await http.get<TwilioConfig>("twilio/config");
  return response.data;
};
