import { useState, useEffect } from "react";
import { CustomServerApi } from "@/integrations/custom-server/api";
import type { CallHistory } from "@/lib/types";

interface UseCallHistoryParams {
  limit?: number;
  offset?: number;
}

export function useCallHistory(params?: UseCallHistoryParams) {
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  // Fetch call history on mount or when params change
  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoading(true);
        const response = await CustomServerApi.getCallHistory(params);
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setCallHistory(response.data);
          // Set the first call as active
          if (response.data.length > 0) {
            setActiveCallId(response.data[0].id);
          }
        }
      } catch (err) {
        setError("Failed to fetch call history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, [params?.limit, params?.offset]);

  const selectedCall = callHistory.find((c) => c.id === activeCallId);

  return {
    callHistory,
    loading,
    error,
    selectedCall,
    activeCallId,
    setActiveCallId,
  };
}
