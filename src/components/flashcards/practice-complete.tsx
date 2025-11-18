"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/Typography";

interface PracticeCompleteProps {
  cardsCompleted: number;
  onReturn: () => void;
}

export function PracticeComplete({
  cardsCompleted,
  onReturn,
}: PracticeCompleteProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <CheckCircle2 className="h-24 w-24 text-green-500" />
      </motion.div>

      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Typography variant="h1">Skvělá práce!</Typography>
        <p className="text-muted-foreground text-lg">
          Dokončili jste procvičování {cardsCompleted}{" "}
          {cardsCompleted === 1
            ? "kartičky"
            : cardsCompleted < 5
            ? "kartiček"
            : "kartiček"}
          .
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button onClick={onReturn} size="lg">
          Zpět na přehled
        </Button>
      </motion.div>
    </div>
  );
}






