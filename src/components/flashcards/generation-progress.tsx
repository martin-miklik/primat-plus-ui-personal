"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Typography } from "@/components/ui/Typography";

interface GenerationProgressProps {
  count?: number;
}

export function GenerationProgress({ count }: GenerationProgressProps) {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>

        <div className="text-center space-y-2">
          <Typography variant="h3">Generuji kartičky...</Typography>
          <p className="text-muted-foreground">
            {count
              ? `Vytvářím ${count} ${
                  count === 1
                    ? "kartičku"
                    : count < 5
                    ? "kartičky"
                    : "kartiček"
                }...`
              : "Prosím čekejte..."}
          </p>
        </div>

        <div className="flex space-x-2">
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
}









