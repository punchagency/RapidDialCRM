import { motion, AnimatePresence } from "framer-motion";
import { DialerCard } from "@/components/crm/DialerCard";
import type { Prospect } from "@/lib/types";

interface ProspectNavigationProps {
  prospect: Prospect;
  isTransitioning: boolean;
  onComplete: (status: string, notes: string) => void;
  canEdit: boolean;
  onEditClick: () => void;
}

export function ProspectNavigation({
  prospect,
  isTransitioning,
  onComplete,
  canEdit,
  onEditClick,
}: ProspectNavigationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={prospect.id}
        initial={{ opacity: 0, x: isTransitioning ? 100 : -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isTransitioning ? -100 : 100 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-stretch p-6"
      >
        <div className="w-full h-full">
          <DialerCard
            prospect={prospect}
            onComplete={onComplete}
            canEdit={canEdit}
            onEditClick={onEditClick}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
