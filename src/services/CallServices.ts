import https from "@/services/http";

interface CallOutcomeData {
  prospectId: string;
  callerId: string;
  outcome: string;
  notes?: string;
}

export const recordCallOutcome = (
  prospectId: string,
  outcome: string,
  notes?: string
) => {
  const data: CallOutcomeData = {
    prospectId,
    callerId: "current-user",
    outcome,
    notes,
  };
  return https.post<void>("/call-outcome", data);
};
