import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FUNNY_LOADING_TEXTS } from "@/lib/mock-recipes";

/**
 * Loader humoristique : alterne les phrases drôles de Ludo
 * avec une petite animation de spatule qui s'agite.
 */
export function FunnyLoader({ className = "" }: { className?: string }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * FUNNY_LOADING_TEXTS.length));

  useEffect(() => {
    const t = setInterval(() => {
      setI((p) => (p + 1) % FUNNY_LOADING_TEXTS.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center gap-5 py-16 text-center ${className}`}>
      <motion.div
        animate={{ rotate: [-15, 15, -15], y: [0, -6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
        aria-hidden
      >
        🥄
      </motion.div>
      <div className="h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="font-hand text-2xl text-[var(--caramel)] md:text-3xl"
          >
            {FUNNY_LOADING_TEXTS[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Skeleton "carte recette" assortie au design grimoire. */
export function RecipeCardSkeleton() {
  return (
    <div className="card-grimoire overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--muted)]">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, transparent 30%, oklch(1 0 0 / 0.35) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="space-y-2 p-5">
        <div className="h-5 w-3/4 rounded bg-[var(--muted)]" />
        <div className="h-3 w-full rounded bg-[var(--muted)]" />
        <div className="h-3 w-2/3 rounded bg-[var(--muted)]" />
      </div>
    </div>
  );
}
