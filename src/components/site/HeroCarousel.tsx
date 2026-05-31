import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Clock, Eye, Heart, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import type { Recipe } from "@/lib/recipes";
import { CategoryImage } from "@/components/site/CategoryImage";

/**
 * Carrousel hero ultra-interactif :
 * - Auto-play doux (pausable)
 * - Drag horizontal (Framer Motion)
 * - Compteurs vues / likes en temps réel (state local)
 * - layoutId partagé avec la page détail pour transition fluide
 */
export function HeroCarousel({ recipes }: { recipes: Recipe[] }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const didDragRef = useRef(false);
  const slides = useMemo(() => recipes.filter((r) => r.cover_image).slice(0, 5), [recipes]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [stats, setStats] = useState<Record<string, { views: number; likes: number; liked: boolean }>>({});

  // Initialise les stats depuis les recettes
  useEffect(() => {
    setStats((prev) => {
      const next = { ...prev };
      slides.forEach((s) => {
        if (!next[s.id]) next[s.id] = { views: s.views, likes: s.likes, liked: false };
      });
      return next;
    });
  }, [slides]);

  // Auto-play
  useEffect(() => {
    if (slides.length < 2 || paused || reduce) return;
    const t = setInterval(() => {
      setDir(1);
      setI((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length, paused, reduce]);

  // Incrémente les vues quand un slide devient visible
  useEffect(() => {
    const id = slides[i]?.id;
    if (!id) return;
    const t = setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? { views: 0, likes: 0, liked: false }), views: (prev[id]?.views ?? 0) + 1 },
      }));
    }, 800);
    return () => clearTimeout(t);
  }, [i, slides]);

  if (!slides.length) {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-[var(--secondary)] grid place-items-center text-6xl shadow-[var(--shadow-deep)]">
        🍳
      </div>
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

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setStats((prev) => {
      const cur = prev[current.id] ?? { views: current.views, likes: current.likes, liked: false };
      return {
        ...prev,
        [current.id]: {
          ...cur,
          liked: !cur.liked,
          likes: cur.liked ? cur.likes - 1 : cur.likes + 1,
        },
      };
    });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Stack */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-[var(--espresso)] shadow-[var(--shadow-deep)]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={current.id}
            custom={dir}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragStart={() => { didDragRef.current = false; }}
            onDrag={(_, info) => {
              if (Math.abs(info.offset.x) > 8 || Math.abs(info.offset.y) > 8) didDragRef.current = true;
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80 || info.velocity.x < -400) next();
              else if (info.offset.x > 80 || info.velocity.x > 400) prev();
            }}
            onClick={() => {
              if (!didDragRef.current) navigate(`/recette/${current.id}`);
            }}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(`/recette/${current.id}`);
              }
            }}
            aria-label={`Voir la recette : ${current.title}`}
            initial={{ opacity: 0, scale: 1.05, x: dir * 60 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, x: dir * -60 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 cursor-pointer active:cursor-grabbing"
          >
            <motion.img
              layoutId={`recipe-cover-${current.slug}`}
              src={current.cover_image ?? ""}
              alt={current.title}
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/85 via-[var(--espresso)]/15 to-transparent" />

            {/* Catégorie */}
            {current.category && (
              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[var(--cream)]/95 py-1 pl-1 pr-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--espresso)] shadow-md">
                <span className="h-7 w-7 overflow-hidden rounded-full">
                  <CategoryImage category={current.category} className="h-7 w-7" rounded="rounded-full" />
                </span>
                {current.category.name}
              </span>
            )}

            {/* Badge featured */}
            {current.featured && (
              <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-[var(--caramel)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cream)] shadow-md">
                <Flame className="h-3 w-3" /> Phare
              </span>
            )}

            {/* Carte info */}
            <motion.div
              key={`info-${current.id}`}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="absolute inset-x-5 bottom-5"
            >
              <Link
                to={`/recette/${current.id}`}
                className="relative z-10 block rounded-2xl bg-[var(--cream)]/96 p-5 shadow-xl backdrop-blur transition-transform hover:-translate-y-1"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="font-hand text-base text-[var(--caramel)]">Recette à la une</p>
                <h3 className="mt-1 line-clamp-2 font-display text-2xl font-bold leading-tight text-[var(--espresso)]">
                  {current.title}
                </h3>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-[var(--espresso)]/80">
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Clock className="h-3.5 w-3.5 text-[var(--caramel)]" />
                    {current.prep_time + current.cook_time} min
                  </span>
                  <motion.span
                    key={`v-${live.views}`}
                    initial={{ scale: 0.9, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5 text-[var(--sage)]" />
                    {live.views.toLocaleString("fr-FR")}
                  </motion.span>
                  <button
                    onClick={toggleLike}
                    aria-label={live.liked ? "Retirer le like" : "Liker cette recette"}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                      live.liked ? "bg-[var(--caramel)]/15 text-[var(--caramel)]" : "hover:bg-[var(--secondary)]"
                    }`}
                  >
                    <motion.span animate={live.liked ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                      <Heart className={`h-3.5 w-3.5 ${live.liked ? "fill-[var(--caramel)] text-[var(--caramel)]" : "text-[var(--caramel)]"}`} />
                    </motion.span>
                    <motion.span key={`l-${live.likes}`} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-semibold">
                      {live.likes.toLocaleString("fr-FR")}
                    </motion.span>
                  </button>
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        <button
          onClick={prev}
          aria-label="Précédent"
          className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[var(--cream)]/90 text-[var(--espresso)] shadow-md backdrop-blur transition-transform hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Suivant"
          className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[var(--cream)]/90 text-[var(--espresso)] shadow-md backdrop-blur transition-transform hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => go(idx)}
            aria-label={`Aller à la recette ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? "w-10 bg-[var(--caramel)]" : "w-2 bg-[var(--espresso)]/25 hover:bg-[var(--espresso)]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
