import { useState, useEffect } from "react";
import type { Prospect } from "@/lib/types";
import { useProspects, useProspect } from "@/hooks/useProspects";
import { useAuth } from '@/lib/AuthContext';

interface UseDialerStateParams {
  prospectId?: string | null;
}

export function useDialerState({ prospectId }: UseDialerStateParams = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user } = useAuth();

  // Fetch prospects
  const { data: prospects = [], isLoading } = useProspects({
    limit: 100,
    offset: 0,
    called: true,
    userId: user?.id,
    role: user?.role,
  });

  // Set initial index when prospectId is provided
  useEffect(() => {
    if (prospectId && prospects.length > 0) {
      const idx = prospects.findIndex((c) => c.id === prospectId);
      if (idx >= 0) setCurrentIndex(idx);
    }
  }, [prospectId, prospects]);

  const currentProspect = prospects[currentIndex];

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentIndex < prospects.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
      setIsTransitioning(false);
    }, 800);
  };

  const setIndex = (index: number) => {
    if (index >= 0 && index < prospects.length) {
      setCurrentIndex(index);
    }
  };

  return {
    currentIndex,
    isTransitioning,
    prospects,
    loading: isLoading,
    currentProspect,
    goToNext,
    setIndex,
    setIsTransitioning,
  };
}
