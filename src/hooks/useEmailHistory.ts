import { useState, useCallback, useEffect } from "react";
import { EmailLog } from "@/lib/types";
import { CustomServerApi } from "@/integrations/custom-server/api";

interface UseEmailHistoryProps {
  limit?: number;
  offset?: number;
  search?: string;
}

export function useEmailHistory({
  limit = 20,
  offset = 0,
  search = "",
}: UseEmailHistoryProps) {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data,
        error: apiError,
        total: count,
      } = await CustomServerApi.getAllEmails({
        limit,
        offset,
        search,
      });

      if (apiError) throw new Error(apiError);

      if (data) {
        setEmails(data.logs || []);
        setTotal(count || 0);

        // Auto-select first email if none selected and emails exist
        if (!activeEmailId && data.logs?.length > 0) {
          setActiveEmailId(data.logs[0].id);
        } else if (data.logs?.length === 0) {
          setActiveEmailId(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch emails");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, search, activeEmailId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const selectedEmail = emails.find((e) => e.id === activeEmailId) || null;

  return {
    emails,
    total,
    loading,
    error,
    activeEmailId,
    setActiveEmailId,
    selectedEmail,
    refetch: fetchEmails,
  };
}
