import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Recipe } from "@/lib/recipes";
import { recipeDetailLink } from "@/lib/recipe-routes";
import { LikeButton } from "./LikeButton";

export function RecipeCard({ recipe, index = 0 }: { recipe: Recipe; index?: number }) {
  if (!recipe.slug) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -6 }}
      className="h-full"
    >
        <Link
          to={`/recette/${recipe.id}`}
        className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-warm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Voir la recette : ${recipe.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {recipe.cover_image ? (
            <img
              src={recipe.cover_image}
              alt={recipe.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-6xl">🍽️</div>
          )}
          {recipe.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-warm)]">
              ⭐ Coup de cœur
            </span>
          )}
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
            {recipe.difficulty}
          </span>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/80 to-transparent px-4 py-6 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cream">Voir la recette →</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
            {recipe.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{recipe.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>⏱️</span> {recipe.prep_time + recipe.cook_time} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>🍽️</span> {recipe.servings} pers.
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden>👁️</span> {recipe.views}
            </span>
          </div>
        </div>

        <div className="relative z-10 px-5 pb-5">
          <LikeButton slug={recipe.slug} initial={recipe.likes} size="sm" />
        </div>
      </Link>
    </motion.div>
  );
}
