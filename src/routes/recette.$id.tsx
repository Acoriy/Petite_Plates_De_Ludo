import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Clock, Users, Check, Printer, Heart, ChefHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/lib/recipes";
import { getRecipeById, listPublishedRecipes } from "@/lib/recipes";
import { LikeButton } from "@/components/site/LikeButton";

export const Route = createFileRoute("/recette/$id")({
  loader: async ({ params }) => {
    const recipe = await getRecipeById(params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  component: RecipeDetailPage,
});

const containerVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, when: "beforeChildren" },
  },
};

const childFadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function RecipeDetailPage() {
  const { id } = Route.useParams();
  const { recipe: initial } = Route.useLoaderData() as { recipe: Recipe };

  const {
    data: recipe = initial,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => getRecipeById(id),
    initialData: initial,
  });

  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  // Recommendations
  const { data: recommendations = [], refetch: refetchRecs } = useQuery({
    queryKey: ["recs", recipe?.id],
    queryFn: async () => {
      if (!recipe?.category?.slug) return [];
      const list = await listPublishedRecipes({ limit: 6, categorySlug: recipe.category.slug });
      // remove current and pick 3
      return list.filter((r) => r.id !== recipe.id).slice(0, 3);
    },
    enabled: !!recipe?.id,
  });

  useEffect(() => {
    if (recipe) refetchRecs();
  }, [recipe?.id]);

  const ingredients = Array.isArray(recipe?.ingredients) ? recipe!.ingredients : [];
  const steps = Array.isArray(recipe?.instructions) ? recipe!.instructions : [];

  const toggle = (i: number) => setChecked((p) => ({ ...p, [i]: !p[i] }));

  if (isLoading)
    return <div className="container mx-auto py-24 text-center">Chargement de la recette…</div>;
  if (error || !recipe)
    return <div className="container mx-auto py-24 text-center">Recette introuvable.</div>;

  function printRecipe() {
    try {
      window.print();
    } catch (e) {
      // noop
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 print:text-black print:bg-white">
      {/* print helper to force BW and hide interactive elements */}
      <style>{`@media print { body { -webkit-print-color-adjust: exact; color-adjust: exact; } .no-print { display: none !important } @page { size: auto; margin: 20mm; } }`}</style>

      <motion.header variants={containerVariants} initial="hidden" animate="show" className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <motion.div variants={childFadeUp} className="space-y-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold leading-tight">
              {recipe.title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">{recipe.description}</p>
          </motion.div>

          <div className="ml-auto flex items-center gap-3 no-print">
            <button
              onClick={printRecipe}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50 transition print:hidden"
            >
              <Printer className="h-4 w-4" /> Imprimer la recette
            </button>
            <div className="hidden sm:block">
              <LikeButton slug={recipe.slug} initial={recipe.likes} size="md" />
            </div>
          </div>
        </div>

        <motion.div
          variants={childFadeUp}
          className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground items-center"
        >
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" /> {recipe.prep_time + recipe.cook_time} min
          </span>
          <span className="inline-flex items-center gap-2">
            <Users className="h-4 w-4" /> {recipe.servings} pers.
          </span>
          <span className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4" /> {recipe.likes} likes
          </span>
        </motion.div>
      </motion.header>

      <div className="grid gap-8 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-20 space-y-4">
            {recipe.cover_image && (
              <motion.img
                variants={childFadeUp}
                src={recipe.cover_image}
                alt={recipe.title}
                className="w-full rounded-2xl object-cover shadow-lg"
                loading="lazy"
              />
            )}

            <motion.div variants={childFadeUp} className="rounded-2xl border p-6 shadow bg-white">
              <h3 className="text-lg font-semibold">Ingrédients</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Mode cuisine — touchez pour cocher
              </p>

              <ul className="mt-4 space-y-3">
                {ingredients.map((ing, i) => (
                  <li key={i} className="relative">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggle(i)}
                      className="w-full flex items-center gap-3 cursor-pointer p-3 rounded-lg text-left bg-transparent"
                    >
                      <motion.span
                        layout
                        initial={false}
                        animate={
                          checked[i]
                            ? { backgroundColor: "#0ea5a4", borderColor: "#0ea5a4" }
                            : { backgroundColor: "transparent", borderColor: "#d1d5db" }
                        }
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md border flex-shrink-0`}
                      >
                        <AnimatePresence>
                          {checked[i] ? (
                            <motion.span
                              initial={{ scale: 0.6, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.6, opacity: 0 }}
                            >
                              <Check className="h-4 w-4 text-white" />
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </motion.span>

                      <div className="flex-1">
                        <motion.div
                          className="relative overflow-hidden"
                          initial={false}
                          animate={{ opacity: checked[i] ? 0.4 : 1 }}
                        >
                          <div
                            className={`text-sm font-medium leading-relaxed ${checked[i] ? "line-through opacity-40" : ""}`}
                          >
                            {ing.quantity ? `${ing.quantity} ${ing.unit ?? ""} ` : ""}
                            <span className="ml-1">{ing.name}</span>
                          </div>
                          {/* Strike bar animated */}
                          <motion.span
                            aria-hidden
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: checked[i] ? 1 : 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{ transformOrigin: "left center" }}
                            className="absolute left-0 top-1/2 h-[2px] w-full bg-current transform origin-left text-black"
                          />
                        </motion.div>
                      </div>
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>

            <div className="no-print">
              <button
                onClick={printRecipe}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <Printer className="h-4 w-4" /> Imprimer
              </button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-8 lg:col-span-9">
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <section className="prose max-w-none">
              <motion.h2
                variants={childFadeUp}
                className="mt-2 text-2xl font-display font-semibold"
              >
                Préparation
              </motion.h2>

              <ol className="mt-6 space-y-6">
                {steps.map((s, idx) => (
                  <motion.li
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 18 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                    }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className={`group relative flex flex-col gap-3 rounded-lg p-4 transition-all ${currentStep === idx ? "ring-2 ring-emerald-200 bg-emerald-50" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => setCurrentStep(idx)}
                        className="flex items-center gap-3 focus:outline-none no-print"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 text-2xl font-handwritten transition-transform duration-200 ${currentStep === idx ? "ring-4 ring-emerald-200 scale-105" : ""}`}
                        >
                          {idx + 1}
                        </div>
                      </button>

                      <div>
                        <div className="text-base font-medium leading-snug">
                          {(s as any).text ?? s}
                        </div>
                        {(s as any).image ? (
                          <img
                            src={(s as any).image}
                            alt={`Etape ${idx + 1}`}
                            className="mt-3 max-h-72 w-full object-cover rounded-md shadow-sm"
                          />
                        ) : null}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </section>

            {recipe.astuces || (recipe as any).chef_notes ? (
              <motion.section
                variants={childFadeUp}
                className="mt-8 rounded-2xl border p-6 bg-yellow-50"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--caramel)] text-white">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Conseils du chef</h3>
                    <div className="mt-2 text-sm">
                      {(recipe as any).chef_notes ?? recipe.astuces}
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : null}

            {/* You may also like */}
            <motion.section variants={childFadeUp} className="mt-12">
              <h3 className="text-xl font-semibold">Vous aimerez aussi...</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((r) => (
                  <article key={r.id} className="rounded-lg border overflow-hidden bg-white">
                    <a href={`/recette/${r.id}`} className="block">
                      {r.cover_image ? (
                        <img
                          src={r.cover_image}
                          alt={r.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="h-40 w-full bg-slate-100" />
                      )}
                      <div className="p-3">
                        <h4 className="text-sm font-semibold">{r.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {r.category?.name ?? ""}
                        </p>
                      </div>
                    </a>
                  </article>
                ))}
              </div>
            </motion.section>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
