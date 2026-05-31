import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Clock, Eye, Heart, ChevronLeft, ChevronRight, Flame, Sparkles, ArrowRight } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { funnyBadge } from "@/lib/mock-recipes";

/**
 * Hero "carrousel immersif géant" — plein écran, ultra-moderne.
 * - Slides plein-écran avec photo en fond + titres percutants
 * - Compteurs vues 👀 et likes 🔥 animés en temps réel
 * - Transitions spring physics rebondissantes
 * - Auto-play + drag + pagination
 */
type FunHeadline = { kicker: string; titleA: string; titleB: string; punch: string };

// Titres "drôles" sur-mesure mappés par slug
const HEADLINES: Record<string, FunHeadline> = {
  "gratin-dauphinois-revisite": {
    kicker: "Au menu ce dimanche",
    titleA: "Le Gratin Dauphinois",
    titleB: "qui réconcilie les familles.",
    punch: "Crémeux, doré, sans débat possible.",
  },
  "tarte-tatin-ultra-gourmande": {
    kicker: "Dessert culte",
    titleA: "La Tarte Tatin",
    titleB: "plus coulante que tes larmes.",
    punch: "Pommes, caramel, et un soupçon de drama.",
  },
  "cordon-bleu-maison-xxl": {
    kicker: "Plat signature",
    titleA: "Le Cordon Bleu XXL",
    titleB: "où le fromage coule aux genoux.",
    punch: "L'industriel n'a qu'à bien se tenir.",
  },
  "fondant-au-chocolat-magique": {
    kicker: "Magie noire",
    titleA: "Le Fondant Magique",
    titleB: "à la seconde près, sinon rien.",
    punch: "11 minutes, pas une de plus.",
  },
  "blanquette-de-veau-familiale": {
    kicker: "Le classique",
    titleA: "La Blanquette",
    titleB: "à ma façon (avec beaucoup de crème).",
    punch: "Le dimanche, dans une cocotte.",
  },
  "mousse-au-chocolat-signature": {
    kicker: "Arme de séduction",
    titleA: "La Mousse au Chocolat",
    titleB: "qui fait tomber les défenses.",
    punch: "Trois ingrédients, zéro compromis.",
  },
};

function headlineFor(r: Recipe): FunHeadline {
  return (
    HEADLINES[r.slug] ?? {
      kicker: "À la une",
      titleA: r.title,
      titleB: "",
      punch: r.description,
    }
  );
}

export function FullHero({ recipes }: { recipes: Recipe[] }) {
  const reduce = useReducedMotion();
  const slides = useMemo(() => recipes.filter((r) => r.cover_image).slice(0, 8), [recipes]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState<Record<string, { views: number; likes: number; liked: boolean }>>({});

  useEffect(() => {
    setStats((prev) => {
      const next = { ...prev };
      slides.forEach((s) => {
        if (!next[s.id]) next[s.id] = { views: s.views, likes: s.likes, liked: false };
      });
      return next;
    });
  }, [slides]);

  useEffect(() => {
    if (slides.length < 2 || paused || reduce) return;
    const t = setInterval(() => {
      setDir(1);
      setI((p) => (p + 1) % slides.length);
    }, 6500);
    return () => clearInterval(t);
  }, [slides.length, paused, reduce]);

  // Incrément doux des "vues" pour l'effet live
  useEffect(() => {
    const id = slides[i]?.id;
    if (!id) return;
    const t = setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? { views: 0, likes: 0, liked: false }), views: (prev[id]?.views ?? 0) + 1 },
      }));
    }, 900);
    return () => clearTimeout(t);
  }, [i, slides]);

  if (!slides.length) {
    return (
      <section className="grid min-h-[80svh] place-items-center bg-[var(--cream)] text-7xl">🍳</section>
    );
  }

  const go = (n: number) => {
    setDir(n > i ? 1 : -1);
    setI((n + slides.length) % slides.length);
  };
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  const current = slides[i];
  const live = stats[current.id] ?? { views: current.views, likes: current.likes, liked: false };
  const h = headlineFor(current);
  const badge = funnyBadge(current.slug);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStats((prev) => {
      const cur = prev[current.id] ?? { views: current.views, likes: current.likes, liked: false };
      return {
        ...prev,
        [current.id]: { ...cur, liked: !cur.liked, likes: cur.liked ? cur.likes - 1 : cur.likes + 1 },
      };
    });
  };

  return (
    <section
      className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--espresso)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Carrousel des recettes vedettes"
    >
      {/* Stack d'images plein-écran */}
      <AnimatePresence initial={false} custom={dir} mode="popLayout">
        <motion.div
          key={current.id}
          custom={dir}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -90 || info.velocity.x < -450) next();
            else if (info.offset.x > 90 || info.velocity.x > 450) prev();
          }}
          initial={{ opacity: 0, scale: 1.04, x: dir * 80 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.98, x: dir * -80 }}
          transition={{ type: "spring", stiffness: 110, damping: 22, mass: 1 }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <img
            src={current.cover_image ?? ""}
            alt={current.title}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover animate-ken-burns"
          />
          {/* Voile dégradé pour lisibilité */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/95 via-[var(--espresso)]/45 to-[var(--espresso)]/55" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--espresso)]/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Bandeau top */}
      <div className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 pt-28 text-[var(--cream)] md:px-10 md:pt-32">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[var(--cream)]/85">
          <Sparkles className="h-3 w-3 text-[var(--caramel)]" /> Les petits plats de Ludo · Édition {new Date().getFullYear()}
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.35em] text-[var(--cream)]/70 md:block">
          Recette {String(i + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </div>

      {/* Contenu central */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-120px)] max-w-[1400px] flex-col justify-end gap-8 px-6 pb-32 text-[var(--cream)] md:px-10 md:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            className="max-w-4xl"
          >
            <span className={`sticker ${badge.tone === "tomato" ? "sticker--tomato" : badge.tone === "slate" ? "sticker--slate" : "sticker--sage"} mb-6`}>
              <Flame className="h-3 w-3" /> {badge.label}
            </span>

            <p className="font-hand text-3xl text-[var(--caramel)] md:text-4xl">{h.kicker}</p>
            <h1 className="mt-2 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem]">
              {h.titleA}
              {h.titleB && (
                <>
                  <br />
                  <span className="italic text-[var(--caramel)]">{h.titleB}</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--cream)]/85 md:text-lg">{h.punch}</p>

            {/* Compteurs animés */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.div
                key={`v-${live.views}`}
                initial={{ scale: 0.92, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--cream)]/30 bg-[var(--espresso)]/60 px-4 py-2 text-sm font-semibold backdrop-blur"
              >
                <Eye className="h-4 w-4 text-[var(--sage)]" />
                <span>👀 {live.views.toLocaleString("fr-FR")} vues</span>
              </motion.div>
              <motion.button
                onClick={toggleLike}
                whileTap={{ scale: 0.9 }}
                animate={live.liked ? { scale: [1, 1.18, 1], rotate: [0, -4, 4, 0] } : {}}
                transition={{ duration: 0.5 }}
                className={`inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors btn-squish ${
                  live.liked
                    ? "border-[var(--caramel)] bg-[var(--caramel)] text-[var(--cream)]"
                    : "border-[var(--cream)]/30 bg-[var(--espresso)]/60 text-[var(--cream)] hover:border-[var(--caramel)]"
                }`}
                aria-pressed={live.liked}
              >
                <Heart className={`h-4 w-4 ${live.liked ? "fill-current" : ""}`} />
                <motion.span key={`l-${live.likes}`} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  🔥 {live.likes.toLocaleString("fr-FR")} likes
                </motion.span>
              </motion.button>
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--cream)]/30 bg-[var(--espresso)]/60 px-4 py-2 text-sm font-semibold backdrop-blur">
                <Clock className="h-4 w-4 text-[var(--caramel)]" />
                ⏱ {current.prep_time + current.cook_time} min
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to={`/recette/${current.id}`}
                className="btn-squish group inline-flex items-center gap-3 rounded-full bg-[var(--caramel)] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[var(--cream)] shadow-[6px_6px_0_0_var(--espresso)]"
              >
                Je veux la recette <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/carnet-de-recettes"
                className="btn-squish inline-flex items-center gap-2 rounded-full border-2 border-[var(--cream)]/60 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--cream)] hover:bg-[var(--cream)] hover:text-[var(--espresso)]"
              >
                Toutes les recettes
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev/Next */}
      <button
        onClick={prev}
        aria-label="Recette précédente"
        className="btn-squish absolute left-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-2 border-[var(--cream)]/40 bg-[var(--espresso)]/60 text-[var(--cream)] backdrop-blur hover:bg-[var(--caramel)] hover:border-[var(--caramel)] md:h-14 md:w-14"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={next}
        aria-label="Recette suivante"
        className="btn-squish absolute right-4 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border-2 border-[var(--cream)]/40 bg-[var(--espresso)]/60 text-[var(--cream)] backdrop-blur hover:bg-[var(--caramel)] hover:border-[var(--caramel)] md:h-14 md:w-14"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Pagination */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex items-center justify-center gap-2 px-4">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => go(idx)}
            aria-label={`Aller à la recette ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              idx === i ? "w-12 bg-[var(--caramel)]" : "w-2 bg-[var(--cream)]/40 hover:bg-[var(--cream)]/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
