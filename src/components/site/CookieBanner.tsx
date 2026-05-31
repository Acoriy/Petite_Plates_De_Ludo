import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { Link } from "@tanstack/react-router";

const KEY = "cookie-consent-v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const set = (v: "accepted" | "rejected") => {
    localStorage.setItem(KEY, v);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="fixed bottom-4 left-1/2 z-40 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-deep)]"
          role="dialog"
          aria-label="Préférences cookies"
        >
          <div className="flex gap-4">
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-secondary text-primary"><Cookie className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed text-foreground">
                On utilise des petits cookies (les numériques, pas ceux à la pépite) pour mesurer l'audience et améliorer le site. Vous décidez !
                <Link to="/confidentialite" className="ml-1 text-primary hover:underline">En savoir plus</Link>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => set("rejected")} className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold hover:bg-secondary/70">Refuser</button>
                <button onClick={() => set("accepted")} className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:scale-105 transition-transform">Tout accepter</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}