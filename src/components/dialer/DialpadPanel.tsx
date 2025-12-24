import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DialpadPanelProps {
  show: boolean;
  isInCall: boolean;
  onDigitPress: (digit: string) => void;
}

const dialpadButtons = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export function DialpadPanel({
  show,
  isInCall,
  onDigitPress,
}: DialpadPanelProps) {
  if (!show || !isInCall) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-4"
    >
      <div className="grid grid-cols-3 gap-2 p-3 bg-muted/30 rounded-lg">
        {dialpadButtons.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((digit) => (
              <Button
                key={digit}
                variant="outline"
                className="h-12 text-xl font-semibold"
                onClick={() => onDigitPress(digit)}
                data-testid={`dialpad-${digit}`}
              >
                {digit}
              </Button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
