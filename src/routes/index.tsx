import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Eye, Heart, Facebook, Mail, Instagram } from "lucide-react";
import { listPublishedRecipes, listCategories, type Recipe, type Category } from "@/lib/recipes";
import { funnyBadge } from "@/lib/mock-recipes";
import { CategoryImage } from "@/components/site/CategoryImage";
import { FullHero } from "@/components/site/FullHero";
import ludoPortrait from "@/assets/ludo-portrait.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Les Petits Plats de Ludo — Cuisine généreuse, esprit chic" },
      {
        name: "description",
        content:
          "Recettes signature de Ludo : éditorial, gourmand, généreux. Une cuisine racontée comme un magazine gastronomique.",
      },
      { property: "og:title", content: "Les Petits Plats de Ludo" },
      {
        property: "og:description",
        content: "Cuisine généreuse, esprit chic. Les recettes signature de Ludo.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

/* ---------------- ANIMATIONS ---------------- */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ---------------- PAGE ---------------- */
function HomePage() {
  const { data: featured = [] } = useQuery({
    queryKey: ["recipes", "featured"],
    queryFn: () => listPublishedRecipes({ featured: true, limit: 8 }),
  });
  const { data: latest = [] } = useQuery({
    queryKey: ["recipes", "latest"],
    queryFn: () => listPublishedRecipes({ limit: 12 }),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: listCategories });

  const featuredPool = featured.length > 0 ? featured : latest.filter((r) => r.featured);
  const heroRecipes = (
    featuredPool.length >= 8
      ? featuredPool
      : [...featuredPool, ...latest.filter((r) => !featuredPool.some((f) => f.id === r.id))]
  ).slice(0, 8);

  return (
    <>
      <FullHero recipes={heroRecipes} />

      {/* MAIN GRID — main column + sticky sidebar */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
            <div className="min-w-0 space-y-20">
              {categories.length > 0 && <BentoCategories categories={categories.slice(0, 5)} />}
              <LatestRecipes recipes={latest.slice(0, 6)} />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <CommunityCard />
              <RencontreCard />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}

/* ============== SIDEBAR — COMMUNAUTÉ ============== */
function CommunityCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE_OUT }}
      className="card-grimoire p-6"
    >
      <p className="font-hand text-2xl text-[var(--caramel)]">★ Rejoins ma communauté ★</p>
      <h3 className="mt-1 font-display text-2xl font-bold leading-tight text-[var(--espresso)]">
        On se retrouve <em className="text-[var(--caramel)]">à table ?</em>
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--espresso)]/75">
        Des photos qui font saliver, des bêtises en cuisine, et zéro régime miracle. Promis juré,
        craché (dans l'évier).
      </p>

      <div className="mt-5 space-y-2.5">
        <a
          href="https://www.facebook.com/people/les-petits-plats-de-ludo/61565572954499/"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between rounded-xl border-2 border-[var(--espresso)] bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-[var(--espresso)] shadow-[3px_3px_0_0_var(--espresso)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--espresso)]"
        >
          <span className="inline-flex items-center gap-2.5">
            <Facebook className="h-4 w-4" /> Facebook
          </span>
          <span className="font-hand text-base text-[var(--caramel)]">Viens jaser →</span>
        </a>
        <a
          href="#"
          className="group flex items-center justify-between rounded-xl border-2 border-[var(--espresso)] bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-[var(--espresso)] shadow-[3px_3px_0_0_var(--espresso)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--espresso)]"
        >
          <span className="inline-flex items-center gap-2.5">
            <Instagram className="h-4 w-4" /> Instagram
          </span>
          <span className="font-hand text-base text-[var(--caramel)]">Mate la déco →</span>
        </a>
        <a
          href="mailto:ludo@example.com"
          className="group flex items-center justify-between rounded-xl border-2 border-[var(--espresso)] bg-[var(--cream)] px-4 py-3 text-sm font-semibold text-[var(--espresso)] shadow-[3px_3px_0_0_var(--espresso)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--espresso)]"
        >
          <span className="inline-flex items-center gap-2.5">
            <Mail className="h-4 w-4" /> Newsletter
          </span>
          <span className="font-hand text-base text-[var(--caramel)]">M'écrire →</span>
        </a>
      </div>
    </motion.div>
  );
}

/* ============== SIDEBAR — RENCONTRE ============== */
function RencontreCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
      className="relative overflow-hidden rounded-[1.75rem] bg-[var(--espresso)] p-6 text-[var(--cream)] shadow-[var(--shadow-deep)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--caramel)]/25 blur-3xl"
      />

      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--caramel)]">★ Rencontre ★</p>

      <div className="mt-4 overflow-hidden rounded-2xl border-2 border-[var(--cream)]/20">
        <img
          src={ludoPortrait}
          alt="Portrait de Ludo"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>

      <blockquote className="relative mt-5 font-display text-xl font-bold leading-snug">
        « Je cuisine comme on raconte une <em className="text-[var(--caramel)]">bonne histoire</em>.
        »
      </blockquote>
      <p className="mt-3 text-sm leading-relaxed text-[var(--cream)]/75">
        Autodidacte, gourmand, jamais avare d'un calembour devant un four.
      </p>

      <Link
        to="/qui-suis-je"
        className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cream)] underline-offset-8 hover:text-[var(--caramel)] hover:underline"
      >
        Qui suis-je ? <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

/* ============== BENTO CATEGORIES ============== */
function BentoCategories({ categories }: { categories: Category[] }) {
  // Bento layout — 5 tuiles asymétriques
  const layouts = [
    "md:col-span-2 md:row-span-2", // big
    "md:col-span-2 md:row-span-1",
    "md:col-span-1 md:row-span-1",
    "md:col-span-1 md:row-span-2",
    "md:col-span-2 md:row-span-1",
  ];

  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8">
        <SectionKicker
          eyebrow="L'index"
          title="Par envie du moment"
          intro="Trois familles, un seul mot d'ordre : se régaler avec goût."
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-4 md:grid-cols-4 md:gap-5"
        >
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              variants={fadeUp}
              className={`group relative ${layouts[i] ?? "md:col-span-1 md:row-span-1"}`}
            >
              <Link
                to="/carnet-de-recettes/categorie/$slug"
                params={{ slug: c.slug }}
                className="relative block h-full w-full overflow-hidden rounded-[1.75rem] bg-[var(--secondary)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-deep)]"
              >
                <CategoryImage
                  category={c}
                  className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  rounded="rounded-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/90 via-[var(--espresso)]/20 to-transparent" />

                {/* Glass label */}
                <div className="absolute inset-x-5 bottom-5 rounded-2xl glass-dark p-4 text-[var(--cream)] transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl font-bold leading-none md:text-3xl">
                        {c.name}
                      </p>
                      {c.description && (
                        <p className="mt-1.5 line-clamp-1 text-xs text-[var(--cream)]/80">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--cream)] text-[var(--espresso)] transition-transform duration-500 group-hover:rotate-45">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============== LATEST GRID ============== */
function LatestRecipes({ recipes }: { recipes: Recipe[] }) {
  return (
    <section className="relative bg-[var(--secondary)] py-24 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--cream)] to-transparent"
      />
      <div className="container relative mx-auto px-4 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionKicker
            align="left"
            eyebrow="Le journal"
            title="Dernières recettes"
            intro="Les nouveautés qui font frémir mes carnets."
          />
          <Link
            to="/carnet-de-recettes"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--espresso)] underline-offset-8 hover:underline"
          >
            Toutes les recettes
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {recipes.length === 0 ? (
          <p className="mt-14 text-center text-[var(--espresso)]/70">
            Aucune recette publiée pour le moment. Ajoutez-en depuis le dashboard Ludo.
          </p>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="mt-14 grid gap-7 md:grid-cols-2 lg:grid-cols-3"
          >
            {recipes.map((r) => {
              const fb = funnyBadge(r.slug);
              const stickerCls =
                fb.tone === "tomato"
                  ? "sticker--tomato"
                  : fb.tone === "slate"
                    ? "sticker--slate"
                    : "sticker--sage";
              return (
                <motion.article
                  key={r.id}
                  variants={fadeUp}
                  whileHover={{ y: -8, rotate: -0.4 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="h-full"
                >
                  <Link
                    to={`/recette/${r.id}`}
                    className="group flex h-full cursor-pointer flex-col card-grimoire overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--caramel)]"
                    aria-label={`Voir la recette : ${r.title}`}
                  >
                    <div className="relative aspect-[4/5] shrink-0 overflow-hidden bg-[var(--muted)]">
                      {r.cover_image ? (
                        <img
                          src={r.cover_image}
                          alt={r.title}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-7xl">🍽️</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--espresso)]/55 via-transparent to-transparent" />

                      {/* badges top — flex-wrap pour gérer les textes longs proprement */}
                      <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
                        {r.category ? (
                          <span className="inline-flex max-w-[70%] items-center gap-2 rounded-full border-2 border-[var(--espresso)] bg-[var(--cream)] py-1 pl-1 pr-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--espresso)] shadow-[3px_3px_0_0_var(--espresso)]">
                            <span className="h-6 w-6 shrink-0 overflow-hidden rounded-full">
                              <CategoryImage
                                category={r.category}
                                className="h-6 w-6"
                                rounded="rounded-full"
                              />
                            </span>
                            <span className="truncate">{r.category.name}</span>
                          </span>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`sticker ${stickerCls} max-w-[55%] whitespace-normal break-words text-right leading-tight`}
                        >
                          {fb.label}
                        </span>
                      </div>

                      {/* bottom meta — flex-wrap pour ne jamais casser la carte */}
                      <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl border-2 border-[var(--espresso)] bg-[var(--cream)] px-3 py-2 text-[11px] font-semibold text-[var(--espresso)] shadow-[3px_3px_0_0_var(--espresso)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-[var(--caramel)]" />{" "}
                          {r.prep_time + r.cook_time}'
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-[var(--slate)]" />{" "}
                          {r.views.toLocaleString("fr-FR")}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-[var(--caramel)]" /> {r.likes}
                        </span>
                      </div>
                    </div>

                    {/* Contenu : flex-col + justify-between => titre+desc en haut, lien aligné en bas */}
                    <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-display text-2xl font-bold leading-tight text-[var(--espresso)] transition-colors group-hover:text-[var(--caramel)]">
                          {r.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--espresso)]/75">
                          {r.description}
                        </p>
                      </div>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--caramel)]">
                        Voir la recette{" "}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ============== UI BLOCKS ============== */
function SectionKicker({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  const cls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
      className={`${cls} max-w-3xl px-4 sm:px-6`}
    >
      <p className="text-xs uppercase tracking-[0.35em] text-[var(--caramel)]">— {eyebrow} —</p>
      <h2 className="mt-4 font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-[var(--espresso)]">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 text-sm sm:text-base md:text-lg leading-relaxed text-[var(--espresso)]/75 max-w-xl mx-auto">
          {intro}
        </p>
      )}
    </motion.div>
  );
}
