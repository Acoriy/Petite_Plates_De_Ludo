import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { incrementLikes } from "@/lib/recipes";

export function LikeButton({ slug, initial, size = "md" }: { slug: string; initial: number; size?: "sm" | "md" | "lg" }) {
  const storageKey = `liked:${slug}`;
  const [count, setCount] = useState(initial);
  const [liked, setLiked] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(storageKey)) setLiked(true);
  }, [storageKey]);

  const onLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setCount(c => c + 1);
    setPulsing(true);
    localStorage.setItem(storageKey, "1");
    // confetti at click point
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 80,
      spread: 80,
      startVelocity: 40,
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      colors: ["#C54226", "#315264", "#5B6B43", "#F4EAD4", "#2B1B13"],
      shapes: ["circle", "square"],
      scalar: size === "lg" ? 1.2 : 0.9,
    });
    setTimeout(() => setPulsing(false), 600);
    try { await incrementLikes(slug); } catch { /* silent */ }
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };
  const iconSize = { sm: 14, md: 16, lg: 20 }[size];

  return (
    <motion.button
      onClick={onLike}
      whileTap={{ scale: 0.9 }}
      animate={pulsing ? { scale: [1, 1.25, 1] } : {}}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      aria-pressed={liked}
      aria-label={liked ? "Vous avez aimé" : "J'aime cette recette"}
      className={`inline-flex items-center rounded-full font-semibold transition-colors ${sizes[size]} ${liked ? "bg-primary text-primary-foreground shadow-[var(--shadow-warm)]" : "bg-card text-foreground border-2 border-border hover:border-primary hover:text-primary"}`}
    >
      <Heart size={iconSize} className={liked ? "fill-current" : ""} />
      <span>{count.toLocaleString("fr-FR")}</span>
    </motion.button>
  );
}