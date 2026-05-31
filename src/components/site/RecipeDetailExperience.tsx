import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Flame,
  Lightbulb,
  ListChecks,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Users,
  ChefHat,
  ArrowDown,
} from "lucide-react";
import type { Ingredient, Instruction, Recipe } from "@/lib/recipes";
import { LikeButton } from "@/components/site/LikeButton";
import { CategoryImage } from "@/components/site/CategoryImage";
import { CHEF_CONTACT } from "@/lib/site-config";

const EASE = [0.22, 1, 0.36, 1] as const;

type ProgressState = {
  checked: Record<number, boolean>;
  steps: Record<number, boolean>;
  servings: number;
  cookMode: boolean;
  activeStep: number;
};

function loadProgress(slug: string, defaultServings: number): ProgressState {
  if (typeof window === "undefined") {
    return { checked: {}, steps: {}, servings: defaultServings, cookMode: false, activeStep: 0 };
  }
  try {
    const raw = sessionStorage.getItem(`recipe-progress-${slug}`);
    if (!raw) return { checked: {}, steps: {}, servings: defaultServings, cookMode: false, activeStep: 0 };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      checked: parsed.checked ?? {},
      steps: parsed.steps ?? {},
      servings: parsed.servings ?? defaultServings,
      cookMode: parsed.cookMode ?? false,
      activeStep: parsed.activeStep ?? 0,
    };
  } catch {
    return { checked: {}, steps: {}, servings: defaultServings, cookMode: false, activeStep: 0 };
  }
}

function saveProgress(slug: string, state: ProgressState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`recipe-progress-${slug}`, JSON.stringify(state));
}

function adjustQuantity(q: string, ratio: number): string {
  const n = parseFloat(q.replace(",", "."));
  if (Number.isNaN(n)) return q;
  const v = n * ratio;
  if (v === 0) return q;
  return v % 1 === 0 ? String(v) : v.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

function difficultyLabel(d: string): string {
  const map: Record<string, string> = {
    Facile: "Les yeux fermés",
    Moyen: "Un peu de concentration",
    Difficile: "On se concentre !",
  };
  return map[d] ?? d;
}

function normalizeIngredients(raw: Ingredient[] | unknown): Ingredient[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((i) => ({
    name: String((i as Ingredient).name ?? ""),
    quantity: String((i as Ingredient).quantity ?? ""),
    unit: String((i as Ingredient).unit ?? ""),
  }));
}

function normalizeInstructions(raw: Instruction[] | unknown): Instruction[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s, idx) => ({
    step: typeof (s as Instruction).step === "number" ? (s as Instruction).step : idx + 1,
    text: String((s as Instruction).text ?? ""),
  }));
}

export function RecipeDetailExperience({
  recipe,
  related = [],
}: {
  recipe: Recipe;
  related?: Recipe[];
}) {
  const ingredients = useMemo(() => normalizeIngredients(recipe.ingredients), [recipe.ingredients]);
  const instructions = useMemo(() => normalizeInstructions(recipe.instructions), [recipe.instructions]);
  const totalTime = recipe.prep_time + recipe.cook_time;

  const [progress, setProgress] = useState<ProgressState>(() =>
    loadProgress(recipe.slug, recipe.servings),
  );

  useEffect(() => {
    saveProgress(recipe.slug, progress);
  }, [recipe.slug, progress]);

  const ratio = progress.servings / recipe.servings;
  const checkedCount = ingredients.filter((_, i) => progress.checked[i]).length;
  const stepsDone = instructions.filter((_, i) => progress.steps[i]).length;
  const ingredientPct = ingredients.length ? Math.round((checkedCount / ingredients.length) * 100) : 0;
  const stepPct = instructions.length ? Math.round((stepsDone / instructions.length) * 100) : 0;
  const globalPct = Math.round((ingredientPct + stepPct) / 2);

  const pendingIndices = ingredients.map((_, i) => i).filter((i) => !progress.checked[i]);
  const doneIndices = ingredients.map((_, i) => i).filter((i) => progress.checked[i]);

  const update = useCallback((patch: Partial<ProgressState>) => {
    setProgress((p) => ({ ...p, ...patch }));
  }, []);

  const toggleIngredient = (i: number) => {
    setProgress((p) => ({
      ...p,
      checked: { ...p.checked, [i]: !p.checked[i] },
    }));
  };

  const toggleStep = (i: number) => {
    setProgress((p) => ({
      ...p,
      steps: { ...p.steps, [i]: !p.steps[i] },
    }));
  };

  const resetAll = () => {
    setProgress({
      checked: {},
      steps: {},
      servings: recipe.servings,
      cookMode: false,
      activeStep: 0,
    });
  };

  const markAllIngredients = () => {
    const all: Record<number, boolean> = {};
    ingredients.forEach((_, i) => { all[i] = true; });
    update({ checked: all });
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const activeInstruction = instructions[progress.activeStep];

  return (
    <article className="relative pb-28 md:pb-24">
      {/* Barre de progression lecture */}
      <motion.div
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-[var(--caramel)]"
      />

      {/* ========== HERO ========== */}
      <header className="relative isolate min-h-[78svh] overflow-hidden bg-[var(--espresso)] text-[var(--cream)]">
        {recipe.cover_image && (
          <motion.img
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
            src={recipe.cover_image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--espresso)] via-[var(--espresso)]/70 to-[var(--espresso)]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,160,86,0.25),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-5 pb-20 pt-28 md:px-10">
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cream)]/75"
          >
            <Link to="/" className="hover:text-[var(--caramel)]">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/carnet-de-recettes" className="hover:text-[var(--caramel)]">Carnet</Link>
            {recipe.category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link
                  to="/carnet-de-recettes/categorie/$slug"
                  params={{ slug: recipe.category.slug }}
                  className="text-[var(--caramel)]"
                >
                  {recipe.category.name}
                </Link>
              </>
            )}
          </motion.nav>

          {recipe.category && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--cream)]/25 bg-[var(--cream)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-6 w-6 overflow-hidden rounded-full">
                  <CategoryImage category={recipe.category} className="h-6 w-6" rounded="rounded-full" />
                </span>
                {recipe.category.name}
              </span>
            </motion.span>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
            className="mt-5 max-w-4xl font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-tight"
          >
            {recipe.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--cream)]/88 md:text-lg"
          >
            {recipe.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <LikeButton slug={recipe.slug} initial={recipe.likes} size="lg" />
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--cream)]/25 bg-[var(--cream)]/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Eye className="h-4 w-4" /> {recipe.views.toLocaleString("fr-FR")}
            </span>
            <button
              type="button"
              onClick={() => update({ cookMode: !progress.cookMode })}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                progress.cookMode
                  ? "bg-[var(--caramel)] text-[var(--espresso)] shadow-lg"
                  : "border border-[var(--cream)]/30 bg-[var(--cream)]/10 backdrop-blur hover:bg-[var(--cream)]/20"
              }`}
            >
              <ChefHat className="h-4 w-4" />
              {progress.cookMode ? "Mode lecture" : "Mode cuisine"}
            </button>
          </motion.div>

          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => scrollTo("recipe-intro")}
            className="mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--cream)]/70 hover:text-[var(--caramel)]"
          >
            Découvrir la recette <ArrowDown className="h-4 w-4 animate-bounce" />
          </motion.button>
        </div>
      </header>

      {/* Stats flottantes */}
      <section className="container relative z-20 mx-auto -mt-12 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid grid-cols-2 gap-3 rounded-[1.75rem] border-2 border-[var(--espresso)] bg-[var(--cream)] p-4 shadow-[8px_8px_0_0_var(--espresso)] md:grid-cols-4 md:p-6"
        >
          <StatPill icon={<Clock className="h-5 w-5" />} label="Préparation" value={`${recipe.prep_time} min`} />
          <StatPill icon={<Flame className="h-5 w-5" />} label="Cuisson" value={`${recipe.cook_time} min`} />
          <StatPill icon={<Users className="h-5 w-5" />} label="Portions" value={`${recipe.servings} pers.`} />
          <StatPill icon={<Sparkles className="h-5 w-5" />} label="Difficulté" value={difficultyLabel(recipe.difficulty)} />
        </motion.div>
      </section>

      {/* Bandeau progression globale */}
      <section className="container mx-auto mt-8 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border-2 border-[var(--espresso)]/15 bg-[var(--cream)] p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--caramel)]">Votre progression</p>
              <p className="mt-1 font-display text-2xl font-bold text-[var(--espresso)]">{globalPct}% de la recette</p>
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--espresso)]/20 px-4 py-2 text-xs font-semibold text-[var(--espresso)]/70 hover:border-[var(--caramel)] hover:text-[var(--caramel)]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Recommencer
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ProgressBar label="Ingrédients prêts" value={ingredientPct} count={`${checkedCount}/${ingredients.length}`} />
            <ProgressBar label="Étapes terminées" value={stepPct} count={`${stepsDone}/${instructions.length}`} />
          </div>
        </motion.div>
      </section>

      {/* Navigation ancres */}
      <nav className="sticky top-[var(--nav-height,4rem)] z-40 mt-8 border-y border-[var(--espresso)]/10 bg-[var(--cream)]/92 backdrop-blur-md">
        <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3 md:justify-center md:px-8">
          {[
            { id: "recipe-intro", label: "Introduction" },
            { id: "recipe-ingredients", label: "Ingrédients" },
            { id: "recipe-steps", label: "Préparation" },
            ...(recipe.astuces ? [{ id: "recipe-tips", label: "Astuces" }] : []),
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="shrink-0 rounded-full border-2 border-transparent bg-[var(--secondary)] px-4 py-2 text-xs font-bold text-[var(--espresso)] transition-colors hover:border-[var(--caramel)] hover:bg-[var(--caramel)]/10"
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="container mx-auto mt-12 grid gap-12 px-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0 space-y-14">
          {/* Introduction magazine */}
          <section id="recipe-intro" className="scroll-mt-36">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: EASE }}
              className="relative overflow-hidden rounded-[2rem] border-2 border-[var(--espresso)] bg-gradient-to-br from-[var(--cream)] to-[var(--secondary)] p-8 md:p-12"
            >
              <p className="font-hand text-3xl text-[var(--caramel)]">Avant de commencer —</p>
              <p className="mt-4 max-w-3xl text-lg leading-[1.85] text-[var(--espresso)]/90 md:text-xl">
                {recipe.description}
              </p>
              <ul className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-[var(--espresso)]">
                <li className="rounded-full bg-[var(--cream)] px-4 py-2 shadow-sm">⏱️ {totalTime} min au total</li>
                <li className="rounded-full bg-[var(--cream)] px-4 py-2 shadow-sm">🍽️ {instructions.length} étapes</li>
                <li className="rounded-full bg-[var(--cream)] px-4 py-2 shadow-sm">🧺 {ingredients.length} ingrédients</li>
              </ul>
              <p className="mt-6 text-sm text-[var(--espresso)]/65">
                Astuce Ludo : cochez chaque ingrédient une seule fois — ils disparaissent de la liste « à préparer » pour éviter les doublons en cuisine.
              </p>
            </motion.div>
          </section>

          {/* INGRÉDIENTS — liste intelligente */}
          <section id="recipe-ingredients" className="scroll-mt-36">
            <IngredientsPanel
              ingredients={ingredients}
              pendingIndices={pendingIndices}
              doneIndices={doneIndices}
              ratio={ratio}
              servings={progress.servings}
              baseServings={recipe.servings}
              onToggle={toggleIngredient}
              onServings={(n) => update({ servings: n })}
              onMarkAll={markAllIngredients}
            />
          </section>

          {/* ASTUCES */}
          {recipe.astuces && (
            <section id="recipe-tips" className="scroll-mt-36">
              <TipsBlock text={recipe.astuces} />
            </section>
          )}

          {/* ÉTAPES */}
          <section id="recipe-steps" className="scroll-mt-36">
            <StepsPanel
              instructions={instructions}
              stepsDone={progress.steps}
              onToggle={toggleStep}
              totalTime={totalTime}
            />
          </section>

          {/* Fin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border-2 border-[var(--espresso)] bg-[var(--gradient-warm)] p-10 text-center text-[var(--cream)] shadow-[8px_8px_0_0_var(--espresso)]"
          >
            <p className="font-hand text-4xl md:text-5xl">Bon appétit ! 🍴</p>
            <p className="mt-3 text-sm opacity-90">Vous avez tout suivi ? Bravo, chef !</p>
            <div className="mt-6">
              <LikeButton slug={recipe.slug} initial={recipe.likes} size="lg" />
            </div>
          </motion.div>

          {related.length > 0 && (
            <section>
              <p className="font-hand text-2xl text-[var(--caramel)]">Et ensuite ?</p>
              <h3 className="mt-1 font-display text-3xl font-bold text-[var(--espresso)]">D'autres recettes</h3>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.slice(0, 3).map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={`/recette/${p.id}`}
                      className="group block overflow-hidden rounded-2xl border-2 border-[var(--espresso)] bg-[var(--cream)] shadow-[4px_4px_0_0_var(--espresso)] transition-all hover:-translate-y-1"
                    >
                      {p.cover_image && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={p.cover_image}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <p className="line-clamp-2 font-display font-bold text-[var(--espresso)] group-hover:text-[var(--caramel)]">
                          {p.title}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-32 lg:self-start">
          <ChefCard />
          <SidebarProgress ingredientPct={ingredientPct} stepPct={stepPct} />
          {related.length > 0 && <RelatedSidebar items={related} currentSlug={recipe.slug} />}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--espresso)] bg-[var(--espresso)] py-3 text-sm font-semibold text-[var(--cream)] transition-transform hover:scale-[1.02]"
          >
            <Printer className="h-4 w-4" /> Imprimer
          </button>
        </aside>
      </div>

      {/* MODE CUISINE — plein écran étape par étape */}
      <AnimatePresence>
        {progress.cookMode && instructions.length > 0 && (
          <CookModeOverlay
            instruction={activeInstruction}
            index={progress.activeStep}
            total={instructions.length}
            stepsDone={progress.steps}
            pendingIngredients={pendingIndices.map((i) => ingredients[i])}
            ratio={ratio}
            onClose={() => update({ cookMode: false })}
            onPrev={() => update({ activeStep: Math.max(0, progress.activeStep - 1) })}
            onNext={() => update({ activeStep: Math.min(instructions.length - 1, progress.activeStep + 1) })}
            onCompleteStep={() => {
              if (!progress.steps[progress.activeStep]) toggleStep(progress.activeStep);
              if (progress.activeStep < instructions.length - 1) {
                update({ activeStep: progress.activeStep + 1 });
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Dock mobile progression */}
      <div className="fixed inset-x-4 bottom-4 z-50 lg:hidden">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl border-2 border-[var(--espresso)] bg-[var(--cream)]/95 p-3 shadow-[6px_6px_0_0_var(--espresso)] backdrop-blur-md"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--caramel)]">Progression</p>
            <p className="truncate text-sm font-bold text-[var(--espresso)]">{globalPct}% · {stepsDone}/{instructions.length} étapes</p>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]">
              <motion.div
                className="h-full rounded-full bg-[var(--caramel)]"
                animate={{ width: `${globalPct}%` }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => update({ cookMode: true })}
            className="shrink-0 rounded-xl bg-[var(--caramel)] px-4 py-3 text-xs font-bold text-[var(--espresso)]"
          >
            Cuisiner
          </button>
        </motion.div>
      </div>
    </article>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[var(--caramel)]/15 text-[var(--caramel)]">{icon}</div>
      <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--espresso)]/55">{label}</p>
      <p className="mt-0.5 font-display text-sm font-bold text-[var(--espresso)]">{value}</p>
    </div>
  );
}

function ProgressBar({ label, value, count }: { label: string; value: number; count: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-[var(--espresso)]/70">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--secondary)]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--caramel)] to-[#C54226]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      </div>
    </div>
  );
}

function IngredientsPanel({
  ingredients,
  pendingIndices,
  doneIndices,
  ratio,
  servings,
  baseServings,
  onToggle,
  onServings,
  onMarkAll,
}: {
  ingredients: Ingredient[];
  pendingIndices: number[];
  doneIndices: number[];
  ratio: number;
  servings: number;
  baseServings: number;
  onToggle: (i: number) => void;
  onServings: (n: number) => void;
  onMarkAll: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: EASE }}
      className="rounded-[2rem] border-2 border-[var(--espresso)] bg-[var(--cream)] p-6 shadow-[6px_6px_0_0_var(--espresso)] md:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-2xl text-[var(--caramel)]">Liste de courses —</p>
          <h2 className="mt-1 font-display text-4xl font-bold text-[var(--espresso)]">Ingrédients</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--espresso)]/70">
            <ListChecks className="h-4 w-4 text-[var(--sage)]" />
            Cochez une fois : l'ingrédient passe dans « Déjà préparé »
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PortionControl servings={servings} onChange={onServings} />
          <button
            type="button"
            onClick={onMarkAll}
            className="rounded-full border-2 border-[var(--espresso)] px-4 py-2 text-xs font-bold hover:bg-[var(--secondary)]"
          >
            Tout cocher
          </button>
        </div>
      </div>

      {pendingIndices.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--caramel)]">
            À préparer ({pendingIndices.length})
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {pendingIndices.map((i) => (
                <motion.li
                  key={`pending-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <IngredientRow
                    ing={ingredients[i]}
                    ratio={ratio}
                    checked={false}
                    onToggle={() => onToggle(i)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      {doneIndices.length > 0 && (
        <motion.div layout className="mt-8 rounded-2xl border border-[var(--sage)]/30 bg-[var(--sage)]/8 p-4">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--sage)]">
            <Check className="h-4 w-4" /> Déjà préparé ({doneIndices.length})
          </p>
          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {doneIndices.map((i) => (
                <motion.li
                  key={`done-${i}`}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <IngredientRow
                    ing={ingredients[i]}
                    ratio={ratio}
                    checked
                    onToggle={() => onToggle(i)}
                    compact
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}

      {servings !== baseServings && (
        <p className="mt-4 text-center text-xs text-[var(--espresso)]/55">
          Quantités ajustées pour {servings} personnes (recette de base : {baseServings})
        </p>
      )}
    </motion.div>
  );
}

function IngredientRow({
  ing,
  ratio,
  checked,
  onToggle,
  compact,
}: {
  ing: Ingredient;
  ratio: number;
  checked: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3 transition-all ${
        checked
          ? "border-[var(--sage)]/40 bg-[var(--sage)]/10 opacity-80"
          : "border-transparent bg-[var(--secondary)] hover:border-[var(--caramel)]/50 hover:shadow-sm"
      } ${compact ? "py-2" : ""}`}
    >
      <span
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-colors ${
          checked ? "border-[var(--sage)] bg-[var(--sage)] text-white" : "border-[var(--espresso)]/25 bg-[var(--cream)]"
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span className={`text-sm leading-relaxed ${checked ? "line-through text-[var(--espresso)]/50" : "text-[var(--espresso)]"}`}>
        <span className="font-bold text-[var(--caramel)]">
          {adjustQuantity(ing.quantity, ratio)} {ing.unit}
        </span>{" "}
        {ing.name}
      </span>
    </label>
  );
}

function PortionControl({ servings, onChange }: { servings: number; onChange: (n: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--espresso)] bg-[var(--cream)] px-2 py-1 shadow-[3px_3px_0_0_var(--espresso)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, servings - 1))}
        className="grid h-8 w-8 place-items-center rounded-full bg-[var(--espresso)] text-[var(--cream)]"
        aria-label="Moins de portions"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[4ch] text-center text-sm font-bold">{servings}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(50, servings + 1))}
        className="grid h-8 w-8 place-items-center rounded-full bg-[var(--espresso)] text-[var(--cream)]"
        aria-label="Plus de portions"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function StepsPanel({
  instructions,
  stepsDone,
  onToggle,
  totalTime,
}: {
  instructions: Instruction[];
  stepsDone: Record<number, boolean>;
  onToggle: (i: number) => void;
  totalTime: number;
}) {
  return (
    <div>
      <div className="text-center">
        <p className="font-hand text-2xl text-[var(--caramel)]">C'est parti —</p>
        <h2 className="mt-1 font-display text-4xl font-bold text-[var(--espresso)] md:text-5xl">Préparation</h2>
        <p className="mt-3 text-sm text-[var(--espresso)]/65">
          {totalTime} min · {instructions.length} étapes · Cliquez pour marquer comme fait
        </p>
      </div>

      <ol className="relative mt-12 space-y-0">
        <div aria-hidden className="absolute left-8 top-4 bottom-4 w-0.5 bg-[var(--caramel)]/25 md:left-10" />
        {instructions.map((step, idx) => {
          const done = !!stepsDone[idx];
          return (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: idx * 0.04, duration: 0.55, ease: EASE }}
              className="relative pb-8"
            >
              <button
                type="button"
                onClick={() => onToggle(idx)}
                className={`group flex w-full gap-5 rounded-3xl border-2 p-6 text-left transition-all md:gap-7 md:p-8 ${
                  done
                    ? "border-[var(--sage)]/40 bg-[var(--sage)]/8 opacity-75"
                    : "border-[var(--espresso)] bg-[var(--cream)] shadow-[5px_5px_0_0_var(--espresso)] hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_var(--espresso)]"
                }`}
              >
                <div className="relative z-10 shrink-0">
                  <motion.div
                    animate={done ? { scale: [1, 1.15, 1], backgroundColor: ["#8B9A7A", "#6d7d5c", "#8B9A7A"] } : {}}
                    className={`grid h-14 w-14 place-items-center rounded-2xl border-4 border-[var(--espresso)] font-display text-xl font-bold shadow-[3px_3px_0_0_var(--espresso)] ${
                      done ? "bg-[var(--sage)] text-white" : "bg-[var(--caramel)] text-[var(--cream)]"
                    }`}
                  >
                    {done ? <Check className="h-6 w-6" /> : step.step}
                  </motion.div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--caramel)]">
                    Étape {step.step}
                    {done && <span className="ml-2 text-[var(--sage)]">· Terminée</span>}
                  </p>
                  <p className={`mt-2 text-base leading-[1.85] md:text-lg ${done ? "text-[var(--espresso)]/55 line-through" : "text-[var(--espresso)]"}`}>
                    {step.text}
                  </p>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}

function TipsBlock({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-[2rem] border-4 border-[var(--espresso)] bg-gradient-to-br from-[#C54226] to-[#8C2E1A] p-8 text-[var(--cream)] shadow-[8px_8px_0_0_var(--espresso)] md:p-12"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          className="grid h-14 w-14 place-items-center rounded-2xl border-4 border-[var(--cream)] bg-[var(--cream)] text-[var(--espresso)]"
        >
          <Lightbulb className="h-7 w-7" />
        </motion.div>
        <div>
          <p className="font-hand text-2xl">Astuce du chef</p>
          <h2 className="font-display text-3xl font-bold">Le secret de Ludo</h2>
        </div>
      </div>
      <p className="mt-6 text-lg leading-[1.9] md:text-xl">« {text} »</p>
    </motion.div>
  );
}

function ChefCard() {
  return (
    <div className="rounded-2xl border-2 border-[var(--espresso)] bg-[var(--cream)] p-5 shadow-[4px_4px_0_0_var(--espresso)]">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--caramel)] text-xl">👨‍🍳</div>
        <div>
          <p className="font-display font-bold text-[var(--espresso)]">Ludo</p>
          <p className="text-xs text-[var(--espresso)]/60">{CHEF_CONTACT.location}</p>
        </div>
      </div>
      <a href={`mailto:${CHEF_CONTACT.email}`} className="mt-3 block text-sm font-semibold text-[var(--caramel)] hover:underline">
        {CHEF_CONTACT.email}
      </a>
    </div>
  );
}

function SidebarProgress({ ingredientPct, stepPct }: { ingredientPct: number; stepPct: number }) {
  return (
    <div className="rounded-2xl border-2 border-[var(--espresso)] bg-[var(--secondary)]/50 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--caramel)]">En cuisine</p>
      <div className="mt-4 space-y-3">
        <MiniRing label="Ingrédients" value={ingredientPct} />
        <MiniRing label="Étapes" value={stepPct} />
      </div>
    </div>
  );
}

function MiniRing({ label, value }: { label: string; value: number }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--secondary)" strokeWidth="6" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="var(--caramel)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * value) / 100 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </svg>
      <div>
        <p className="text-xs font-semibold text-[var(--espresso)]/60">{label}</p>
        <p className="font-display text-xl font-bold text-[var(--espresso)]">{value}%</p>
      </div>
    </div>
  );
}

function RelatedSidebar({ items, currentSlug }: { items: Recipe[]; currentSlug: string }) {
  const filtered = items.filter((p) => p.slug !== currentSlug).slice(0, 4);
  return (
    <div className="rounded-2xl border-2 border-[var(--espresso)] bg-[var(--cream)] p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--caramel)]">À découvrir</p>
      <ul className="mt-4 space-y-3">
        {filtered.map((p) => (
          <li key={p.id}>
            <Link to={`/recette/${p.id}`} className="group flex gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--secondary)]">
                {p.cover_image && (
                  <img src={p.cover_image} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
                )}
              </div>
              <p className="line-clamp-2 text-sm font-bold text-[var(--espresso)] group-hover:text-[var(--caramel)]">{p.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CookModeOverlay({
  instruction,
  index,
  total,
  stepsDone,
  pendingIngredients,
  ratio,
  onClose,
  onPrev,
  onNext,
  onCompleteStep,
}: {
  instruction: Instruction;
  index: number;
  total: number;
  stepsDone: Record<number, boolean>;
  pendingIngredients: Ingredient[];
  ratio: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onCompleteStep: () => void;
}) {
  const done = !!stepsDone[index];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--espresso)] text-[var(--cream)]"
    >
      <header className="flex items-center justify-between border-b border-[var(--cream)]/10 px-5 py-4">
        <button type="button" onClick={onClose} className="text-sm font-semibold text-[var(--cream)]/80 hover:text-[var(--caramel)]">
          ← Quitter le mode cuisine
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.2em]">
          Étape {index + 1} / {total}
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center px-5 py-8 md:px-16">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[var(--cream)] bg-[var(--caramel)] font-display text-3xl font-bold text-[var(--espresso)]">
            {instruction.step}
          </span>
          <p className="mt-8 font-display text-2xl leading-[1.75] md:text-3xl md:leading-[1.65]">{instruction.text}</p>
        </motion.div>

        {pendingIngredients.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-10 max-w-lg rounded-2xl border border-[var(--cream)]/20 bg-[var(--cream)]/5 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--caramel)]">Il vous reste à préparer</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--cream)]/85">
              {pendingIngredients.slice(0, 5).map((ing, i) => (
                <li key={i}>
                  · {adjustQuantity(ing.quantity, ratio)} {ing.unit} {ing.name}
                </li>
              ))}
              {pendingIngredients.length > 5 && (
                <li className="text-[var(--cream)]/50">… et {pendingIngredients.length - 5} autre(s)</li>
              )}
            </ul>
          </motion.div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-[var(--cream)]/10 p-5">
        <button
          type="button"
          disabled={index === 0}
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--cream)]/30 px-5 py-3 text-sm font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Précédent
        </button>
        <button
          type="button"
          onClick={onCompleteStep}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--caramel)] px-6 py-3 text-sm font-bold text-[var(--espresso)]"
        >
          <Check className="h-4 w-4" /> {done ? "Étape validée" : "J'ai terminé cette étape"}
        </button>
        <button
          type="button"
          disabled={index >= total - 1}
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--cream)]/30 px-5 py-3 text-sm font-semibold disabled:opacity-40"
        >
          Suivant <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </motion.div>
  );
}
