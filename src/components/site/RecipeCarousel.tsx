import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Heart, Clock } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { Recipe } from "@/lib/recipes";
// Using id-based detail routes

export function RecipeCarousel({ recipes }: { recipes: Recipe[] }) {
  if (!recipes.length) return null;
  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      className="relative w-full"
    >
      <CarouselContent className="-ml-4">
        {recipes.map((r, i) => (
          <CarouselItem key={r.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ y: -8, rotate: 0.5 }}
              className="group h-full"
            >
              <Link
                to={`/recette/${r.id}`}
                className="block h-full cursor-pointer overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-warm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`Voir la recette : ${r.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {r.cover_image ? (
                    <img
                      src={r.cover_image}
                      alt={r.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-6xl">🍽️</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/90 to-transparent p-4">
                    <div className="flex items-center gap-3 text-xs font-semibold text-cream">
                      <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {r.views.toLocaleString("fr-FR")}</span>
                      <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-honey" /> {r.likes}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.prep_time + r.cook_time}'</span>
                    </div>
                  </div>
                  {r.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-warm)]">
                      ⭐ Coup de cœur
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                </div>
              </Link>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-3 h-12 w-12 border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground md:-left-6" />
      <CarouselNext className="-right-3 h-12 w-12 border-2 border-primary bg-card text-primary hover:bg-primary hover:text-primary-foreground md:-right-6" />
    </Carousel>
  );
}